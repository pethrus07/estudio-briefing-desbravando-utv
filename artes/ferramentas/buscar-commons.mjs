/**
 * Busca imagens de licença livre no Wikimedia Commons e baixa candidatas para
 * escolha manual — usado para achar a base fotográfica do mockup.
 *
 *   node artes/ferramentas/buscar-commons.mjs --q="black t-shirt" --dest=mockup/base --n=6
 *
 * Ritmo de ~1 req/s: a Wikimedia corta rajada e devolve texto em vez de JSON.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
const UA = { "User-Agent": "DesbravandoArtes/1.0 (uso interno; contato via desbravandoutv.com)" };
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

const arg = (n, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.split("=").slice(1).join("=") : padrao;
};

const termos = arg("q", "black t-shirt").split("|");
const destino = resolve(artes, arg("dest", "mockup/base"));
const quantos = Number(arg("n", "6"));
const minLargura = Number(arg("min", "1200"));

const semTags = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

async function pegarJson(url, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    await pausa(i === 0 ? 1100 : 4000 * i);
    const r = await fetch(url, { headers: UA });
    const texto = await r.text();
    try {
      return JSON.parse(texto);
    } catch {
      console.log(`    (rate limit — tentando de novo)`);
    }
  }
  return null;
}

mkdirSync(destino, { recursive: true });
const creditos = [];
let n = 0;

for (const termo of termos) {
  if (n >= quantos) break;
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
      iiurlwidth: "2000",
    });

  const dados = await pegarJson(url);
  const paginas = Object.values(dados?.query?.pages ?? {});
  const candidatas = paginas
    .map((p) => ({ titulo: p.title, info: p.imageinfo?.[0] }))
    .filter((x) => x.info?.thumburl && /\.(jpe?g|png)$/i.test(x.titulo))
    .filter((x) => x.info.width >= minLargura)
    .sort((a, b) => b.info.width * b.info.height - a.info.width * a.info.height);

  for (const c of candidatas) {
    if (n >= quantos) break;
    await pausa(900);
    const bin = await fetch(c.info.thumburl, { headers: UA });
    if (!bin.ok) continue;
    n += 1;
    const nome = `cand-${String(n).padStart(2, "0")}.jpg`;
    writeFileSync(join(destino, nome), Buffer.from(await bin.arrayBuffer()));
    const licenca = semTags(c.info.extmetadata?.LicenseShortName?.value) || "?";
    const autor = semTags(c.info.extmetadata?.Artist?.value) || "não informado";
    creditos.push(`${nome} · ${c.titulo.replace(/^File:/, "")} · ${autor} · ${licenca} · ${c.info.width}×${c.info.height}`);
    console.log(`  ${nome}  ${String(c.info.width).padStart(5)}×${String(c.info.height).padEnd(5)} ${licenca.padEnd(16)} ${c.titulo.replace(/^File:/, "").slice(0, 52)}`);
  }
}

writeFileSync(join(destino, "candidatas.txt"), creditos.join("\n") + "\n", "utf8");
console.log(`\n${n} candidata(s) em ${destino}`);
