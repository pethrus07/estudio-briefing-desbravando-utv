/**
 * CAMISETA DA EQUIPE — camiseta preta, estampa branca.
 *
 *   Costas (nuca): ícone da montanha com 80 mm de largura + o cargo abaixo,
 *                  na mesma largura. Bloco centralizado.
 *   Frente:        só o ícone, 30 mm, no peito esquerdo de quem veste.
 *
 * Gera três coisas:
 *   arteEstampa("costas" | "frente")  arte no tamanho físico exato, fundo
 *                                     transparente, tudo em curvas
 *   mapaAplicacao()                   A4 com as duas vistas e as cotas
 *
 * O texto entra como path (ferramentas/texto-para-svg.py), não como fonte: a
 * estamparia não precisa ter Anton instalado.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------- medidas */

/* Costas: a PALAVRA manda no tamanho (80 mm) e o ícone vai menor, acima dela (30 mm).
   Era o contrário até 11/08 — o cliente inverteu as medidas. */
const TEXTO_COSTAS = 80; // mm de largura da palavra
const MONTANHA_COSTAS = 30; // mm de largura do ícone, acima da palavra
const MONTANHA_FRENTE = 30; // mm
const RESPIRO = 5; // mm entre o ícone e a palavra

/** Camiseta tamanho M, medidas reais em mm — o desenho é em escala. */
const CAMISETA = { largura: 520, comprimento: 710, gola: 180 };

/** Posição da estampa, em mm reais a partir da costura da gola / do centro. */
const POSICAO = {
  costasAbaixoDaGola: 60,
  frenteAbaixoDaGola: 130,
  frenteDoCentro: 90,
};

/* ------------------------------------------------------------------ marca */

/** Devolve o `d` e a proporção do ícone da montanha, lidos do SVG do repo. */
function montanha() {
  const svg = readFileSync(join(aqui, "..", "marca", "logo-montanha.svg"), "utf8");
  const d = svg.match(/\sd="([^"]+)"/)?.[1];
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
  if (!d || !vb) throw new Error("não consegui ler o path da montanha");
  return { d, largura: vb[2], altura: vb[3], proporcao: vb[3] / vb[2] };
}

const M = montanha();

/**
 * Bloco das costas em SVG, dimensionado em mm reais.
 * `curvas` vem do texto-para-svg.py: { d, viewBox, largura, altura } em milésimos de em.
 */
function blocoCostas(curvas, larguraTextoMm = TEXTO_COSTAS, larguraIconeMm = MONTANHA_COSTAS) {
  const escalaIcone = larguraIconeMm / M.largura;
  const alturaIcone = larguraIconeMm * M.proporcao;

  const escalaTexto = larguraTextoMm / curvas.largura;
  const [, yMin] = curvas.viewBox.split(/\s+/).map(Number);
  const alturaTexto = curvas.altura * escalaTexto;
  const topoTexto = alturaIcone + RESPIRO;
  // o path do texto tem a linha de base em y=0 e sobe para y negativo
  const deslocaTexto = topoTexto - yMin * escalaTexto;

  // o bloco tem a largura da palavra; o ícone, menor, fica centralizado sobre ela
  const largura = Math.max(larguraTextoMm, larguraIconeMm);
  const centraIcone = (largura - larguraIconeMm) / 2;

  return {
    largura,
    altura: topoTexto + alturaTexto,
    larguraIcone: larguraIconeMm,
    larguraTexto: larguraTextoMm,
    svgInterno: `
      <g transform="translate(${centraIcone.toFixed(3)} 0) scale(${escalaIcone.toFixed(6)})"><path d="${M.d}"/></g>
      <g transform="translate(0 ${deslocaTexto.toFixed(3)}) scale(${escalaTexto.toFixed(6)})"><path d="${curvas.d}"/></g>`,
  };
}

function blocoFrente(larguraMm = MONTANHA_FRENTE) {
  const escala = larguraMm / M.largura;
  return {
    largura: larguraMm,
    altura: larguraMm * M.proporcao,
    svgInterno: `<g transform="scale(${escala.toFixed(6)})"><path d="${M.d}"/></g>`,
  };
}

/* ------------------------------------------------- arte pronta para estampa */

/**
 * `fundo`:
 *   "preto"        arte branca sobre um retângulo preto, com folga em volta. É a
 *                  versão que se abre e se vê — a de mandar para alguém.
 *   "transparente" só a arte, sem fundo. Correta para produção, mas num visualizador
 *                  de fundo claro parece um arquivo vazio.
 * Nos dois casos o conteúdo é o mesmo vetor (curvas), no tamanho físico exato.
 */
export function arteEstampa({ lado = "costas", cargo = "PRODUÇÃO", curvas, cor = "#FFFFFF", fundo = "preto" }) {
  const bloco = lado === "frente" ? blocoFrente() : blocoCostas(curvas);
  const folga = fundo === "preto" ? Math.max(8, bloco.largura * 0.22) : 0;
  const l = +(bloco.largura + folga * 2).toFixed(2);
  const a = +(bloco.altura + folga * 2).toFixed(2);

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Estampa ${lado} — ${cargo} · arte ${bloco.largura.toFixed(1)}×${bloco.altura.toFixed(1)} mm</title>
<style>
  @page { size: ${l}mm ${a}mm; margin: 0; }
  html, body { margin: 0; padding: 0; background: transparent; }
  svg { display: block; }
</style>
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${l}mm" height="${a}mm" viewBox="0 0 ${l} ${a}">
    ${fundo === "preto" ? `<rect x="0" y="0" width="${l}" height="${a}" fill="#000000"/>` : ""}
    <g transform="translate(${folga.toFixed(3)} ${folga.toFixed(3)})" fill="${cor}">
      ${bloco.svgInterno}
    </g>
  </svg>
</body>
</html>`;
}

/* --------------------------------------------------- mapa de aplicação (A4) */

/** Silhueta da camiseta em mm reais. `frente` muda só a profundidade do decote. */
function silhueta(frente) {
  const decote = frente ? 92 : 60;
  return `
    M260 35
    L130 62 L38 175 L112 214 L136 180
    L136 700 L564 700 L564 180
    L588 214 L662 175 L570 62
    L440 35
    Q350 ${decote} 260 35 Z`;
}

/**
 * Cota com rótulo em curvas. O rótulo vem do `curvasDe` injetado (Archivo em path):
 * <text> dentro de SVG com viewBox escalado sai do Chrome como Type3 — texto virado
 * desenho de baixa qualidade —, e medida é justamente o que não pode sair borrado.
 */
function cota(curvasDe, x1, y1, x2, y2, texto, { vertical = false, alturaRotulo = 20, rotuloAEsquerda = false } = {}) {
  const c = curvasDe(texto);
  const escala = alturaRotulo / 1000;
  const largura = c.largura * escala;
  const meioX = (x1 + x2) / 2;
  const meioY = (y1 + y2) / 2;
  const rx = vertical ? (rotuloAEsquerda ? x1 - 14 - largura : x1 + 14) : meioX - largura / 2;
  const ry = vertical ? meioY + alturaRotulo * 0.36 : y1 - 12;

  return `
    <g class="cota">
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      ${
        vertical
          ? `<line class="serifa" x1="${x1 - 9}" y1="${y1}" x2="${x1 + 9}" y2="${y1}"/>
             <line class="serifa" x1="${x2 - 9}" y1="${y2}" x2="${x2 + 9}" y2="${y2}"/>`
          : `<line class="serifa" x1="${x1}" y1="${y1 - 9}" x2="${x1}" y2="${y1 + 9}"/>
             <line class="serifa" x1="${x2}" y1="${y2 - 9}" x2="${x2}" y2="${y2 + 9}"/>`
      }
      <g class="rotulo" transform="translate(${rx.toFixed(1)} ${ry.toFixed(1)}) scale(${escala.toFixed(6)})">
        <path d="${c.d}"/>
      </g>
    </g>`;
}

function vista({ frente, bloco, cargo, curvasDe }) {
  const centro = 350;
  const x = frente ? centro + POSICAO.frenteDoCentro - bloco.largura / 2 : centro - bloco.largura / 2;
  const y = 35 + (frente ? POSICAO.frenteAbaixoDaGola : POSICAO.costasAbaixoDaGola);
  const c = (...args) => cota(curvasDe, ...args);

  const cotas = frente
    ? // vertical com rótulo à esquerda do eixo (a arte fica à direita, não há disputa)
      c(x, y - 26, x + bloco.largura, y - 26, `${bloco.largura} mm`) +
      c(centro, 35, centro, y, `${POSICAO.frenteAbaixoDaGola} mm`, { vertical: true, rotuloAEsquerda: true }) +
      c(centro, y + bloco.altura + 70, x + bloco.largura / 2, y + bloco.altura + 70, `${POSICAO.frenteDoCentro} mm`)
    : // duas larguras nas costas: a palavra (bloco) embaixo e o ícone, menor, em cima
      c(x, y + bloco.altura + 34, x + bloco.largura, y + bloco.altura + 34, `${bloco.larguraTexto} mm`) +
      c(
        x + (bloco.largura - bloco.larguraIcone) / 2,
        y - 24,
        x + (bloco.largura + bloco.larguraIcone) / 2,
        y - 24,
        `${bloco.larguraIcone} mm`
      ) +
      c(210, 35, 210, y, `${POSICAO.costasAbaixoDaGola} mm`, { vertical: true, rotuloAEsquerda: true });

  return `
  <figure class="vista">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 0 740 740">
      <path class="tecido" d="${silhueta(frente)}"/>
      <line class="gola" x1="260" y1="35" x2="440" y2="35"/>
      <line class="eixo" x1="350" y1="20" x2="350" y2="720"/>
      <g class="estampa" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <svg viewBox="0 0 ${bloco.largura} ${bloco.altura}" width="${bloco.largura}" height="${bloco.altura}" fill="#FFFFFF">
          ${bloco.svgInterno}
        </svg>
      </g>
      ${cotas}
    </svg>
    <figcaption>
      <span class="vista-nome">${frente ? "Frente" : "Costas"}</span>
      <span class="vista-nota">${
        frente
          ? "Ícone só. Peito <strong>esquerdo de quem veste</strong> — nesta vista de frente, aparece à direita."
          : `Ícone + <strong>${cargo}</strong>, centralizado na altura da nuca.`
      }</span>
    </figcaption>
  </figure>`;
}

export function mapaAplicacao({ cargo = "PRODUÇÃO", curvas, curvasDe } = {}) {
  const costas = blocoCostas(curvas);
  const frente = blocoFrente();

  const especificacoes = [
    ["Peça", "Camiseta preta · uniforme da equipe"],
    ["Estampa", "1 cor — <strong>branco #FFFFFF</strong>, sem meio-tom nem degradê"],
    ["Técnica", "serigrafia 1 cor ou DTF (a arte é vetorial, serve nas duas)"],
    ["Costas", `<strong>${cargo} com ${costas.larguraTexto} mm</strong> de largura e o ícone com <strong>${costas.larguraIcone} mm</strong> centralizado acima · bloco ${costas.largura} × ${costas.altura.toFixed(0)} mm · centralizado, ${POSICAO.costasAbaixoDaGola} mm abaixo da costura da gola`],
    ["Frente", `ícone <strong>${frente.largura} mm</strong> de largura (${frente.altura.toFixed(1)} mm de altura) · ${POSICAO.frenteDoCentro} mm do centro, ${POSICAO.frenteAbaixoDaGola} mm abaixo da gola`],
    ["Tipografia", "Anton, já convertida em curvas — não é preciso ter a fonte"],
    ["Referência", `silhueta desenhada no tamanho M (${CAMISETA.largura} mm de largura × ${CAMISETA.comprimento} mm)`],
  ];

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Camiseta da equipe — ${cargo}</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: 210mm 297mm; margin: 0; }
  /* Alturas apertadas de propósito: o conteúdo tem de fechar em UMA página A4. */
  .folha { width: 210mm; height: 297mm; background: var(--preto); padding: 13mm 15mm; overflow: hidden; }
  .marca { height: 9mm; width: auto; display: block; margin-bottom: 7mm; }
  .sobrelinha { font-size: 2.8mm; letter-spacing: 1.5mm; margin-bottom: 2.5mm; }
  h1 { font-family: "Anton"; font-size: 11mm; line-height: 1.06; text-transform: uppercase; letter-spacing: -.2mm; }
  .intro { font-size: 3.1mm; line-height: 1.45; color: var(--texto); max-width: 145mm; margin-top: 3.5mm; }

  .vistas { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; margin-top: 6mm; }
  .vista svg { width: 100%; height: auto; display: block; }
  .tecido { fill: #141414; stroke: rgba(255,255,255,.34); stroke-width: 2.5; }
  .gola { stroke: rgba(255,255,255,.34); stroke-width: 2.5; }
  .eixo { stroke: rgba(255,255,255,.16); stroke-width: 1.6; stroke-dasharray: 10 10; }
  .cota line { stroke: rgba(255,255,255,.7); stroke-width: 1.8; }
  .cota .serifa { stroke-width: 1.8; }
  .cota .rotulo path { fill: rgba(255,255,255,.9); }

  figcaption { margin-top: 2.5mm; }
  .vista-nome {
    display: block; font-family: "Anton"; font-size: 4.6mm;
    text-transform: uppercase; color: var(--branco);
  }
  .vista-nota { display: block; margin-top: 1.2mm; font-size: 2.85mm; line-height: 1.4; color: var(--texto); }
  .vista-nota strong { color: var(--branco); }

  h2 {
    margin-top: 6.5mm; font-size: 2.8mm; font-weight: 600; letter-spacing: 1.2mm;
    text-transform: uppercase; color: var(--label);
    padding-bottom: 2mm; border-bottom: .4mm solid var(--divisor);
  }
  table { width: 100%; border-collapse: collapse; }
  th, td {
    text-align: left; vertical-align: top; padding: 1.8mm 0; font-size: 3mm; line-height: 1.4;
    border-bottom: .3mm solid rgba(255,255,255,.08);
  }
  th { width: 30mm; font-weight: 600; color: rgba(255,255,255,.62); padding-right: 5mm; }
  td { color: var(--texto); }
  td strong { color: var(--branco); }
  .rodape {
    margin-top: 5.5mm; padding-top: 3mm; border-top: .4mm solid var(--divisor);
    font-size: 2.6mm; letter-spacing: .8mm; text-transform: uppercase; color: rgba(255,255,255,.38);
    display: flex; justify-content: space-between;
  }
</style>
</head>
<body>
  <div class="folha">
    <img class="marca" src="../marca/logo-desbravando.png" alt="Desbravando UTV">
    <p class="sobrelinha">Uniforme da equipe</p>
    <h1>Camiseta preta<br>${cargo}</h1>
    <p class="intro">Mapa de aplicação e medidas. As artes de estampa vão em arquivo separado,
    em curvas e com fundo transparente.</p>

    <div class="vistas">
      ${vista({ frente: false, bloco: costas, cargo, curvasDe })}
      ${vista({ frente: true, bloco: frente, cargo, curvasDe })}
    </div>

    <h2>Especificação</h2>
    <table>
      ${especificacoes.map(([r, v]) => `<tr><th>${r}</th><td>${v}</td></tr>`).join("\n      ")}
    </table>

    <div class="rodape"><span>Desbravando UTV</span><span>desbravandoutv.com</span></div>
  </div>
</body>
</html>`;
}

export const meta = {
  nome: "camiseta",
  textoCostasMm: TEXTO_COSTAS,
  iconeCostasMm: MONTANHA_COSTAS,
  frenteMm: MONTANHA_FRENTE,
};
