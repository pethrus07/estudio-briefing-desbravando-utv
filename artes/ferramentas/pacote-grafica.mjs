/**
 * PACOTE PARA A GRÁFICA — junta numa pasta só o que o fornecedor precisa receber.
 *
 *   node artes/ferramentas/pacote-grafica.mjs [--layout=centro|editorial] [--destino=CAMINHO]
 *
 * Padrão do destino: %USERPROFILE%\cracha-desbravando-grafica
 *
 * Estrutura gerada:
 *   1-PRODUCAO/      o que vai para a máquina (frentes, verso, cordão)
 *   2-CONFERENCIA/   provas em PNG 300 dpi e o PDF com marcas de corte
 *   ESPECIFICACAO-TECNICA.pdf
 *   LEIA-ME.txt
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { cracha } from "../templates/cracha.mjs";
import { cordao } from "../templates/cordao.mjs";
import { especificacao } from "../templates/especificacao.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
/* Os templates linkam `../identidade.css` e `../marca/…`, ou seja, contam estar em
   artes/saida/. Uma subpasta a mais quebra os dois caminhos em silêncio — o PDF sai
   sem estilo e sem fonte. Por isso o temporário fica aqui mesmo, com prefixo. */
const temp = join(artes, "saida");
const PREFIXO = "_pacote-";

const arg = (nome, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${nome}=`));
  return a ? a.split("=").slice(1).join("=") : padrao;
};

const layout = arg("layout", "centro");
const destino = resolve(arg("destino", join(process.env.USERPROFILE ?? ".", "cracha-desbravando-grafica")));

const CHROME = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].filter(Boolean).find((p) => existsSync(p));
const PYTHON = [
  process.env.PYTHON,
  join(process.env.LOCALAPPDATA ?? "", "Programs/Python/Python314/python.exe"),
].filter(Boolean).find((p) => existsSync(p));

function pdf(nome, html) {
  mkdirSync(temp, { recursive: true });
  const htmlPath = join(temp, `${PREFIXO}${nome}.html`);
  const pdfPath = join(temp, `${PREFIXO}${nome}.pdf`);
  writeFileSync(htmlPath, html, "utf8");
  spawnSync(CHROME, [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer",
    "--virtual-time-budget=8000", `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href,
  ], { encoding: "utf8" });
  if (!existsSync(pdfPath)) throw new Error(`falhou ao gerar ${nome}.pdf`);
  return pdfPath;
}

function png(pdfPath, dpi, prefixo, pasta) {
  const r = spawnSync(PYTHON, [join(aqui, "pdf-para-png.py"), pdfPath, String(dpi), prefixo], { encoding: "utf8" });
  if (r.status !== 0) console.error(r.stderr);
  for (const f of readdirSync(dirname(pdfPath)).filter((f) => f.startsWith(prefixo) && f.endsWith(".png"))) {
    copyFileSync(join(dirname(pdfPath), f), join(pasta, f));
    rmSync(join(dirname(pdfPath), f), { force: true }); // saida/ é da revisão, não do pacote
  }
  return r.stdout ?? "";
}

/* ---------------------------------------------------------------- execução */

const dados = JSON.parse(readFileSync(join(artes, "dados", "equipe.json"), "utf8"));
const resolverFoto = (c) => {
  if (!c) return null;
  const abs = resolve(artes, c);
  return existsSync(abs) ? pathToFileURL(abs).href : null;
};
dados.pessoas = dados.pessoas.map((p) => ({ ...p, foto: resolverFoto(p.foto) }));

const semFoto = dados.pessoas.filter((p) => !p.foto);

const producao = join(destino, "1-PRODUCAO");
const conferencia = join(destino, "2-CONFERENCIA");
mkdirSync(producao, { recursive: true });
mkdirSync(conferencia, { recursive: true });

console.log(`Layout: ${layout} · ${dados.pessoas.length} pessoa(s)`);

// --- produção
const frentes = pdf("cracha-frentes", cracha(dados, { layout, faces: "frente" }));
const verso = pdf("cracha-verso", cracha(dados, { layout, faces: "verso" }));
const fita = pdf("cordao", cordao());
copyFileSync(frentes, join(producao, "CRACHA-frentes.pdf"));
copyFileSync(verso, join(producao, "CRACHA-verso-comum.pdf"));
copyFileSync(fita, join(producao, "CORDAO.pdf"));

// --- conferência
const guias = pdf("cracha-guias", cracha(dados, { layout, guias: true }));
copyFileSync(guias, join(conferencia, "CONFERENCIA-marcas-de-corte.pdf"));
console.log("\nProvas em 300 dpi:");
process.stdout.write(png(frentes, 300, "prova-frente", conferencia));
process.stdout.write(png(verso, 300, "prova-verso", conferencia));
process.stdout.write(png(fita, 150, "prova-cordao", conferencia));

// --- especificação (lista os arquivos que realmente foram para a pasta)
const listaArquivos = [
  "1-PRODUCAO/CRACHA-frentes.pdf — uma página por pessoa, 60 × 92 mm com sangria",
  "1-PRODUCAO/CRACHA-verso-comum.pdf — uma página, igual para todos",
  "1-PRODUCAO/CORDAO.pdf — 904 × 24 mm com sangria",
  "2-CONFERENCIA/CONFERENCIA-marcas-de-corte.pdf — só para conferir, não imprimir",
  "2-CONFERENCIA/prova-*.png — provas em 300 dpi",
];
const spec = pdf("especificacao", especificacao({ layout, pessoas: dados.pessoas.length, arquivos: listaArquivos }));
copyFileSync(spec, join(destino, "ESPECIFICACAO-TECNICA.pdf"));

writeFileSync(
  join(destino, "LEIA-ME.txt"),
  [
    "CRACHÁ E CORDÃO — EQUIPE DESBRAVANDO UTV",
    "",
    "O que mandar para a gráfica: a pasta 1-PRODUCAO e o ESPECIFICACAO-TECNICA.pdf.",
    "A pasta 2-CONFERENCIA é sua: provas em 300 dpi e o PDF com as marcas de corte.",
    "",
    "Resumo:",
    "  Crachá  PVC 0,76 mm · 54 × 86 mm em pé · arquivo com 3 mm de sangria · 4/4 · acabamento fosco",
    "  Cordão  fita 20 mm × 90 cm · sublimação nos dois lados · mosquetão giratório",
    "",
    semFoto.length
      ? `ATENÇÃO — faltam os retratos de: ${semFoto.map((p) => p.nome).join(", ")}.\n` +
        "Os crachás dessas pessoas saíram com o espaço da foto vazio. Coloque os arquivos\n" +
        "em artes/fotos/, aponte no artes/dados/equipe.json e rode de novo:\n" +
        "  node artes/ferramentas/pacote-grafica.mjs"
      : "Todos os retratos estão aplicados.",
    "",
    "Os nomes e cargos vêm de artes/dados/equipe.json — confira antes de enviar.",
    "",
    `Gerado a partir de: ${resolve(artes)}`,
  ].join("\n"),
  "utf8"
);

for (const f of readdirSync(temp).filter((f) => f.startsWith(PREFIXO))) {
  rmSync(join(temp, f), { force: true });
}

console.log(`\nPacote: ${destino}`);
for (const p of [producao, conferencia]) {
  console.log(`  ${basename(p)}/  ${readdirSync(p).length} arquivo(s)`);
}
if (semFoto.length) console.log(`\n! ${semFoto.length} crachá(s) sem retrato — ver LEIA-ME.txt`);
