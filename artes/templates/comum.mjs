/**
 * CROMO COMUM das peças de social da Desbravando.
 *
 * Fundo de curvas de nível + véu, coluna de três faixas (marca no topo, miolo elástico,
 * fecho no rodapé), assinatura lateral e o bloco de título. É o que faz peça de
 * programação, código de conduta, carta de drinks e proposta de expedição lerem como uma
 * família — cada uma tem a sua estrutura de miolo, mas o quadro é o mesmo.
 *
 * Existe porque a terceira peça ia copiar esse CSS pela terceira vez. Copiado, ele
 * divergiria: uma peça com o véu novo, outra com o véu velho, e ninguém saberia qual é o
 * certo. Aqui muda num lugar e vale para todas — o que também significa que mexer aqui
 * mexe em TODAS as peças já entregues, então mudança de cromo pede re-render e conferência
 * das anteriores (o teste é o md5 do PNG antes e depois).
 *
 * REGRA DURA de todas elas: nenhum texto com line-height abaixo de 1. A caixa do Anton é
 * mais curta que o glifo (asc 1,176 + desc 0,329 = 1,505em de altura natural), então
 * entrelinha comprimida faz a letra invadir a vizinha sem que nenhuma regra de CSS pareça
 * errada. Espaço óptico se resolve com margin.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

export const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** SVG do repo, embutido para herdar a cor — filtro CSS rasterizaria o elemento. */
export function svgDoRepo(arquivo, extra = "", pasta = "marca") {
  return readFileSync(join(aqui, "..", pasta, arquivo), "utf8")
    .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, "")
    .replace("<svg", `<svg ${extra}`)
    .replace(/fill="(#fff|#ffffff|#FFF|#FFFFFF|white)"/g, 'fill="currentColor"');
}

/**
 * Escala tipográfica da peça. `k` multiplica o corpo, e as medidas escritas como
 * `${n / fmt.k}em` viram px constante — é assim que o quadro (padding, largura da marca)
 * fica igual enquanto o texto cresce ou diminui.
 */
export const FORMATOS = { stories: { l: 1080, a: 1920, k: 1 } };

export function escala(dados, opcoes = {}) {
  const base = FORMATOS[opcoes.formato] ?? FORMATOS.stories;
  return { ...base, k: base.k * (dados.escala ?? 1) };
}

/** CSS do quadro: base, fundo, coluna de três faixas, marca, bloco de título, rótulo de seção. */
export function cssCromo(fmt) {
  return `  *{ margin:0; padding:0; box-sizing:border-box }
  html,body{ width:${fmt.l}px; height:${fmt.a}px; overflow:hidden }
  body{
    background:#000; color:#fff; font-size:${16 * fmt.k}px;
    font-family:"Archivo",sans-serif; font-weight:400; -webkit-font-smoothing:antialiased;
  }
  .peca{ position:relative; width:${fmt.l}px; height:${fmt.a}px; overflow:hidden }

  /* ---------- fundo ---------- */
  .topo{ position:absolute; inset:0; color:#fff; opacity:.30; pointer-events:none }
  .topo svg{ width:100%; height:100%; display:block }
  .veu{
    position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(180deg,
      rgba(0,0,0,.58) 0%, rgba(0,0,0,.20) 9%, rgba(0,0,0,.66) 20%,
      rgba(0,0,0,.82) 32%, rgba(0,0,0,.84) 76%, rgba(0,0,0,.68) 90%,
      rgba(0,0,0,.44) 100%);
  }

  /* ---------- ritmo: marca no topo, miolo elástico, fecho no rodapé ---------- */
  .coluna{
    position:absolute; inset:0;
    display:grid; grid-template-rows:auto 1fr auto;
    padding:${4 / fmt.k}em ${4.2 / fmt.k}em ${3.2 / fmt.k}em;
  }
  .miolo{ display:grid; align-content:center; padding:1.4em 0 }
  .bl-titulo{ margin-bottom:5em }

  .marca{ width:${17.5 / fmt.k}em; color:#fff }
  .marca svg{ width:100%; height:auto; display:block; fill:currentColor }

  /* ---------- título ---------- */
  .rot{
    display:block; font-size:.9em; line-height:1.3; letter-spacing:.3em;
    text-transform:uppercase; color:#c4c4c4; margin-bottom:1.1em;
  }
  h1{
    font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:4.5em; line-height:1.04; letter-spacing:-.018em; max-width:11em;
  }
  /* linha de eco do título: mesma leitura, mas espaçada — a palavra que muda o sentido
     de tudo não pode virar subtítulo de corpo pequeno. */
  .eco{
    display:block; font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:2.05em; line-height:1.14; letter-spacing:.3em; color:#fff; margin-top:.34em;
  }

  .secao-rot{
    display:block; font-size:.8em; line-height:1.3; letter-spacing:.24em;
    text-transform:uppercase; color:#9e9e9e; margin-top:1.1em;
  }`;
}

/**
 * Lista numerada: número em Anton · espinha · corpo. É a malha da agenda da programação,
 * e as peças de lista (conduta, drinks, roteiro de expedição) reusam ela de propósito —
 * é o que faz uma peça nova ler como parte do conjunto sem repetir o layout.
 *
 * Quem chamar pode sobrescrever depois (mesma especificidade, regra posterior ganha):
 * `gap` da lista e corpo do `h2` mudam por peça.
 */
export function cssLista(fmt) {
  return `  /* ---------- regras numeradas ----------
     Mesma malha da agenda da programação: número · trilho · corpo. */
  .regras{ list-style:none; display:grid; gap:3em; position:relative }
  /* a espinha e desenhada na LISTA, no eixo da coluna do trilho (3,2em do numero +
     metade dos 1,9em da coluna), e nao por item: um trilho por item vira toco solto
     quando a peca e arejada, porque o vao entre itens corta a linha. */
  .regras::before{
    content:""; position:absolute; left:calc(4.15em - 1px); top:.87em; bottom:0; width:2px;
    background:linear-gradient(180deg,
      rgba(255,255,255,.28) 0%, rgba(255,255,255,.28) 84%, rgba(255,255,255,0) 100%);
  }
  .regra{ display:grid; grid-template-columns:3.2em 1.9em 1fr; align-items:start }
  .num{
    font-family:"Anton",sans-serif; font-weight:400; font-size:2.3em; line-height:1;
    letter-spacing:-.01em; font-variant-numeric:tabular-nums; color:#fff;
  }
  .trilho{ position:relative; justify-self:center; width:2px; align-self:stretch }
  .trilho::before{
    content:""; position:absolute; top:.42em; left:50%; transform:translateX(-50%);
    width:.9em; height:.9em; border-radius:50%; background:#fff; box-shadow:0 0 0 .32em #000;
  }
  .corpo{ padding-left:1.4em; padding-bottom:.1em }
  .regra h2{
    font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:1.7em; line-height:1.1; letter-spacing:-.004em;
  }
  .lead{ font-size:1.14em; line-height:1.48; color:#dcdcdc; margin-top:.6em; max-width:39em }
  .itens{ list-style:none; display:grid; gap:.42em; margin-top:.72em }
  .itens li{
    display:flex; align-items:baseline; gap:.66em;
    font-size:1.14em; line-height:1.46; color:#c7c7c7; max-width:39em;
  }
  .itens li::before{
    content:""; width:.36em; height:.36em; border-radius:50%; background:rgba(255,255,255,.5);
    flex:none; transform:translateY(-.2em);
  }
  /* A observação sobre o motor do UTV explica por que as outras regras existem. Levou
     filete à esquerda por uma versão e saiu: era uma SEGUNDA linha vertical a 2px do
     trilho, e sujava a malha. Quem destaca a seção é o próprio título dela. */
  .destaque .lead{ color:#f2f2f2; font-weight:500 }`;
}

/** Fundo + véu, na ordem em que precisam entrar no `.peca`. */
export function htmlFundo(arquivo = "topografia-conduta.svg") {
  return `<div class="topo">${svgDoRepo(arquivo, "", "graficos")}</div>
  <div class="veu"></div>`;
}

/** Assinatura lateral: montanha · filete · #DESBRAVANDOUTV. */
export function htmlMarca() {
  return `<div class="marca">${svgDoRepo("logo-lateral.svg")}</div>`;
}
