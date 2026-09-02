/**
 * OFERTA DE EXPEDIÇÃO — o PDF de proposta virado peça de imagem.
 *
 * O documento tem seis assuntos de natureza diferente (roteiro por dia, hospedagem, o que
 * está incluso, o que não está, valor, segurança) e como PDF eles viram seis páginas de
 * lista. Como peça de WhatsApp precisam caber num quadro só, então cada assunto ganha a
 * forma que ocupa menos altura sem perder leitura:
 *
 *   roteiro    → lista numerada (a malha do conjunto), um dia por número
 *   incluso    → checklist em DUAS COLUNAS: 11 itens em 6 linhas em vez de 11
 *   não incluso→ uma linha só, itens separados por bullet
 *   valor      → rodapé ancorado, com o número em Anton: é o fecho da peça
 *
 * A conta de altura é o que decide se a peça existe em 1080 × 1920. Sem as duas colunas do
 * incluso e sem o roteiro compacto, esse conteúdo pede ~2400px de altura — e o caminho
 * errado seria encolher a letra até caber.
 *
 * O quadro (fundo, véu, coluna, marca, título) e a lista numerada vêm de `comum.mjs`.
 */

import { esc, escala, cssCromo, cssLista, htmlFundo, htmlMarca } from "./comum.mjs";

export function oferta(dados, opcoes = {}) {
  const fmt = escala(dados, opcoes);

  const dia = (d, i) => `
        <li class="regra">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <i class="trilho" aria-hidden="true"></i>
          <div class="corpo">
            <h2>${esc(d.quando)}</h2>
            <p class="trecho">${esc(d.trecho)}${
              d.distancia ? ` <span class="km">${esc(d.distancia)}</span>` : ""
            }</p>
            <ul class="horas">${(d.horarios ?? [])
              .map((h) =>
                h.hora
                  ? `<li><b>${esc(h.hora)}</b><span>${esc(h.oque)}</span></li>`
                  : `<li class="sem-hora"><span>${esc(h.oque)}</span></li>`
              )
              .join("")}</ul>
          </div>
        </li>`;

  return {
    html: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${esc(dados.titulo)}</title>
<link rel="stylesheet" href="../identidade.css">
<style>
${cssCromo(fmt)}

${cssLista(fmt)}

  /* ---------- ajustes da lista para o roteiro ---------- */
  .regras{ gap:2.1em }
  .regra h2{ font-size:1.5em }
  .trecho{ font-size:1.06em; line-height:1.4; color:#dcdcdc; margin-top:.42em }
  .km{
    display:inline-block; margin-left:.5em; font-size:.82em; letter-spacing:.14em;
    text-transform:uppercase; color:#9e9e9e; white-space:nowrap;
  }
  /* horário e evento em duas colunas: alinhados, a hora vira coluna de leitura */
  .horas{ list-style:none; display:grid; gap:.3em; margin-top:.66em }
  .horas li{ display:grid; grid-template-columns:6.4em 1fr; font-size:1.02em; line-height:1.42 }
  .horas b{ font-weight:600; font-variant-numeric:tabular-nums; color:#fff }
  .horas span{ color:#c2c2c2 }
  /* item sem horário (café da manhã do domingo) não desenha a coluna da hora: um
     travessão sozinho ali lê como erro de dado. */
  .horas .sem-hora{ grid-template-columns:1fr }

  /* ---------- bloco de título ---------- */
  .bl-titulo{ margin-bottom:3em }
  h1{ font-size:4.1em }
  .quando{
    display:inline-block; margin-top:.85em;
    font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:1.62em; line-height:1.12; letter-spacing:.02em;
    border-bottom:2px solid rgba(255,255,255,.5); padding-bottom:.12em;
  }
  .dias-semana{
    display:block; font-size:.88em; line-height:1.3; letter-spacing:.22em;
    text-transform:uppercase; color:#b8b8b8; margin-top:.95em;
  }
  /* selos: a classificação da expedição e a chamada de urgência. Viram pílula em vez de
     mais uma linha de texto porque o bloco de título já tem quatro linhas — pílula lê
     como etiqueta, não como continuação da leitura. */
  .selos{ display:flex; flex-wrap:wrap; gap:.6em; margin-top:1.5em }
  .selo{
    font-size:.84em; line-height:1.2; letter-spacing:.2em; text-transform:uppercase;
    border:1px solid rgba(255,255,255,.34); border-radius:99px; padding:.55em 1.1em;
    color:#e6e6e6;
  }
  /* invertido: numa peça P&B, sólido é o acento mais forte que existe */
  .selo.forte{ background:#fff; border-color:#fff; color:#000; font-weight:600 }

  /* ---------- seções de texto ---------- */
  .bloco{ margin-top:2.4em }
  .bloco .secao-rot{ margin-top:0; margin-bottom:.8em }
  .linha{ font-size:1.04em; line-height:1.45; color:#c7c7c7 }
  .linha b{ font-weight:600; color:#fff }
  .linha + .linha{ margin-top:.34em }
  .linha i{ font-style:normal; color:#8a8a8a; padding:0 .3em }

  /* ---------- incluso: duas colunas ----------
     11 itens em 6 linhas. Em uma coluna seriam 11 linhas e a peça não fecharia em
     1920px sem encolher a letra. */
  .checklist{
    list-style:none; display:grid; grid-template-columns:1fr 1fr; gap:.36em 2.2em;
    grid-auto-flow:column; grid-template-rows:repeat(${Math.ceil((dados.incluso?.length ?? 0) / 2)}, auto);
  }
  .checklist li{
    display:flex; align-items:baseline; gap:.6em;
    font-size:1.02em; line-height:1.38; color:#c7c7c7;
  }
  .checklist li::before{
    content:""; width:.34em; height:.34em; border-radius:50%; background:rgba(255,255,255,.5);
    flex:none; transform:translateY(-.2em);
  }
  .nota{ font-size:.94em; line-height:1.42; color:#9e9e9e; margin-top:.8em }

  /* ---------- rodapé: o valor é o fecho ----------
     Dois pacotes lado a lado: preço se lê comparando, e empilhado um sob o outro o
     segundo pareceria condição do primeiro em vez de alternativa. */
  .rodape{ display:grid; gap:1.15em; margin-top:2.4em }
  .divisor{ height:1px; background:rgba(255,255,255,.18) }
  .pacotes{ display:grid; grid-template-columns:1fr 1fr; gap:1.6em; align-items:start }
  .pacote dt{
    font-size:.82em; line-height:1.3; letter-spacing:.2em; text-transform:uppercase; color:#9e9e9e;
    margin-bottom:.34em;
  }
  .preco{ display:flex; align-items:baseline; gap:.6em; flex-wrap:wrap }
  .preco .n{
    font-family:"Anton",sans-serif; font-weight:400; font-size:2.9em; line-height:1;
    letter-spacing:-.02em;
  }
  .preco .un{
    font-size:.92em; line-height:1.3; letter-spacing:.18em; text-transform:uppercase; color:#b8b8b8;
  }
  .pacote .obs{ font-size:.92em; line-height:1.4; color:#9e9e9e; margin-top:.5em }
  .pgto{ font-size:1em; line-height:1.45; color:#c2c2c2 }
  .pgto i{ font-style:normal; color:#8a8a8a; padding:0 .3em }
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
        ${dados.data ? `<span class="quando">${esc(dados.data)}</span>` : ""}
        ${dados.diasSemana ? `<span class="dias-semana">${esc(dados.diasSemana)}</span>` : ""}
        ${
          dados.classificacao || dados.chamada
            ? `<div class="selos">
          ${dados.classificacao ? `<span class="selo">${esc(dados.classificacao)}</span>` : ""}
          ${dados.chamada ? `<span class="selo forte">${esc(dados.chamada)}</span>` : ""}
        </div>`
            : ""
        }
      </div>

      <div>
        <span class="secao-rot" style="margin-top:0;margin-bottom:1em">Roteiro</span>
        <ol class="regras">${(dados.dias ?? []).map(dia).join("")}</ol>
      </div>

      ${
        dados.hospedagem
          ? `<div class="bloco">
        <span class="secao-rot">Hospedagem</span>
        <p class="linha"><b>${esc(dados.hospedagem.nome)}</b> — ${esc(dados.hospedagem.texto)}</p>
        ${dados.hospedagem.upgrade ? `<p class="linha">${esc(dados.hospedagem.upgrade)}</p>` : ""}
      </div>`
          : ""
      }

      ${
        dados.incluso?.length
          ? `<div class="bloco">
        <span class="secao-rot">Está incluso</span>
        <ul class="checklist">${dados.incluso.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        ${dados.inclusoNota ? `<p class="nota">${esc(dados.inclusoNota)}</p>` : ""}
      </div>`
          : ""
      }

      ${
        dados.naoIncluso?.length
          ? `<div class="bloco">
        <span class="secao-rot">Não está incluso</span>
        <p class="linha">${dados.naoIncluso.map(esc).join(" <i>•</i> ")}</p>
      </div>`
          : ""
      }

      ${
        dados.seguranca
          ? `<div class="bloco">
        <span class="secao-rot">Segurança</span>
        <p class="linha">${esc(dados.seguranca)}</p>
      </div>`
          : ""
      }
    </div>

    <div class="rodape">
      <div class="divisor"></div>
      <dl class="pacotes">${(dados.pacotes ?? [])
        .map(
          (v) => `<div class="pacote">
          <dt>${esc(v.nome)}</dt>
          <dd class="preco"><b class="n">${esc(v.valor)}</b><span class="un">${esc(v.unidade ?? "")}</span></dd>
          ${v.obs ? `<dd class="obs">${esc(v.obs)}</dd>` : ""}
        </div>`
        )
        .join("")}</dl>
      ${
        dados.pagamento?.length
          ? `<p class="pgto">${dados.pagamento.map(esc).join(" <i>•</i> ")}</p>`
          : ""
      }
    </div>
  </div>
</div>
</body>
</html>`,
  };
}

export const meta = { nome: "oferta" };
