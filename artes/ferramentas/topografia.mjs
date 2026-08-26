/**
 * TOPOGRAFIA — campo de curvas de nível em SVG, o fundo P&B da identidade.
 *
 *   node artes/ferramentas/topografia.mjs --semente=6 --saida=topografia-conduta.svg
 *
 * Existe porque as cinco texturas da série de programação foram geradas por script
 * avulso e o script se perdeu: a sexta peça precisaria refazer a olho um fundo que
 * tem que ler como a MESMA família das outras. Agora a família é reproduzível.
 *
 * Como funciona: cada curva é uma linha horizontal deslocada pela soma de três senos
 * de comprimento de onda diferente — é o que dá o relevo irregular de mapa em vez de
 * onda de rádio. A semente entra na fase de cada seno, então cada peça tem seu relevo
 * sem sair do mesmo vocabulário. Toda quinta curva sai mais grossa: em carta
 * topográfica de verdade essa é a curva mestra, e é o detalhe que faz o fundo parecer
 * mapa e não decoração.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const opt = (n, p) => {
  const a = args.find((x) => x.startsWith(`--${n}=`));
  return a ? a.split("=").slice(1).join("=") : p;
};

const L = Number(opt("largura", 1080));
const A = Number(opt("altura", 1920));
const semente = Number(opt("semente", 1));
const passo = Number(opt("passo", 52)); // distância entre curvas
const dx = 18; // amostragem em x; menor que isso só engorda o arquivo

/* A fase depende da semente por múltiplos irracionais: com múltiplos inteiros as
   sementes 2 e 4 sairiam parecidas. */
const f = (i) => semente * [0.618, 1.324, 2.207][i];

function curva(n) {
  const y0 = -240 + n * passo;
  const pts = [];
  for (let x = 0; x <= L + dx; x += dx) {
    const y =
      y0 +
      46 * Math.sin(x / 210 + f(0) + n * 0.21) +
      22 * Math.sin(x / 97 - f(1) - n * 0.13) +
      9 * Math.sin(x / 43 + f(2) + n * 0.37);
    pts.push([x, y]);
  }
  /* Catmull-Rom → Bézier: passar reto por cima dos pontos com curva suave. Polilinha
     pura mostraria os vértices a cada 18px quando o fundo é ampliado. */
  let d = `M${pts[0][0]} ${Math.round(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    const r = (v) => Math.round(v * 10) / 10;
    d += `C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

const nCurvas = Math.ceil((A + 480) / passo);
const paths = [];
for (let n = 0; n < nCurvas; n++) {
  const mestra = n % 5 === 0;
  paths.push(
    `<path stroke-width="${mestra ? 1.5 : 0.7}" opacity="${mestra ? 1 : 0.62}" d="${curva(n)}"/>`
  );
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" ` +
  `preserveAspectRatio="xMidYMid slice" aria-hidden="true" ` +
  `fill="none" stroke="currentColor" stroke-linecap="round">` +
  paths.join("") +
  `</svg>\n`;

const destino = join(aqui, "..", "graficos", opt("saida", `topografia-${semente}.svg`));
writeFileSync(destino, svg, "utf8");
console.log(`${destino}  ·  ${nCurvas} curvas  ·  semente ${semente}  ·  ${(svg.length / 1024).toFixed(0)} kB`);
