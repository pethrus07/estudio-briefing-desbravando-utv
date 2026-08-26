/**
 * ADESIVO DO UTV — 100% VETOR.
 *
 * Reconstruído em 21/08/2026 depois de a gráfica reclamar de serrilhado ao dar zoom.
 * A versão anterior era HTML/CSS: o logotipo entrava como PNG e, na variante branca,
 * o filtro CSS ainda rasterizava a marca a ~30 dpi. Aqui não há uma única imagem —
 * o arquivo é geometria do começo ao fim:
 *
 *   · disco e anel   →  <circle>
 *   · logotipo       →  path vetorizado do PNG (ferramentas/vetorizar-png.py)
 *   · todo o texto   →  curvas da fonte (ferramentas/texto-para-svg.py)
 *
 * Nada depende de fonte instalada e nada tem resolução: amplia o quanto quiser.
 *
 * O número é o único elemento variável — a série de 01 a 20 sai do mesmo desenho.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

const DIAMETRO = 150; // mm
const SANGRIA = 3; // mm

/** Logotipo vetorizado: devolve o `d` e a proporção, lidos do SVG do repo. */
function logotipo() {
  const svg = readFileSync(join(aqui, "..", "marca", "logo-desbravando.svg"), "utf8");
  const d = svg.match(/\sd="([^"]+)"/)?.[1];
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
  if (!d || !vb) throw new Error("logo-desbravando.svg sem path — rode o vetorizar-png.py");
  return { d, largura: vb[2], altura: vb[3] };
}

/**
 * Prepara um texto já convertido em curvas para ser desenhado numa medida física.
 * `curvas` = { d, viewBox, largura, altura } em milésimos de em, baseline em y=0.
 * Passe `larguraMm` OU `alturaMm`.
 */
function texto(curvas, { larguraMm, alturaMm }) {
  const [, yMin] = curvas.viewBox.split(/\s+/).map(Number);
  const escala = larguraMm ? larguraMm / curvas.largura : alturaMm / curvas.altura;
  return {
    d: curvas.d,
    escala,
    largura: curvas.largura * escala,
    altura: curvas.altura * escala,
    topo: yMin * escala, // negativo: distância da baseline até o topo do desenho
  };
}

export function adesivoVetor(dados, opcoes = {}) {
  const numero = String(opcoes.numero ?? dados.adesivo?.numero ?? "01");
  const tema = opcoes.tema === "branco" ? "branco" : "preto";
  const claro = tema === "branco";
  const c = opcoes.curvas ?? {};

  const pagina = DIAMETRO + SANGRIA * 2;
  const centro = pagina / 2;
  const raio = DIAMETRO / 2;

  const fundo = claro ? "#FFFFFF" : "#000000";
  const tinta = claro ? "#111111" : "#FFFFFF";
  const tinta82 = claro ? "#3B3B3B" : "#DEDEDE";

  const L = logotipo();
  const larguraLogo = 30;
  const alturaLogo = (larguraLogo * L.altura) / L.largura;

  // larguras-alvo em mm, espelhando o layout já aprovado em HTML
  const edicao = texto(c.edicao, { larguraMm: 66 });
  const publico = texto(c.publico, { larguraMm: 56 });
  const ano1 = texto(c.ano1, { larguraMm: 11 });
  const ano2 = texto(c.ano2, { larguraMm: 11 });
  const local = texto(c.local, { larguraMm: 30 });
  const rotulo = texto(c.rotulo, { larguraMm: 20 });
  const num = texto(c.numero, { alturaMm: 30 });

  /* Empilhamento: cada respiro foi conferido contra a versão aprovada. */
  const respiros = { logoEdicao: 7, edicaoPublico: 3.5, publicoLocal: 6, localRotulo: 8, rotuloNumero: 2.5 };
  const alturaTotal =
    alturaLogo +
    respiros.logoEdicao +
    edicao.altura +
    respiros.edicaoPublico +
    publico.altura +
    respiros.publicoLocal +
    local.altura +
    respiros.localRotulo +
    rotulo.altura +
    respiros.rotuloNumero +
    num.altura;

  let y = centro - alturaTotal / 2; // topo do conjunto, centralizado no disco

  const partes = [];
  const põe = (bloco, topoY, xCentro = centro) =>
    partes.push(
      `<g transform="translate(${(xCentro - bloco.largura / 2).toFixed(3)} ${(topoY - bloco.topo).toFixed(3)}) scale(${bloco.escala.toFixed(6)})">` +
        `<path d="${bloco.d}"/></g>`
    );

  // logotipo
  partes.push(
    `<g transform="translate(${(centro - larguraLogo / 2).toFixed(3)} ${y.toFixed(3)}) scale(${(larguraLogo / L.largura).toFixed(6)})">` +
      `<path d="${L.d}"/></g>`
  );
  y += alturaLogo + respiros.logoEdicao;

  põe(edicao, y);
  y += edicao.altura + respiros.edicaoPublico;

  /* "FAMÍLIA" + ano: o conjunto é centralizado, e os dois blocos do ano ficam
     empilhados à direita da palavra, alinhados pelo topo dela. */
  const folgaAno = 2.4;
  const larguraConjunto = publico.largura + folgaAno + Math.max(ano1.largura, ano2.largura);
  const xPublico = centro - larguraConjunto / 2 + publico.largura / 2;
  põe(publico, y, xPublico);
  const xAno = centro - larguraConjunto / 2 + publico.largura + folgaAno;
  const alturaLinhaAno = publico.altura / 2 - 0.6;
  põe(ano1, y + 0.6, xAno + ano1.largura / 2);
  põe(ano2, y + 0.6 + alturaLinhaAno, xAno + ano2.largura / 2);
  y += publico.altura + respiros.publicoLocal;

  põe(local, y);
  y += local.altura + respiros.publicoLocal * 0 + respiros.localRotulo;

  põe(rotulo, y);
  y += rotulo.altura + respiros.rotuloNumero;

  põe(num, y);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pagina}mm" height="${pagina}mm"
     viewBox="0 0 ${pagina} ${pagina}">
  <!-- sangria: o fundo vaza até a borda da página; o corte é o disco -->
  <rect x="0" y="0" width="${pagina}" height="${pagina}" fill="${fundo}"/>
  <circle cx="${centro}" cy="${centro}" r="${raio}" fill="${fundo}"/>
  <circle cx="${centro}" cy="${centro}" r="${raio - 4}" fill="none" stroke="${claro ? "#1A1A1A" : "#F2F2F2"}" stroke-width="0.7"/>
  <g fill="${tinta}">
${partes.slice(0, 4).join("\n")}
  </g>
  <g fill="${tinta82}">
${partes.slice(4, 6).join("\n")}
  </g>
  <g fill="${tinta}">
${partes.slice(6).join("\n")}
  </g>
</svg>`;

  return {
    svg,
    html: `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8">
<title>Adesivo UTV ${numero} — ${DIAMETRO} mm (${tema}) · 100% vetor</title>
<style>
  @page { size: ${pagina}mm ${pagina}mm; margin: 0; }
  html, body { margin: 0; padding: 0; }
  svg { display: block; }
</style></head>
<body>
${svg}
</body>
</html>`,
    medidas: { finalMm: [DIAMETRO, DIAMETRO], paginaMm: [pagina, pagina], sangriaMm: SANGRIA, numero, tema },
  };
}

/** Textos que o render precisa converter em curvas antes de chamar o template. */
export function textosNecessarios(dados, numero) {
  const ano = String(dados.ano ?? "");
  return {
    edicao: { texto: String(dados.edicao ?? "").toUpperCase(), fonte: "Anton-Regular.ttf" },
    publico: { texto: String(dados.publico ?? "").toUpperCase(), fonte: "Anton-Regular.ttf" },
    ano1: { texto: ano.slice(0, 2), fonte: "Anton-Regular.ttf" },
    ano2: { texto: ano.slice(2), fonte: "Anton-Regular.ttf" },
    local: { texto: String(dados.local ?? ""), fonte: "Archivo-Regular.ttf" },
    rotulo: { texto: "U T V", fonte: "Archivo-SemiBold.ttf" },
    numero: { texto: String(numero), fonte: "Anton-Regular.ttf" },
  };
}

export const meta = { nome: "adesivo-vetor", diametroMm: DIAMETRO, sangriaMm: SANGRIA };
