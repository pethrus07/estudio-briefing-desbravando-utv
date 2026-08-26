/**
 * PACOTE PARA A ESTAMPARIA — camiseta da equipe.
 *
 *   node artes/ferramentas/pacote-camiseta.mjs [--cargo=PRODUÇÃO] [--destino=CAMINHO]
 *
 * Padrão do destino: %USERPROFILE%\camiseta-desbravando-<cargo>
 *
 *   1-PRODUCAO/     as artes (PDF vetorial em curvas + PNG 300 dpi transparente)
 *   MAPA-DE-APLICACAO.pdf
 *   LEIA-ME.txt
 */
import { writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { arteEstampa, mapaAplicacao, meta } from "../templates/camiseta.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
/* Igual ao pacote do crachá: o temporário mora em saida/ porque os templates
   linkam ../identidade.css e ../marca/ — subpasta a mais quebra os dois. */
const temp = join(artes, "saida");
const PREFIXO = "_pct-camiseta-";

const arg = (nome, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${nome}=`));
  return a ? a.split("=").slice(1).join("=") : padrao;
};

const cargo = (arg("cargo", "PRODUÇÃO") || "").toUpperCase();
const slug = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const destino = resolve(arg("destino", join(process.env.USERPROFILE ?? ".", `camiseta-desbravando-${slug}`)));

const CHROME = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].filter(Boolean).find((p) => existsSync(p));
const PYTHON = [
  process.env.PYTHON,
  join(process.env.LOCALAPPDATA ?? "", "Programs/Python/Python314/python.exe"),
].filter(Boolean).find((p) => existsSync(p));

const cache = new Map();
function curvasDe(texto, fonte = "Archivo-SemiBold.ttf") {
  const chave = `${fonte}|${texto}`;
  if (!cache.has(chave)) {
    const r = spawnSync(PYTHON, [join(aqui, "texto-para-svg.py"), fonte, texto], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`texto-para-svg falhou em "${texto}": ${r.stderr}`);
    cache.set(chave, JSON.parse(r.stdout));
  }
  return cache.get(chave);
}

function pdf(nome, html) {
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

function png(pdfPath, dpi, prefixo, pasta, alpha) {
  const args = [join(aqui, "pdf-para-png.py"), pdfPath, String(dpi), prefixo];
  if (alpha) args.push("alpha");
  const r = spawnSync(PYTHON, args, { encoding: "utf8" });
  if (r.stdout) process.stdout.write(r.stdout);
  for (const f of readdirSync(temp).filter((f) => f.startsWith(prefixo) && f.endsWith(".png"))) {
    copyFileSync(join(temp, f), join(pasta, f));
    rmSync(join(temp, f), { force: true });
  }
}

/* ---------------------------------------------------------------- execução */

mkdirSync(temp, { recursive: true });
const producao = join(destino, "1-PRODUCAO");
mkdirSync(producao, { recursive: true });

const curvasCargo = curvasDe(cargo, "Anton-Regular.ttf");
console.log(
  `Camiseta ${cargo} · costas: palavra ${meta.textoCostasMm} mm + ícone ${meta.iconeCostasMm} mm · frente: ícone ${meta.frenteMm} mm`
);

for (const lado of ["costas", "frente"]) {
  // visível: branco sobre preto, é o arquivo que se abre e se confere
  const visivel = pdf(`arte-${lado}`, arteEstampa({ lado, cargo, curvas: curvasCargo, fundo: "preto" }));
  copyFileSync(visivel, join(producao, `ARTE-${lado}.pdf`));
  png(visivel, 300, `ARTE-${lado}`, producao, false);

  // produção: mesmo vetor, sem fundo, no tamanho físico exato
  const semFundo = pdf(`arte-${lado}-sf`, arteEstampa({ lado, cargo, curvas: curvasCargo, fundo: "transparente" }));
  copyFileSync(semFundo, join(producao, `ARTE-${lado}-sem-fundo.pdf`));
  png(semFundo, 300, `ARTE-${lado}-sem-fundo`, producao, true);
}

const mapa = pdf("mapa", mapaAplicacao({ cargo, curvas: curvasCargo, curvasDe }));
copyFileSync(mapa, join(destino, "MAPA-DE-APLICACAO.pdf"));

writeFileSync(
  join(destino, "LEIA-ME.txt"),
  [
    `CAMISETA DA EQUIPE — ${cargo} · DESBRAVANDO UTV`,
    "",
    "Camiseta preta, estampa em 1 cor: branco.",
    "",
    `  Costas (nuca)  ${cargo} com ${meta.textoCostasMm} mm de largura e o ícone da montanha com`,
    `                 ${meta.iconeCostasMm} mm centralizado acima. Bloco centralizado, 60 mm abaixo da gola.`,
    `  Frente         só o ícone, ${meta.frenteMm} mm de largura, no peito ESQUERDO DE QUEM VESTE`,
    "                 (na vista de frente do mapa, aparece à direita).",
    "",
    "Arquivos:",
    "  MAPA-DE-APLICACAO.pdf                  posição e medidas nas duas vistas",
    "",
    "  Para ver e conferir (arte branca sobre preto, simulando o tecido):",
    "  1-PRODUCAO/ARTE-costas.pdf             vetorial, em curvas",
    "  1-PRODUCAO/ARTE-frente.pdf             vetorial, em curvas",
    "  1-PRODUCAO/ARTE-*.png                  300 dpi",
    "",
    "  Para a máquina (mesma arte, sem fundo, no tamanho físico exato):",
    "  1-PRODUCAO/ARTE-costas-sem-fundo.pdf   vetorial, em curvas, sem fundo",
    "  1-PRODUCAO/ARTE-frente-sem-fundo.pdf   vetorial, em curvas, sem fundo",
    "  1-PRODUCAO/ARTE-*-sem-fundo.png        300 dpi, fundo transparente",
    "",
    "Observações:",
    "  · O preto dos arquivos 'para ver' é só fundo de conferência: NÃO é para imprimir.",
    "    A tinta é uma só, branca.",
    "  · Os arquivos '-sem-fundo' abrem aparentemente vazios num visualizador claro —",
    "    é a arte branca sobre transparência, e é assim que a estamparia precisa.",
    "  · O texto já está convertido em curvas: não é preciso ter a fonte Anton.",
    "  · Serve para serigrafia 1 cor ou DTF. Sem meio-tom, sem degradê.",
    "  · Não redimensionar: as medidas em milímetros são as finais.",
    "",
    `Gerado a partir de: ${resolve(artes)}`,
  ].join("\n"),
  "utf8"
);

for (const f of readdirSync(temp).filter((f) => f.startsWith(PREFIXO))) {
  rmSync(join(temp, f), { force: true });
}

console.log(`\nPacote: ${destino}`);
console.log(`  ${basename(producao)}/  ${readdirSync(producao).length} arquivo(s)`);
