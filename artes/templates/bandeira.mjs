/**
 * BANDEIRAS — 2,50 m × 1,50 m (comprimento × altura), com sangria.
 *
 * Dois tipos:
 *   marca     fundo preto, logo em branco centralizado (Desbravando, Can-Am)
 *   nacional  bandeira oficial em SVG (arquivos de domínio público do Commons)
 *
 * Duas variantes de proporção:
 *   padrao    todas em 2,50 × 1,50 m (5:3) — conjunto uniforme no mastro
 *   oficial   cada nacional na proporção do seu país, mantendo 2,50 m de comprimento
 *
 * Por que as duas: 5:3 não é a proporção de nenhuma das três bandeiras nacionais
 * (Brasil 10:7, EUA 19:10, Canadá 2:1). Esticar deforma a esfera do Brasil e a folha
 * do Canadá; recortar come as bordas. Uniformidade e fidelidade não cabem no mesmo
 * arquivo — quem decide é quem vai pendurar.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

const COMPRIMENTO = 2500; // mm
const ALTURA = 1500; // mm
const SANGRIA = 30; // mm — bandeira leva bainha; a sangria cobre a costura

/** Proporções oficiais (comprimento : altura). */
const OFICIAL = {
  brasil: 10 / 7,
  canada: 2 / 1,
  eua: 19 / 10,
};

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** SVG da bandeira nacional, sem o cabeçalho XML e com o viewBox preservado. */
function svgNacional(nome) {
  const bruto = readFileSync(join(aqui, "..", "marca", "bandeiras", `${nome}.svg`), "utf8");
  return bruto
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/g, "")
    .replace(/<svg([^>]*)>/, (_m, atributos) => {
      const vb = atributos.match(/viewBox="([^"]+)"/)?.[1];
      // largura/altura vêm do CSS; sem preserveAspectRatio="none" o SVG não preenche
      return `<svg${vb ? ` viewBox="${vb}"` : ""} preserveAspectRatio="none" width="100%" height="100%">`;
    });
}

export function bandeira(item, opcoes = {}) {
  const variante = opcoes.variante === "oficial" ? "oficial" : "padrao";
  const proporcao = variante === "oficial" && OFICIAL[item.arquivo] ? OFICIAL[item.arquivo] : COMPRIMENTO / ALTURA;

  const l = COMPRIMENTO;
  const a = Math.round(COMPRIMENTO / proporcao);
  const lPagina = l + SANGRIA * 2;
  const aPagina = a + SANGRIA * 2;

  const conteudo =
    item.tipo === "nacional"
      ? `<div class="nacional">${svgNacional(item.arquivo)}</div>`
      : `<div class="marca-area"><img src="${esc(item.logo)}" alt=""></div>`;

  return {
    html: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Bandeira ${esc(item.nome)} — ${l}×${a} mm (${variante})</title>
<style>
  @page { size: ${lPagina}mm ${aPagina}mm; margin: 0; }
  html, body { margin: 0; padding: 0; }

  .bandeira {
    position: relative;
    width: ${lPagina}mm; height: ${aPagina}mm;
    background: ${item.tipo === "nacional" ? "#ffffff" : "#000000"};
    overflow: hidden;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  /* a arte cobre a sangria inteira: o corte cai dentro dela, não na borda do desenho */
  .nacional { position: absolute; inset: 0; }
  .nacional svg { display: block; width: 100%; height: 100%; }

  /* logo centralizado na área segura (a 120 mm da borda final) */
  .marca-area {
    position: absolute;
    left: ${SANGRIA + 120}mm; right: ${SANGRIA + 120}mm;
    top: ${SANGRIA + 120}mm; bottom: ${SANGRIA + 120}mm;
    display: flex; align-items: center; justify-content: center;
  }
  .marca-area img { width: ${esc(item.larguraLogo ?? "62%")}; height: auto; display: block; }
</style>
</head>
<body>
  <div class="bandeira">
    ${conteudo}
  </div>
</body>
</html>`,
    medidas: { finalMm: [l, a], paginaMm: [lPagina, aPagina], sangriaMm: SANGRIA, variante },
  };
}

export const meta = { nome: "bandeira", comprimentoMm: COMPRIMENTO, alturaMm: ALTURA, sangriaMm: SANGRIA, oficial: OFICIAL };
