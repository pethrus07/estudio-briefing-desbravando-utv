/**
 * CAMPO DE CURVAS DE NÍVEL — o relevo P&B da identidade Desbravando, como função.
 *
 * Extraído do `topografia.mjs` em 13/10/2026, quando o adesivo do UTV passou a querer o
 * mesmo fundo que a série de programação já usava. O `topografia.mjs` era script de linha
 * de comando que gravava um arquivo: servia para gerar textura de fundo, não para desenhar
 * dentro de outra peça. Copiar a matemática para o adesivo faria as duas famílias
 * divergirem na primeira mudança — que é exatamente o defeito que o próprio topografia.mjs
 * existe para corrigir (o script original da série tinha se perdido).
 *
 * Como funciona: cada curva é uma linha horizontal deslocada pela soma de TRÊS senos de
 * comprimento de onda diferente — é isso que dá relevo irregular de mapa em vez de onda de
 * rádio. A fase de cada seno depende da semente por múltiplos IRRACIONAIS: com múltiplos
 * inteiros, as sementes 2 e 4 sairiam parecidas. Toda quinta curva sai mais grossa, porque
 * em carta topográfica essa é a curva mestra — é o detalhe que faz ler como mapa.
 *
 * A amostragem em x é de 18 unidades e os pontos viram Bézier por Catmull-Rom: polilinha
 * pura mostraria os vértices quando o fundo é ampliado, e adesivo é feito para ampliar.
 */

const DX = 18;

/** Fase por semente, em múltiplos irracionais. */
const fase = (semente, i) => semente * [0.618, 1.324, 2.207][i];

function curva(n, { largura, passo, semente, amplitudes }) {
  const y0 = -240 + n * passo;
  const pts = [];
  for (let x = 0; x <= largura + DX; x += DX) {
    const y =
      y0 +
      amplitudes[0] * Math.sin(x / 210 + fase(semente, 0) + n * 0.21) +
      amplitudes[1] * Math.sin(x / 97 - fase(semente, 1) - n * 0.13) +
      amplitudes[2] * Math.sin(x / 43 + fase(semente, 2) + n * 0.37);
    pts.push([x, y]);
  }
  let d = `M${pts[0][0]} ${Math.round(pts[0][1])}`;
  const r = (v) => Math.round(v * 10) / 10;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

/**
 * Os `<path>` do campo, sem envelope — quem chama decide o `<svg>`, o `<g>` ou o recorte.
 * `amplitudes` são as alturas dos três senos. O padrão [46, 22, 9] é o da série de
 * programação, e é exato de propósito: derivar os dois menores por fator do maior daria
 * 21,988 e 9,016, e a extração deixaria de reproduzir o original byte a byte — o que
 * tiraria a única prova de que ela é fiel.
 */
export function campoDeCurvas({
  largura = 1080,
  altura = 1920,
  semente = 1,
  passo = 52,
  amplitudes = [46, 22, 9],
  larguraTraco = 0.7,
  larguraMestra = 1.5,
  opacidade = 0.62,
} = {}) {
  const n = Math.ceil((altura + 480) / passo);
  const paths = [];
  for (let i = 0; i < n; i++) {
    const mestra = i % 5 === 0;
    paths.push(
      `<path stroke-width="${mestra ? larguraMestra : larguraTraco}" ` +
        `opacity="${mestra ? 1 : opacidade}" d="${curva(i, { largura, passo, semente, amplitudes })}"/>`
    );
  }
  return paths;
}

/** O SVG completo, como o topografia.mjs sempre entregou. */
export function campoSvg(opcoes = {}) {
  const { largura = 1080, altura = 1920 } = opcoes;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} ${altura}" ` +
    `preserveAspectRatio="xMidYMid slice" aria-hidden="true" ` +
    `fill="none" stroke="currentColor" stroke-linecap="round">` +
    campoDeCurvas(opcoes).join("") +
    `</svg>\n`
  );
}
