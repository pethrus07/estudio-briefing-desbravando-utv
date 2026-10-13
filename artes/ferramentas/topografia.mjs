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
import { campoSvg } from "./campo-curvas.mjs";
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

/* A matemática do campo mora em campo-curvas.mjs desde 13/10/2026, porque o adesivo
   do UTV passou a querer o mesmo relevo dentro da peça. Este arquivo continua sendo a
   porta de linha de comando; a família é uma só. */

const svg = campoSvg({ largura: L, altura: A, semente, passo });
const nCurvas = Math.ceil((A + 480) / passo);

const destino = join(aqui, "..", "graficos", opt("saida", `topografia-${semente}.svg`));
writeFileSync(destino, svg, "utf8");
console.log(`${destino}  ·  ${nCurvas} curvas  ·  semente ${semente}  ·  ${(svg.length / 1024).toFixed(0)} kB`);
