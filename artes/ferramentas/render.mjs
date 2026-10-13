/**
 * RENDER — HTML/CSS nas dimensões exatas → PDF (Chrome headless) → PNG (PyMuPDF).
 *
 *   node artes/ferramentas/render.mjs cracha [--layout=editorial] [--guias]
 *   node artes/ferramentas/render.mjs cordao
 *   node artes/ferramentas/render.mjs parcerias [--dados=parcerias-apoio-mecanico.json]
 *   node artes/ferramentas/render.mjs tudo
 *
 * O HTML gerado fica em artes/saida/ e pode ser aberto no navegador para conferir
 * antes de mandar para a gráfica.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { cracha, meta as metaCracha } from "../templates/cracha.mjs";
import { cordao, meta as metaCordao } from "../templates/cordao.mjs";
import { parcerias, meta as metaParcerias } from "../templates/parcerias.mjs";
import { arteEstampa, mapaAplicacao } from "../templates/camiseta.mjs";
import { evento, meta as metaEvento } from "../templates/evento.mjs";

import { programacao, meta as metaProgramacao } from "../templates/programacao.mjs";
import { manifesto } from "../templates/manifesto.mjs";
import { oferta } from "../templates/oferta.mjs";
import { FORMATOS as FORMATOS_SOCIAL } from "../templates/comum.mjs";
import { bandeira } from "../templates/bandeira.mjs";
import { adesivo, cartaoUtv } from "../templates/expedicao.mjs";
import { adesivoVetor, textosNecessarios } from "../templates/adesivo-vetor.mjs";
import { carta } from "../templates/carta.mjs";
import { descritivo } from "../templates/descritivo.mjs";

import { fechamento } from "../templates/fechamento.mjs";
import { proposta } from "../templates/proposta.mjs";
import { acordo } from "../templates/acordo.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
const saida = join(artes, "saida");

const CHROMES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
];
const PYTHONS = [
  process.env.PYTHON,
  join(process.env.LOCALAPPDATA ?? "", "Programs/Python/Python314/python.exe"),
];

const acha = (lista, oque) => {
  const bom = lista.filter(Boolean).find((p) => existsSync(p));
  if (!bom) throw new Error(`${oque} não encontrado — defina a variável de ambiente correspondente`);
  return bom;
};

const args = process.argv.slice(2);
const alvo = args[0] ?? "tudo";
const opt = (nome, padrao = null) => {
  const a = args.find((x) => x.startsWith(`--${nome}=`));
  return a ? a.split("=").slice(1).join("=") : padrao;
};
const flag = (nome) => args.includes(`--${nome}`);

const lerDados = (arquivo) => JSON.parse(readFileSync(join(artes, "dados", arquivo), "utf8"));

/**
 * Caminho de foto do JSON → URL absoluta. Aceita caminho absoluto ou relativo à
 * pasta artes/ (o HTML é gerado em artes/saida/, então relativo puro apontaria
 * para o lugar errado). Arquivo inexistente vira aviso, não some calado.
 */
function resolverFoto(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//.test(caminho)) return caminho;
  const abs = resolve(artes, caminho);
  if (!existsSync(abs)) {
    console.log(`  ! foto não encontrada, seguindo sem ela: ${caminho}`);
    return null;
  }
  return pathToFileURL(abs).href;
}

/** HTML → PDF nas dimensões do @page. */
function paraPdf(htmlPath, pdfPath) {
  const chrome = acha(CHROMES, "Chrome");
  const r = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      "--virtual-time-budget=8000",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8" }
  );
  if (!existsSync(pdfPath)) {
    throw new Error(`Chrome não gerou o PDF.\n${r.stderr ?? ""}`);
  }
}

/**
 * HTML → PNG direto, em pixel exato. Para peça de social o PNG é o entregável, e
 * converter via PDF dá arredondamento (1080×1350 virava 1080×1351).
 */
function paraPngExato(htmlPath, l, a, destino) {
  const chrome = acha(CHROMES, "Chrome");
  spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--virtual-time-budget=8000",
      `--window-size=${l},${a}`,
      `--screenshot=${destino}`,
      pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8" }
  );
  if (!existsSync(destino)) throw new Error(`screenshot falhou: ${destino}`);
  console.log(`  ${basename(destino)}  ${l}×${a}px`);
}

/** PDF → PNG na resolução pedida + conferência das fontes embutidas. */
function paraPng(pdfPath, dpi, prefixo, alpha = false) {
  const python = acha(PYTHONS, "Python");
  const args = [join(aqui, "pdf-para-png.py"), pdfPath, String(dpi), prefixo];
  if (alpha) args.push("alpha");
  const r = spawnSync(python, args, { encoding: "utf8" });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.status !== 0) console.error(r.stderr);
}

function escrever(nome, html) {
  mkdirSync(saida, { recursive: true });
  const htmlPath = join(saida, `${nome}.html`);
  writeFileSync(htmlPath, html, "utf8");
  const pdfPath = join(saida, `${nome}.pdf`);
  paraPdf(htmlPath, pdfPath);
  console.log(`\n▸ ${nome}.pdf`);
  return pdfPath;
}

/* ------------------------------------------------------------------ alvos */

function fazerCracha() {
  const dados = lerDados(opt("dados", "equipe.json"));
  dados.pessoas = dados.pessoas.map((p) => ({ ...p, foto: resolverFoto(p.foto) }));
  const layout = opt("layout", "centro");
  const guias = flag("guias");
  const nome = `cracha-${layout}${guias ? "-guias" : ""}`;
  const [l, a] = metaCracha.formatoMm;
  console.log(`Crachá · ${dados.pessoas.length} pessoa(s) · ${l}×${a} mm (final ${metaCracha.finalMm.join("×")} mm + ${metaCracha.sangriaMm} mm de sangria) · layout ${layout}`);
  const semFoto = dados.pessoas.filter((p) => !p.foto).map((p) => p.nome);
  if (semFoto.length) console.log(`  pendente · retrato de: ${semFoto.join(", ")}`);
  const pdf = escrever(nome, cracha(dados, { layout, guias }));
  paraPng(pdf, 300, nome);
}

function fazerCordao() {
  const tipos = (opt("tipo", "pescoco") || "").split(",");
  const variantes = (opt("variante", "icone") || "").split(",");
  const curvasMarca = curvasDe("DESBRAVANDO UTV", "Anton-Regular.ttf");
  const curvasHandle = curvasDe("@desbravando_utv", "Archivo-SemiBold.ttf");

  for (const tipo of tipos) {
    for (const variante of variantes) {
      const comprimento = metaCordao.comprimentos[tipo] ?? metaCordao.comprimentos.pescoco;
      const nome = `${tipo === "chaveiro" ? "chaveiro" : "cordao"}-${variante}`;
      console.log(
        `${tipo === "chaveiro" ? "Chaveiro" : "Cordão"} · ${variante} · fita ${metaCordao.larguraMm} mm × ${comprimento / 10} cm` +
          ` (arquivo ${comprimento + metaCordao.sangriaMm * 2}×${metaCordao.larguraMm + metaCordao.sangriaMm * 2} mm com sangria)`
      );
      const html = cordao({}, { tipo, variante, guias: flag("guias"), curvasMarca, curvasHandle });
      paraPng(escrever(nome, html), tipo === "chaveiro" ? 300 : 150, nome);
    }
  }
}

function fazerParcerias() {
  const arquivo = opt("dados", "parcerias-apoio-mecanico.json");
  const dados = lerDados(arquivo);
  for (const slot of [dados.capa, dados.fotoOperacao, dados.encerramento, dados.territorio.foto, ...dados.casos.map((c) => c.foto)]) {
    if (slot) slot.arquivo = resolverFoto(slot.arquivo);
  }
  const { html, pendencias } = parcerias(dados);
  const nPaginas = (html.match(/<section class="pagina/g) ?? []).length;
  console.log(`Parcerias · ${dados.territorio.nome} · ${nPaginas} páginas · ${metaParcerias.formatoPx.join("×")} px${dados.visual === "tipografico" ? " · modo tipográfico (sem foto)" : ""}`);
  if (pendencias.length) {
    console.log(`  ${pendencias.length} campo(s) a preencher antes de enviar:`);
    for (const p of pendencias) console.log(`    · ${p}`);
  }
  const nome = `parcerias-${arquivo.replace(/^parcerias-|\.json$/g, "")}`;
  const pdf = escrever(nome, html);
  paraPng(pdf, 96, nome);
}

/** texto → curvas SVG, via fontTools. Cache porque o mapa repete rótulos. */
const cacheCurvas = new Map();
function curvasDe(texto, fonte = "Archivo-SemiBold.ttf") {
  const chave = `${fonte}|${texto}`;
  if (!cacheCurvas.has(chave)) {
    const r = spawnSync(acha(PYTHONS, "Python"), [join(aqui, "texto-para-svg.py"), fonte, texto], {
      encoding: "utf8",
    });
    if (r.status !== 0) throw new Error(`texto-para-svg falhou em "${texto}": ${r.stderr}`);
    cacheCurvas.set(chave, JSON.parse(r.stdout));
  }
  return cacheCurvas.get(chave);
}

function fazerCamiseta() {
  const cargo = (opt("cargo", "PRODUÇÃO") || "").toUpperCase();
  const curvas = curvasDe(cargo, "Anton-Regular.ttf");

  console.log(`Camiseta · ${cargo} · costas: palavra 80 mm + ícone 30 mm acima · frente: ícone 30 mm`);

  const base = `camiseta-${cargo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}`;
  paraPng(escrever(`${base}-mapa`, mapaAplicacao({ cargo, curvas, curvasDe })), 150, `${base}-mapa`);

  for (const lado of ["costas", "frente"]) {
    const nome = `${base}-arte-${lado}`;
    const pdf = escrever(nome, arteEstampa({ lado, cargo, curvas }));
    // 300 dpi com transparência: é a arte que vai para a estamparia
    paraPng(pdf, 300, nome, true);
  }
}

function fazerEvento() {
  const arquivo = opt("dados", "evento-cardapio-13ago.json");
  const dados = lerDados(arquivo);
  if (dados.fundo) dados.fundo.arquivo = resolverFoto(dados.fundo.arquivo);

  // peça de mesa não leva data/local/recado: quem está na mesa já está no evento
  if (flag("sem-linhas")) dados.linhas = [];

  const base = `evento-${arquivo.replace(/^evento-|\.json$/g, "")}`;
  for (const formato of (opt("formato", "stories,feed") || "").split(",")) {
    const fmt = metaEvento.formatos[formato];
    if (!fmt) {
      console.error(`formato desconhecido: ${formato} — use ${Object.keys(metaEvento.formatos).join(" | ")}`);
      continue;
    }
    const { html, pendencias } = evento(dados, { formato });
    const medida = fmt.mm ? `${fmt.mm[0]}×${fmt.mm[1]} mm (com sangria)` : `${fmt.l}×${fmt.a} px`;
    console.log(`Evento · ${dados.subtitulo ?? ""} · ${formato} · ${medida}`);
    for (const p of pendencias) console.log(`  pendente · ${p}`);

    const nome = `${base}-${formato}`;
    const pdf = escrever(nome, html);
    if (fmt.mm) {
      paraPng(pdf, 300, nome); // impressão: PDF é o entregável, PNG é prova
    } else {
      // social: PNG em pixel exato, via screenshot (a conversão do PDF arredonda)
      paraPngExato(join(saida, `${nome}.html`), fmt.l, fmt.a, join(saida, `${nome}.png`));
    }
  }
  if (dados.fundo?.provisoria) {
    console.log(`  ! fundo de banco de imagens: ${dados.fundo.credito}`);
  }
}

function fazerBandeira() {
  const dados = lerDados(opt("dados", "bandeiras.json"));
  const variantes = (opt("variante", "padrao,oficial") || "").split(",");

  for (const item of dados.itens) {
    for (const variante of variantes) {
      // só as nacionais têm proporção própria: repetir a de marca seria arquivo igual
      if (variante === "oficial" && item.tipo !== "nacional") continue;

      const { html, medidas } = bandeira(item, { variante });
      const nome = `bandeira-${item.arquivo}${variante === "oficial" ? "-proporcao-oficial" : ""}`;
      console.log(
        `Bandeira · ${item.nome} · ${medidas.finalMm[0]}×${medidas.finalMm[1]} mm` +
          ` (arquivo ${medidas.paginaMm[0]}×${medidas.paginaMm[1]} com ${medidas.sangriaMm} mm de sangria)`
      );
      // prova em 12 dpi: em tamanho real, 150 dpi daria ~15 000 px de largura
      paraPng(escrever(nome, html), 12, nome);
    }
  }
}

function fazerAdesivo() {
  const arquivoDados = opt("dados", "expedicao-urubici-2026.json");
  const dados = lerDados(arquivoDados);
  /* O nome de saída era "adesivo-<tema>-<numero>", sem a expedição dentro. Com duas
     expedições vivas ao mesmo tempo (Urubici em agosto, Origens em outubro) o adesivo 01
     de uma GRAVA POR CIMA do 01 da outra — aconteceu em 13/10 e só apareceu porque o PNG
     antigo continuou na pasta e denunciou. Arquivo de gráfica trocado não dá erro: dá
     adesivo errado colado no UTV. A expedição passa a fazer parte do nome.
     A família "expedicao-X.json" / "expedicao-X-pecas.json" vira só "X". */
  const apelido = arquivoDados
    .replace(/\.json$/, "")
    .replace(/^expedicao-/, "")
    .replace(/-pecas$/, "")
    .replace(/-\d{4}$/, "");
  // "--numeros=01..20" gera a série; "--tema=preto,branco" gera as duas cores
  const bruto = opt("numeros", dados.adesivo?.numero ?? "01") || "";
  const faixa = bruto.match(/^(\d+)\.\.(\d+)$/);
  const numeros = faixa
    ? Array.from({ length: Number(faixa[2]) - Number(faixa[1]) + 1 }, (_, i) =>
        String(Number(faixa[1]) + i).padStart(2, "0")
      )
    : bruto.split(",");
  const temas = (opt("tema", "preto") || "").split(",");

  console.log(`Adesivo do UTV · 100% vetor · ${numeros.length} número(s) × ${temas.length} tema(s)`);
  for (const numero of numeros) {
    // cada texto vira curva antes de entrar no SVG: nada de fonte, nada de imagem
    const pedidos = textosNecessarios(dados, numero);
    const curvas = Object.fromEntries(
      Object.entries(pedidos).map(([k, v]) => [k, curvasDe(v.texto, v.fonte)])
    );
    for (const tema of temas) {
      const { html, svg, medidas } = adesivoVetor(dados, { numero, tema, curvas });
      const nome = `adesivo-${apelido}-${tema}-${numero}`;
      writeFileSync(join(saida, `${nome}.svg`), svg, "utf8");
      const pdf = escrever(nome, html);
      if (flag("prova")) paraPng(pdf, 300, nome);
      else console.log(`  ${medidas.finalMm[0]} mm Ø · sangria ${medidas.sangriaMm} mm · ${nome}.pdf + .svg`);
    }
  }
}

function fazerCartaoUtv() {
  const dados = lerDados(opt("dados", "expedicao-urubici-2026.json"));
  const { html, medidas } = cartaoUtv(dados);
  console.log(
    `Cartão do UTV · ${medidas.finalMm.join("×")} mm (arquivo ${medidas.paginaMm.join("×")} com ${medidas.sangriaMm} mm de sangria) · furo ${medidas.furoMm} mm`
  );
  paraPng(escrever("cartao-utv", html), 300, "cartao-utv");
}

function fazerDescritivo() {
  const arquivo = opt("dados", "faturamento-2026-08.json");
  const dados = lerDados(arquivo);
  const artes = dados.pecas.flatMap((p) => p.itens);
  const total = artes.reduce((s, i) => s + i.valor, 0);
  console.log(`Descritivo de artes · ${dados.competencia} · ${dados.pecas.length} peças · ${artes.length} artes · R$ ${total}`);
  const nome = `descritivo-artes-${arquivo.replace(/^faturamento-|\.json$/g, "")}`;
  paraPng(escrever(nome, descritivo(dados)), 150, nome);
}

function fazerCarta() {
  const dados = lerDados(opt("dados", "expedicao-urubici-2026.json"));
  for (const tema of (opt("tema", "claro,escuro") || "").split(",")) {
    const { html, medidas } = carta(dados, { tema });
    console.log(
      `Carta de recepção · ${tema} · ${medidas.finalMm.join("×")} mm (arquivo ${medidas.paginaMm.join("×")} com ${medidas.sangriaMm} mm de sangria)`
    );
    paraPng(escrever(`carta-recepcao-${tema}`, html), 300, `carta-recepcao-${tema}`);
  }
}

/**
 * Fechamento do mês (RYZE) — documento de pré-aprovação do cliente.
 * O auditor roda depois do PDF e ABORTA se reprovar: documento de cobrança com número
 * velho é pior do que documento nenhum.
 */
function fazerFechamento() {
  const arquivo = opt("dados", "fechamento-2026-08.json");
  const dados = lerDados(arquivo);
  const nome = arquivo.replace(/\.json$/, "");
  console.log(`Fechamento RYZE · ${dados.cliente} · ${dados.competencia} · ${dados.carater}`);
  const pdf = escrever(nome, fechamento(dados));

  const r = spawnSync(
    acha(PYTHONS, "Python"),
    [join(aqui, "auditar-fechamento.py"), pdf, join(artes, "dados", arquivo)],
    { encoding: "utf8" }
  );
  process.stdout.write(r.stdout ?? "");
  if (r.status !== 0) {
    process.stderr.write(r.stderr ?? "");
    rmSync(pdf, { force: true });
    throw new Error("auditoria reprovou — PDF descartado, nada foi entregue");
  }
  paraPng(pdf, 110, nome);
}

/**
 * Acordo de parceria (RYZE) -- o documento que fecha a renegociacao.
 * Aborta igual aos irmaos, e por um motivo mais forte: acordo erra em ESCOPO, e escopo
 * errado so aparece dois meses depois, quando ja nao ha documento para apelar.
 */
function fazerAcordo() {
  const arquivo = opt("dados", "acordo-2026-10.json");
  const dados = lerDados(arquivo);
  const nome = arquivo.replace(/\.json$/, "");
  console.log(`Acordo RYZE · ${dados.cliente} · ${dados.interlocutor} · vigencia ${dados.vigencia}`);
  const pdf = escrever(nome, acordo(dados));

  const r = spawnSync(
    acha(PYTHONS, "Python"),
    [join(aqui, "auditar-acordo.py"), pdf, join(artes, "dados", arquivo)],
    { encoding: "utf8" }
  );
  process.stdout.write(r.stdout ?? "");
  if (r.status !== 0) {
    process.stderr.write(r.stderr ?? "");
    rmSync(pdf, { force: true });
    throw new Error("auditoria reprovou — PDF descartado, nada foi entregue");
  }
  paraPng(pdf, 110, nome);
}

/**
 * Proposta comercial (RYZE) — renegociacao do plano com o cliente.
 * Mesmo aborto do fechamento, por motivo mais forte: documento de negociacao com conta
 * que nao fecha nao perde um numero, perde a conversa — e nao tem segunda chance.
 */
function fazerProposta() {
  const arquivo = opt("dados", "proposta-2026-10.json");
  const dados = lerDados(arquivo);
  const nome = arquivo.replace(/\.json$/, "");
  console.log(`Proposta RYZE · ${dados.cliente} · ${dados.interlocutor} · valida ate ${dados.validade}`);
  const pdf = escrever(nome, proposta(dados));

  const r = spawnSync(
    acha(PYTHONS, "Python"),
    [join(aqui, "auditar-proposta.py"), pdf, join(artes, "dados", arquivo)],
    { encoding: "utf8" }
  );
  process.stdout.write(r.stdout ?? "");
  if (r.status !== 0) {
    process.stderr.write(r.stderr ?? "");
    rmSync(pdf, { force: true });
    throw new Error("auditoria reprovou — PDF descartado, nada foi entregue");
  }
  paraPng(pdf, 110, nome);
}

/**
 * Programação do dia — PNG em pixel exato. Passa pelo screenshot, não pelo PDF:
 * converter via PDF arredonda e 1080×1350 já saiu 1080×1351 uma vez.
 */
function fazerProgramacao() {
  const arquivo = opt("dados", "programacao-26ago.json");
  const dados = lerDados(arquivo);
  if (dados.fundo) dados.fundo.arquivo = resolverFoto(dados.fundo.arquivo);
  if (opt("tratamento") && dados.fundo) dados.fundo.tratamento = opt("tratamento");

  const base = arquivo.replace(/\.json$/, "");
  for (const formato of (opt("formato", "stories,feed") || "").split(",")) {
    const fmt = metaProgramacao.formatos[formato];
    if (!fmt) {
      console.error(`formato desconhecido: ${formato} — use ${Object.keys(metaProgramacao.formatos).join(" | ")}`);
      continue;
    }
    const visual = opt("visual", "tipografico");   // sem foto e o padrao desde 26/08
    const { html, pendencias } = programacao(dados, { formato, visual });
    console.log(`Programação · ${dados.titulo} · ${formato} · ${fmt.l}×${fmt.a} px`);
    for (const p of pendencias) console.log(`  pendente · ${p}`);

    const nome = `${base}-${formato}${visual === "tipografico" ? "" : "-" + visual}`;
    mkdirSync(saida, { recursive: true });
    const htmlPath = join(saida, `${nome}.html`);
    writeFileSync(htmlPath, html, "utf8");
    paraPngExato(htmlPath, fmt.l, fmt.a, join(saida, `${nome}.png`));
  }
}

/**
 * Manifesto de conduta — PNG em pixel exato, mesmo caminho da programação.
 */
function fazerManifesto() {
  const arquivo = opt("dados", "manifesto-off-road.json");
  const dados = lerDados(arquivo);
  const formato = opt("formato", "stories");
  const fmt = FORMATOS_SOCIAL[formato];
  if (!fmt) throw new Error(`formato desconhecido: ${formato}`);
  const { html } = manifesto(dados, { formato });
  console.log(`Manifesto · ${dados.titulo} ${dados.titulo2 ?? ""} · ${dados.secoes.length} seções · ${fmt.l}×${fmt.a} px`);
  const nome = arquivo.replace(/\.json$/, "");
  mkdirSync(saida, { recursive: true });
  const htmlPath = join(saida, `${nome}.html`);
  writeFileSync(htmlPath, html, "utf8");
  paraPngExato(htmlPath, fmt.l, fmt.a, join(saida, `${nome}.png`));
}

/** Proposta de expedicao — o PDF virado peca de imagem. */
function fazerOferta() {
  const arquivo = opt("dados", "expedicao-origens.json");
  const dados = lerDados(arquivo);
  const formato = opt("formato", "stories");
  const fmt = FORMATOS_SOCIAL[formato];
  if (!fmt) throw new Error(`formato desconhecido: ${formato}`);
  const { html } = oferta(dados, { formato });
  console.log(`Oferta · ${dados.titulo} · ${dados.dias.length} dias · ${dados.incluso.length} itens inclusos · ${fmt.l}×${fmt.a} px`);
  const nome = arquivo.replace(/[.]json$/, "");
  mkdirSync(saida, { recursive: true });
  const htmlPath = join(saida, `${nome}.html`);
  writeFileSync(htmlPath, html, "utf8");
  paraPngExato(htmlPath, fmt.l, fmt.a, join(saida, `${nome}.png`));
}

const alvos = {
  cracha: fazerCracha,
  bandeira: fazerBandeira,
  adesivo: fazerAdesivo,
  "cartao-utv": fazerCartaoUtv,
  carta: fazerCarta,
  descritivo: fazerDescritivo,

  fechamento: fazerFechamento,
  proposta: fazerProposta,
  acordo: fazerAcordo,
  cordao: fazerCordao,
  parcerias: fazerParcerias,
  camiseta: fazerCamiseta,
  evento: fazerEvento,

  programacao: fazerProgramacao,
  manifesto: fazerManifesto,
  oferta: fazerOferta,
};

if (alvo === "tudo") {
  fazerCracha();
  fazerCordao();
  fazerParcerias();
  fazerCamiseta();
} else if (alvos[alvo]) {
  alvos[alvo]();
} else {
  console.error(`alvo desconhecido: ${alvo}\nuse: cracha | cordao | parcerias | camiseta | tudo`);
  process.exit(1);
}

console.log(`\nsaída: ${resolve(saida)}`);

