/**
 * MANIFESTO — peça de código de conduta, identidade Desbravando.
 *
 * Mesma linguagem da série de programação (P&B, Anton em caixa alta, curvas de nível
 * no fundo, assinatura lateral no topo) numa estrutura diferente: ali é linha do tempo
 * de horários, aqui é regra numerada. A coluna de número + trilho + corpo é a MESMA da
 * agenda de propósito — é o que faz a peça ler como parte do conjunto sem repetir o
 * layout.
 *
 * Formato: 1080 × 1920 (WhatsApp), o único que ele pediu para a série.
 *
 * DENSIDADE é o problema desta peça, não o vão: são seis seções e ~27 linhas de texto.
 * A tentação é encolher o corpo até caber — e 12px numa peça de 1080 de largura vira
 * ~4pt no celular, ilegível. O corpo fica em 1,14em (18px) e quem cede é a folga entre
 * seções. Se entrar mais texto, o certo é partir em duas peças, não diminuir a letra.
 *
 * A mancha vai a 39em (~700px) de propósito: em 26em a metade direita do quadro ficava
 * vazia e frase curta quebrava em duas linhas sem motivo.
 *
 * REGRA DURA, herdada da programação: nenhum texto com line-height abaixo de 1. A caixa
 * do Anton é mais curta que o glifo (asc 1,176 + desc 0,329 = 1,505em de altura
 * natural), então entrelinha comprimida faz a letra invadir a vizinha sem que nenhuma
 * regra de CSS pareça errada. Espaço óptico se resolve com margin.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FORMATOS = { stories: { l: 1080, a: 1920, k: 1 } };

/** SVG do repo, embutido para herdar a cor — filtro CSS rasterizaria o elemento. */
function svgDoRepo(arquivo, extra = "", pasta = "marca") {
  return readFileSync(join(aqui, "..", pasta, arquivo), "utf8")
    .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, "")
    .replace("<svg", `<svg ${extra}`)
    .replace(/fill="(#fff|#ffffff|#FFF|#FFFFFF|white)"/g, 'fill="currentColor"');
}

export function manifesto(dados, opcoes = {}) {
  const base = FORMATOS[opcoes.formato] ?? FORMATOS.stories;
  const fmt = { ...base, k: base.k * (dados.escala ?? 1) };
  const fundo = dados.fundo ?? "topografia-conduta.svg";

  const secao = (s, i) => `
        <li class="regra${s.destaque ? " destaque" : ""}">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <i class="trilho" aria-hidden="true"></i>
          <div class="corpo">
            <h2>${esc(s.titulo)}</h2>
            ${s.texto ? `<p class="lead">${esc(s.texto)}</p>` : ""}
            ${s.subrotulo ? `<span class="secao-rot">${esc(s.subrotulo)}</span>` : ""}
            ${
              s.itens?.length
                ? `<ul class="itens">${s.itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`
                : ""
            }
          </div>
        </li>`;

  return {
    html: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${esc(dados.titulo)} ${esc(dados.titulo2 ?? "")}</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  *{ margin:0; padding:0; box-sizing:border-box }
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
  /* o "CONSCIENTE" da peça de referência: mesma linha de leitura do título, mas
     espaçado — a palavra que muda o sentido de tudo, então não pode ser subtítulo
     de corpo pequeno. */
  .eco{
    display:block; font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:2.05em; line-height:1.14; letter-spacing:.3em; color:#fff; margin-top:.34em;
  }

  /* ---------- regras numeradas ----------
     Mesma malha da agenda da programação: número · trilho · corpo. */
  .regras{ list-style:none; display:grid; gap:3em }
  .regra{ display:grid; grid-template-columns:3.2em 1.9em 1fr; align-items:start }
  .num{
    font-family:"Anton",sans-serif; font-weight:400; font-size:2.3em; line-height:1;
    letter-spacing:-.01em; font-variant-numeric:tabular-nums; color:#fff;
  }
  .trilho{ position:relative; justify-self:center; width:2px; align-self:stretch; background:rgba(255,255,255,.28) }
  .trilho::before{
    content:""; position:absolute; top:.42em; left:50%; transform:translateX(-50%);
    width:.9em; height:.9em; border-radius:50%; background:#fff; box-shadow:0 0 0 .32em #000;
  }
  .regra:last-child .trilho{
    background:linear-gradient(180deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 80%);
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
  .secao-rot{
    display:block; font-size:.8em; line-height:1.3; letter-spacing:.24em;
    text-transform:uppercase; color:#9e9e9e; margin-top:1.1em;
  }
  /* A observação sobre o motor do UTV explica por que as outras regras existem. Levou
     filete à esquerda por uma versão e saiu: era uma SEGUNDA linha vertical a 2px do
     trilho, e sujava a malha. Quem destaca a seção é o próprio título dela. */
  .destaque .lead{ color:#f2f2f2; font-weight:500 }

  /* ---------- fecho: os dois essenciais ---------- */
  .rodape{ display:grid; gap:1.5em }
  .divisor{ height:1px; background:rgba(255,255,255,.18) }
  .essenciais{ display:grid; grid-template-columns:1fr 1fr; gap:2.2em }
  .essenciais dt{
    font-size:.82em; line-height:1.3; letter-spacing:.22em; text-transform:uppercase; color:#9e9e9e;
    margin-bottom:.42em;
  }
  .essenciais dd{ font-size:1.06em; line-height:1.44; font-weight:600; color:#fff }
  .assina{
    font-size:.86em; line-height:1.3; letter-spacing:.2em; text-transform:uppercase; color:#bdbdbd;
  }
</style>
</head>
<body>
<div class="peca">
  <div class="topo">${svgDoRepo(fundo, "", "graficos")}</div>
  <div class="veu"></div>

  <div class="coluna">
    <div class="marca">${svgDoRepo("logo-lateral.svg")}</div>

    <div class="miolo">
      <div class="bl-titulo">
        ${dados.rotulo ? `<span class="rot">${esc(dados.rotulo)}</span>` : ""}
        <h1>${esc(dados.titulo)}</h1>
        ${dados.titulo2 ? `<span class="eco">${esc(dados.titulo2)}</span>` : ""}
      </div>

      <ol class="regras">${(dados.secoes ?? []).map(secao).join("")}</ol>
    </div>

    <div class="rodape">
      <div class="divisor"></div>
      ${
        dados.essenciais?.length
          ? `<dl class="essenciais">${dados.essenciais
              .map((e) => `<div><dt>${esc(e.rotulo)}</dt><dd>${esc(e.texto)}</dd></div>`)
              .join("")}</dl>`
          : ""
      }
      ${dados.assinatura ? `<p class="assina">${esc(dados.assinatura)}</p>` : ""}
    </div>
  </div>
</div>
</body>
</html>`,
  };
}

export const meta = { nome: "manifesto", formatos: FORMATOS };
