/**
 * FOTOS PROVISÓRIAS — baixa imagens de licença livre para os slots do documento de
 * parcerias, enquanto as fotos reais da operação não chegam.
 *
 *   node artes/ferramentas/fotos-provisorias.mjs
 *
 * Elas existem só para o documento não circular com buracos: entram dessaturadas,
 * ficam marcadas como `"provisoria": true` no JSON e os créditos vão para
 * artes/fotos/CREDITOS.md. Ao receber as fotos do Desbravando, troque o caminho no
 * JSON e remova a marca.
 *
 * Fonte: Wikimedia Commons (API aberta, sem chave). O Openverse foi descartado — o
 * acesso anônimo estoura em poucas requisições (HTTP 429).
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
const fotos = join(artes, "fotos");
const UA = { "User-Agent": "DesbravandoArtes/1.0 (uso interno; contato via desbravandoutv.com)" };

/** slot no JSON → termos a tentar em ordem, e como a imagem será usada */
const ALVOS = [
  {
    campo: "capa",
    buscas: ["off-road vehicle dunes", "dune buggy desert", "UTV side by side vehicle", "4x4 desert track"],
    paisagem: true,
    descricao: "Foto de abertura · comboio de UTVs na expedição, plano aberto",
  },
  {
    campo: "fotoOperacao",
    buscas: ["buggy sand dunes", "off-road vehicle desert track", "4x4 vehicles desert convoy", "dune buggy beach"],
    paisagem: false,
    descricao: "Foto da operação · equipe Desbravando em campo",
  },
  {
    campo: "territorio.foto",
    buscas: ["mechanic repairing engine", "car mechanic workshop", "engine repair hands", "auto repair garage"],
    paisagem: false,
    descricao: "Foto real · equipe mecânica trabalhando no UTV",
  },
  {
    campo: "casos.0.foto",
    buscas: ["vehicle stuck sand", "off-road recovery winch", "car bogged sand dune", "4x4 mud recovery"],
    paisagem: true,
    descricao: "Caso · resgate do carro em Jericoacoara",
  },
  {
    campo: "casos.1.foto",
    buscas: ["beach dunes sunset", "coastal sand dunes", "dunes ocean landscape", "sand dunes beach"],
    paisagem: true,
    descricao: "Caso · restaurante nas dunas",
  },
  {
    campo: "casos.2.foto",
    buscas: ["sunrise sand dunes", "sunrise desert landscape", "dawn dunes"],
    paisagem: true,
    descricao: "Caso · nascer do sol na expedição",
  },
  {
    campo: "encerramento",
    buscas: ["sand dunes sunset", "dirt road sunset landscape", "desert dusk dunes", "savanna sunset track"],
    paisagem: true,
    descricao: "Foto de encerramento · fim de dia na trilha",
  },
];

const semTags = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/* O Commons é cheio de acervo histórico digitalizado — uma foto de multidão de 1920
   destrói o clima da peça. Barra por título e pela data original quando existir. */
const ARQUIVO_HISTORICO =
  /(archive|arquivo|collection|coleç|bundesarchiv|tropenmuseum|nationaal|library of congress|\bloc\b|museum|museu|historic|história|history|1[89]\d\d|19[0-5]\d|postcard|cartão.postal|engraving|lithograph|painting|pintura|oil on canvas|canvas|watercolor|drawing|sketch|illustration)/i;

/**
 * Exige data de captura recente — não é preciosismo: sem isso entram pinturas do
 * século XIX e scans de acervo, que passam pelo filtro de título e destroem a peça.
 * Foto digital moderna praticamente sempre traz DateTimeOriginal.
 */
function fotografiaModerna(info) {
  const meta = info.extmetadata ?? {};
  const data = semTags(meta.DateTimeOriginal?.value);
  const ano = Number(data.match(/(19|20)\d{2}/)?.[0]);
  if (!ano || ano < 2005) return false;
  const tipo = semTags(meta.ObjectName?.value) + " " + semTags(meta.ImageDescription?.value);
  return !ARQUIVO_HISTORICO.test(tipo);
}
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * A Wikimedia corta rajada ("You are making too many requests") e devolve texto puro,
 * não JSON. Daí o ritmo de ~1 req/s e o backoff — sem isso o script "não acha nada"
 * quando na verdade está apanhando do rate limit.
 */
async function pegarJson(url, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    await pausa(i === 0 ? 1100 : 4000 * i);
    const r = await fetch(url, { headers: UA });
    const texto = await r.text();
    try {
      return JSON.parse(texto);
    } catch {
      console.log(`    (rate limit — nova tentativa em ${4 * (i + 1)}s)`);
    }
  }
  return null;
}

async function buscarCommons(termos, paisagem, usados) {
  for (const termo of termos) {
    const url =
      "https://commons.wikimedia.org/w/api.php?" +
      new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrnamespace: "6",
        gsrsearch: `filetype:bitmap ${termo}`,
        gsrlimit: "30",
        prop: "imageinfo",
        iiprop: "url|size|extmetadata",
        iiurlwidth: "2200",
      });
    const dados = await pegarJson(url);
    if (!dados) continue;
    const paginas = Object.values(dados?.query?.pages ?? {});
    const bons = paginas
      .map((p) => ({ titulo: p.title, info: p.imageinfo?.[0] }))
      // a extensão vem do título: info.url carrega querystring e nunca casaria com /\.jpg$/
      .filter((x) => x.info?.thumburl && /\.(jpe?g|png)$/i.test(x.titulo))
      .filter((x) => x.info.width >= 1400 && x.info.height >= 800)
      .filter((x) => (paisagem ? x.info.width > x.info.height : x.info.width > x.info.height * 0.6))
      .filter((x) => !usados.has(x.titulo))
      .filter((x) => !ARQUIVO_HISTORICO.test(x.titulo) && fotografiaModerna(x.info))
      .sort((a, b) => b.info.width * b.info.height - a.info.width * a.info.height);
    if (bons.length) return { ...bons[0], termo };
  }
  return null;
}

function porCaminho(obj, caminho) {
  const partes = caminho.split(".");
  const alvo = partes.slice(0, -1).reduce((o, p) => o?.[p], obj);
  return [alvo, partes.at(-1)];
}

const dadosPath = join(artes, "dados", "parcerias-apoio-mecanico.json");
const dados = JSON.parse(readFileSync(dadosPath, "utf8"));
mkdirSync(fotos, { recursive: true });

/** `--slot=casos.1.foto` refaz só um slot (útil quando um download apanha do rate limit). */
const soEsse = process.argv.find((a) => a.startsWith("--slot="))?.split("=")[1];
const usados = new Set();

for (const alvo of ALVOS.filter((a) => !soEsse || a.campo === soEsse)) {
  const achado = await buscarCommons(alvo.buscas, alvo.paisagem, usados);
  if (!achado) {
    console.log(`  ! nada em: ${alvo.buscas.join(" / ")} — ${alvo.campo} segue vazio`);
    continue;
  }
  const { titulo, info, termo } = achado;
  usados.add(titulo);

  const meta = info.extmetadata ?? {};
  const licenca = semTags(meta.LicenseShortName?.value) || "ver página";
  const autor = semTags(meta.Artist?.value) || "não informado";

  const nome = `provisoria-${alvo.campo.replace(/\./g, "-")}.jpg`;
  await pausa(900);
  const bin = await fetch(info.thumburl, { headers: UA });
  if (!bin.ok) {
    console.log(`  ! download falhou (${bin.status}) em ${alvo.campo}`);
    continue;
  }
  writeFileSync(join(fotos, nome), Buffer.from(await bin.arrayBuffer()));

  const [obj, chave] = porCaminho(dados, alvo.campo);
  obj[chave] = {
    arquivo: `fotos/${nome}`,
    descricao: alvo.descricao,
    provisoria: true,
    credito: `${titulo.replace(/^File:/, "")} · ${autor} · ${licenca}`,
    fonte: `https://commons.wikimedia.org/wiki/${encodeURIComponent(titulo)}`,
  };
  console.log(`  ${alvo.campo.padEnd(18)} ${String(info.width).padStart(5)}×${String(info.height).padEnd(5)} ${licenca.padEnd(16)} "${termo}"`);
}

writeFileSync(dadosPath, JSON.stringify(dados, null, 2) + "\n", "utf8");

/* Créditos saem do JSON, não da rodada: assim rodar um slot sozinho não apaga o resto. */
const creditos = ALVOS.map((alvo) => {
  const [obj, chave] = porCaminho(dados, alvo.campo);
  const slot = obj?.[chave];
  if (!slot?.provisoria) return null;
  return (
    `- **${alvo.campo}** — [${slot.credito.split(" · ")[0]}](${slot.fonte ?? "#"})\n` +
    `  ${slot.credito.split(" · ").slice(1).join(" · ")}\n` +
    `  arquivo: \`${slot.arquivo}\``
  );
}).filter(Boolean);

writeFileSync(
  join(fotos, "CREDITOS.md"),
  [
    "# Fotos provisórias",
    "",
    "Estas imagens **não são da operação do Desbravando**. Entraram só para o documento de",
    "parcerias não circular com espaços vazios, e devem sair assim que as fotos reais chegarem:",
    "troque o caminho em `dados/parcerias-*.json` e remova `\"provisoria\": true`.",
    "",
    "Fonte: Wikimedia Commons. Enquanto estiverem na peça, as licenças abaixo valem — as",
    "CC-BY / CC-BY-SA exigem crédito visível se o documento for publicado.",
    "",
    ...creditos,
    "",
  ].join("\n"),
  "utf8"
);

console.log(`\n${creditos.length}/${ALVOS.length} slots preenchidos · créditos em artes/fotos/CREDITOS.md`);
