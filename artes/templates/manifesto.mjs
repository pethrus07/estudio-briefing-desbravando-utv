/**
 * MANIFESTO — peça de lista numerada, identidade Desbravando.
 *
 * Serve o código de conduta e a carta de drinks: título, uma lista de seções numeradas
 * (cada uma com nome, parágrafo e/ou itens) e um fecho opcional de dois essenciais. O
 * quadro vem de `comum.mjs`; aqui só vive o miolo.
 *
 * A malha *número · trilho · corpo* é a MESMA da agenda da programação, de propósito — é
 * o que faz a peça ler como parte do conjunto sem repetir o layout.
 *
 * DENSIDADE é o problema desta peça, não o vão. Na conduta são seis seções e ~27 linhas;
 * a tentação é encolher o corpo até caber, e 12px numa peça de 1080 de largura vira ~4pt
 * no celular, ilegível. O corpo fica em 1,14em e quem cede é a folga entre seções. Se
 * entrar mais texto, o certo é partir em duas peças, não diminuir a letra. No sentido
 * contrário, peça curta (5 drinks) sobe pela `escala` do dado, senão sobra metade do
 * quadro vazia — mas conferir a quebra de linha depois: escala alta faz item longo virar
 * duas linhas com órfão no fim.
 *
 * A mancha vai a 39em (~700px): em 26em a metade direita do quadro ficava vazia e frase
 * curta quebrava em duas linhas sem motivo.
 */

import { esc, escala, cssCromo, cssLista, htmlFundo, htmlMarca } from "./comum.mjs";

export function manifesto(dados, opcoes = {}) {
  const fmt = escala(dados, opcoes);

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
${cssCromo(fmt)}

${cssLista(fmt)}

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
  ${htmlFundo(dados.fundo)}

  <div class="coluna">
    ${htmlMarca()}

    <div class="miolo">
      <div class="bl-titulo">
        ${dados.rotulo ? `<span class="rot">${esc(dados.rotulo)}</span>` : ""}
        <h1>${esc(dados.titulo)}</h1>
        ${dados.titulo2 ? `<span class="eco">${esc(dados.titulo2)}</span>` : ""}
      </div>

      <ol class="regras">${(dados.secoes ?? []).map(secao).join("")}</ol>
    </div>

    ${
      dados.essenciais?.length || dados.assinatura
        ? `<div class="rodape">
      <div class="divisor"></div>
      ${
        dados.essenciais?.length
          ? `<dl class="essenciais">${dados.essenciais
              .map((e) => `<div><dt>${esc(e.rotulo)}</dt><dd>${esc(e.texto)}</dd></div>`)
              .join("")}</dl>`
          : ""
      }
      ${dados.assinatura ? `<p class="assina">${esc(dados.assinatura)}</p>` : ""}
    </div>`
        : ""
    }
  </div>
</div>
</body>
</html>`,
  };
}

export const meta = { nome: "manifesto" };
