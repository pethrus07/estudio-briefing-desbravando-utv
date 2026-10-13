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
 *
 * IDEIA DESCARTADA em 13/10/2026 — campo de curvas de nível no núcleo. A ideia era
 * trazer para o adesivo o relevo que a série de programação usa. O SVG saía correto
 * (20 curvas, cobrindo todo o quadro — conferido contando os <path> no arquivo), mas
 * no PDF aparecia UMA só: o `clip-path` não sobrevive ao `--print-to-pdf` do Chrome,
 * que é o mecanismo pelo qual este arquivo vai para a gráfica. Elemento que o arquivo
 * final não reproduz é passivo, não enfeite, então o campo saiu. A extração que ela
 * motivou — `ferramentas/campo-curvas.mjs` — ficou, e serve às peças em PNG.
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
 * TEXTO EM ARCO — cada glifo posicionado e girado ao longo de uma circunferência.
 *
 * O desenho anterior era uma pilha centrada dentro de um círculo: o círculo não fazia
 * trabalho nenhum, e por isso a peça lia como "simples". Aqui o anel passa a carregar o
 * texto, que é o que faz um selo parecer selo.
 *
 * Convenções (SVG tem Y para baixo, então ângulo cresce no sentido horário visual):
 *   · topo do disco = −90°; base = +90°
 *   · no ARCO DE CIMA o glifo gira (θ+90°) e cresce PARA FORA do centro, então a
 *     baseline fica no raio interno da faixa;
 *   · no ARCO DE BAIXO o glifo gira (θ−90°) e cresce PARA DENTRO — e se percorre o arco
 *     no sentido inverso, senão o texto sai de cabeça para baixo. Por isso a baseline
 *     dele fica no raio EXTERNO: assim os dois arcos ocupam a mesma faixa.
 *
 * O espaçamento usa o AVANÇO da fonte, não a largura da tinta: largura de tinta faria o
 * vão entre letras variar com o desenho de cada uma e "ORIGENS" sairia esburacado.
 */
function arcoTexto(glifos, { cx, cy, raio, alturaMm, centroGrau, base = false, espacoMm = 0 }) {
  const altaRef = Math.max(...glifos.map((g) => g.altura)) || 1000;
  const k = alturaMm / altaRef;
  const avancos = glifos.map((g) => g.avanco * k + espacoMm);
  const total = avancos.reduce((s, a) => s + a, 0) - espacoMm;
  const vao = total / raio; // radianos ocupados pelo texto inteiro
  const centroRad = (centroGrau * Math.PI) / 180;
  const sentido = base ? -1 : 1;

  let andado = 0;
  const partes = [];
  for (let i = 0; i < glifos.length; i++) {
    const meio = andado + avancos[i] / 2;
    const theta = centroRad + sentido * (meio - total / 2) / raio;
    const px = cx + raio * Math.cos(theta);
    const py = cy + raio * Math.sin(theta);
    const giro = (theta * 180) / Math.PI + (base ? -90 : 90);
    partes.push(
      `<g transform="translate(${px.toFixed(3)} ${py.toFixed(3)}) rotate(${giro.toFixed(3)}) ` +
        `scale(${k.toFixed(6)}) translate(${(-glifos[i].avanco / 2).toFixed(1)} 0)">` +
        `<path d="${glifos[i].d}"/></g>`
    );
    andado += avancos[i];
  }
  return { svg: partes.join("\n    "), vaoGrau: (vao * 180) / Math.PI };
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
  const g = opcoes.arcos ?? {};

  /* ---------- geometria do selo ----------
     Faixa do anel entre 59 e 71 mm de raio. O arco de cima apoia a baseline no raio
     interno (cresce para fora) e o de baixo no externo (cresce para dentro), de modo
     que os dois ficam DENTRO da mesma faixa, sem invadir o nucleo nem furar a borda. */
  const rBorda = raio - 3.5;   // 71.5 — anel externo fino
  const rFaixa = raio - 15.5;  // 59.5 — onde a faixa termina e o nucleo comeca
  const rTopoBase = rFaixa + 2.5;
  const rBaseBase = rBorda - 2.5;
  const alturaArco = 7;

  const arcoCima = g.topo?.length
    ? arcoTexto(g.topo, { cx: centro, cy: centro, raio: rTopoBase, alturaMm: alturaArco, centroGrau: -90, espacoMm: 0.9 })
    : { svg: "" };
  const arcoBaixo = g.base?.length
    ? arcoTexto(g.base, { cx: centro, cy: centro, raio: rBaseBase, alturaMm: alturaArco * 0.62, centroGrau: 90, base: true, espacoMm: 1.1 })
    : { svg: "" };

  /* Losangos as 3h e as 9h: fecham a faixa e separam os dois arcos. Sem eles os textos
     parecem dois fragmentos soltos em vez de uma volta inteira. */
  const rSep = (rTopoBase + rBaseBase) / 2;
  const losango = (grau, lado) => {
    const t = (grau * Math.PI) / 180;
    const x = centro + rSep * Math.cos(t);
    const y = centro + rSep * Math.sin(t);
    return `<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(45)">` +
      `<rect x="${(-lado / 2).toFixed(2)}" y="${(-lado / 2).toFixed(2)}" width="${lado}" height="${lado}"/></g>`;
  };

  /* ---------- nucleo ---------- */
  const larguraLogo = 30;
  const alturaLogo = (larguraLogo * L.altura) / L.largura;
  const rotulo = texto(c.rotulo, { larguraMm: 17 });
  const num = texto(c.numero, { alturaMm: 38 });
  const ano = texto(c.ano, { larguraMm: 20 });

  const respiros = { logoRotulo: 6, rotuloNumero: 3.2, numeroAno: 7 };
  const alturaNucleo =
    alturaLogo + respiros.logoRotulo + rotulo.altura + respiros.rotuloNumero +
    num.altura + respiros.numeroAno + ano.altura;

  let y = centro - alturaNucleo / 2;
  const partes = [];
  const poe = (bloco, topoY, xCentro = centro) =>
    partes.push(
      `<g transform="translate(${(xCentro - bloco.largura / 2).toFixed(3)} ${(topoY - bloco.topo).toFixed(3)}) scale(${bloco.escala.toFixed(6)})">` +
        `<path d="${bloco.d}"/></g>`
    );

  partes.push(
    `<g transform="translate(${(centro - larguraLogo / 2).toFixed(3)} ${y.toFixed(3)}) scale(${(larguraLogo / L.largura).toFixed(6)})">` +
      `<path d="${L.d}"/></g>`
  );
  y += alturaLogo + respiros.logoRotulo;
  poe(rotulo, y);
  y += rotulo.altura + respiros.rotuloNumero;
  poe(num, y);
  y += num.altura + respiros.numeroAno;
  const yAno = y;

  /* O ano estava grudado na palavra, partido em 20/26 empilhado — vinha da referencia do
     cliente e, com "ORIGENS" (palavra curta), lia como defeito de montagem. Agora e um
     elemento proprio: inteiro, pequeno, centrado sob o numero, entre dois fios. */
  const fioAno = 13;
  const folgaFio = 3.4;
  const yFio = yAno + ano.altura / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pagina}mm" height="${pagina}mm"
     viewBox="0 0 ${pagina} ${pagina}">
  <!-- sangria: o fundo vaza ate a borda da pagina; o corte e o disco -->
  <rect x="0" y="0" width="${pagina}" height="${pagina}" fill="${fundo}"/>
  <circle cx="${centro}" cy="${centro}" r="${raio}" fill="${fundo}"/>
  <circle cx="${centro}" cy="${centro}" r="${rBorda.toFixed(2)}" fill="none" stroke="${tinta}" stroke-width="0.9"/>
  <circle cx="${centro}" cy="${centro}" r="${(rBorda - 1.6).toFixed(2)}" fill="none" stroke="${tinta}" stroke-width="0.35"/>
  <circle cx="${centro}" cy="${centro}" r="${rFaixa.toFixed(2)}" fill="none" stroke="${tinta82}" stroke-width="0.35"/>
  <g fill="${tinta}">
    ${arcoCima.svg}
  </g>
  <g fill="${tinta82}">
    ${arcoBaixo.svg}
  </g>
  <g fill="${tinta}">
    ${losango(0, 2.6)}
    ${losango(180, 2.6)}
  </g>
  <g fill="${tinta}">
${partes.join("")}
  </g>
  <g fill="${tinta82}">
    <rect x="${(centro - fioAno / 2 - folgaFio - 9).toFixed(2)}" y="${(yFio - 0.17).toFixed(2)}" width="9" height="0.34"/>
    <rect x="${(centro + fioAno / 2 + folgaFio).toFixed(2)}" y="${(yFio - 0.17).toFixed(2)}" width="9" height="0.34"/>
  </g>
  <g fill="${tinta82}">
    <g transform="translate(${(centro - ano.largura / 2).toFixed(3)} ${(yAno - ano.topo).toFixed(3)}) scale(${ano.escala.toFixed(6)})"><path d="${ano.d}"/></g>
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
  return {
    rotulo: { texto: "U T V", fonte: "Archivo-SemiBold.ttf" },
    numero: { texto: String(numero), fonte: "Anton-Regular.ttf" },
    ano: { texto: String(dados.ano ?? ""), fonte: "Archivo-SemiBold.ttf" },
  };
}

/** Textos que vao em ARCO: precisam vir glifo a glifo, nao como path unico. */
export function arcosNecessarios(dados) {
  const titulo = [dados.edicao, dados.publico].filter(Boolean).join(" ").toUpperCase();
  return {
    topo: { texto: titulo, fonte: "Anton-Regular.ttf" },
    base: { texto: String(dados.local ?? "").toUpperCase(), fonte: "Archivo-SemiBold.ttf" },
  };
}

export const meta = { nome: "adesivo-vetor", diametroMm: DIAMETRO, sangriaMm: SANGRIA };
