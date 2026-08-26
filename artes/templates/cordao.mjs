/**
 * CORDÃO / CHAVEIRO — Desbravando
 *
 * Fita de 20 mm, fundo preto, arte em branco/cinza, + 2 mm de sangria nas laterais.
 *
 *   tipo=pescoco   900 mm de arte (90 cm = 45 cm de alça dobrada) — o do crachá
 *   tipo=chaveiro  250 mm — o modelo curto, com fecho, que o cliente mandou de referência
 *
 * Variantes de arte (ele pediu para ver o que fica bom):
 *   icone     só o ícone da montanha, espaçado e discreto (o do crachá)
 *   marca     ícone + DESBRAVANDO UTV alternados
 *   completo  ícone + DESBRAVANDO UTV + @handle, como o cordão de referência
 *
 * O texto entra em CURVAS (via `curvas`, do texto-para-svg.py): fita é sublimação,
 * e a estamparia não precisa ter Anton/Archivo instalado.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

const LARGURA = 20; // mm da fita
const SANGRIA = 2; // mm
const COMPRIMENTOS = { pescoco: 900, chaveiro: 250 };

/** O ícone entra inline para a cor vir do CSS (o SVG do repo tem fill fixo). */
function iconeInline() {
  const svg = readFileSync(join(aqui, "..", "marca", "logo-montanha.svg"), "utf8");
  return svg
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/\s(role|aria-label)="[^"]*"/g, "");
}

/** Texto em curvas → SVG com altura fixa em mm (a largura sai proporcional). */
function textoSvg(curvas, alturaMm, cor) {
  if (!curvas) return "";
  const [, yMin, largura, altura] = curvas.viewBox.split(/\s+/).map(Number);
  const escala = alturaMm / altura;
  return `<svg class="txt" width="${(largura * escala).toFixed(2)}mm" height="${alturaMm}mm"
       viewBox="${yMin === 0 ? `0 0 ${largura} ${altura}` : `0 ${yMin} ${largura} ${altura}`}"
       fill="${cor}"><path d="${curvas.d}"/></svg>`;
}

export function cordao(_dados = {}, opcoes = {}) {
  const tipo = COMPRIMENTOS[opcoes.tipo] ? opcoes.tipo : "pescoco";
  const comprimento = COMPRIMENTOS[tipo];
  const variante = ["icone", "marca", "completo"].includes(opcoes.variante) ? opcoes.variante : "icone";
  const guias = opcoes.guias ? "com-guias" : "";

  const larguraIcone = opcoes.larguraIconeMm ?? (variante === "icone" ? 14 : 11);
  const icone = `<div class="icone">${iconeInline()}</div>`;
  const marca = textoSvg(opcoes.curvasMarca, 7.5, "#FFFFFF");
  const handle = textoSvg(opcoes.curvasHandle, 4.6, "rgba(255,255,255,.78)");

  /** Uma "célula" do padrão; ela se repete ao longo da fita. */
  const celula =
    variante === "icone"
      ? icone
      : variante === "marca"
        ? `${icone}${marca}`
        : `${icone}${marca}${handle}`;

  // repete o suficiente para cobrir o comprimento com folga (o overflow é cortado)
  const passo = opcoes.passoMm ?? (variante === "icone" ? 70 : variante === "marca" ? 95 : 130);
  const repeticoes = Math.ceil(comprimento / passo) + 1;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${tipo === "chaveiro" ? "Chaveiro" : "Cordão"} ${variante} — ${comprimento} × ${LARGURA} mm</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${comprimento + SANGRIA * 2}mm ${LARGURA + SANGRIA * 2}mm; margin: 0; }

  .fita {
    position: relative;
    width: ${comprimento + SANGRIA * 2}mm;
    height: ${LARGURA + SANGRIA * 2}mm;
    background: var(--preto);
    display: flex; align-items: center;
    padding: 0 ${SANGRIA + 6}mm;
    gap: ${Math.max(6, passo * 0.18)}mm;
    overflow: hidden;
  }
  .icone { flex: none; width: ${larguraIcone}mm; color: ${variante === "icone" ? "var(--cinza-marca)" : "#FFFFFF"}; }
  .icone svg { width: 100%; height: auto; display: block; }
  .txt { flex: none; display: block; }
  /* espaço extra depois de cada célula, para o padrão respirar */
  .celula { display: flex; align-items: center; gap: ${Math.max(4, passo * 0.06)}mm; flex: none; }

  .guia { display: none; }
  .com-guias .guia {
    display: block; position: absolute;
    left: ${SANGRIA}mm; top: ${SANGRIA}mm;
    width: ${comprimento}mm; height: ${LARGURA}mm;
    outline: .2mm solid rgba(255,80,80,.85);
  }
</style>
</head>
<body class="${guias}">
  <div class="fita">
    <div class="guia"></div>
    ${Array.from({ length: repeticoes }, () => `<div class="celula">${celula}</div>`).join("\n    ")}
  </div>
</body>
</html>`;
}

export const meta = {
  nome: "cordao",
  comprimentos: COMPRIMENTOS,
  larguraMm: LARGURA,
  sangriaMm: SANGRIA,
  variantes: ["icone", "marca", "completo"],
  // mantido para quem já consumia: medidas do cordão de pescoço
  formatoMm: [COMPRIMENTOS.pescoco + SANGRIA * 2, LARGURA + SANGRIA * 2],
  finalMm: [COMPRIMENTOS.pescoco, LARGURA],
};
