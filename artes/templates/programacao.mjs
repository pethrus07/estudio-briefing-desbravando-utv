/**
 * PROGRAMAÇÃO DO DIA — peça de linha do tempo, identidade Desbravando.
 *
 * Formatos em pixel exato (o entregável é PNG, não impressão):
 *   stories  1080 × 1920   · WhatsApp e Instagram stories
 *   feed     1080 × 1350   · feed do Instagram
 *   quadrado 1080 × 1080   · grupo, quando a vertical corta na pré-visualização
 *
 * RITMO VERTICAL — o que esta peça errou duas vezes antes de acertar.
 *
 *   1º erro: conteúdo ancorado no rodapé, herança do layout que tinha foto no topo.
 *      Tirada a foto, a metade de cima deixou de ser composição e virou buraco.
 *   2º erro: `space-between` entre CINCO grupos. Resolveu o buraco único, mas
 *      espalhou a folga em quatro vãos e os blocos perderam relação entre si — a
 *      data flutuando longe do título, o título longe da agenda.
 *
 * Agora são TRÊS grupos: marca no topo, `.miolo` centrado, pé no rodapé. O miolo é um
 * bloco só, com respiro interno regular (`gap`), porque cabeçalho, agenda e fecho
 * pertencem à mesma leitura. A folga que sobra fica em volta do miolo — em cima e
 * embaixo, em partes iguais —, onde o campo de curvas tem função. Mudar o corpo de um
 * texto reequilibra a peça sozinho, nos três formatos.
 *
 * Fundo em P&B: campo de curvas de nível (graficos/topografia.svg) — mapa de serra, o
 * mundo da marca. Sem foto por decisão do cliente em 26/08, e a decisão é boa para a
 * série: cinco peças com cinco fotos diferentes não leem como conjunto, porque cada
 * foto puxa a peça para um lado. O que identifica cada dia é o número.
 *
 * Sem emoji: 📍 e afins entram coloridos e a identidade é P&B estrito. O alfinete é
 * SVG desenhado; os separadores são o bullet tipográfico.
 *
 * Escala: tudo em `em` sobre um `font-size` que muda por formato, então o mesmo layout
 * serve 1080×1920 e 1080×1080 sem reescrever medida nenhuma.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* k = escala tipográfica. Peça mais baixa pede corpo menor; o ritmo se reequilibra
   sozinho porque as folgas entre os grupos são elásticas. */
const FORMATOS = {
  stories: { l: 1080, a: 1920, k: 1 },
  feed: { l: 1080, a: 1350, k: 0.79 },
  quadrado: { l: 1080, a: 1080, k: 0.63 },
};

const ALFINETE = `<svg class="pin" viewBox="0 0 24 24" aria-hidden="true">
  <path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"
    d="M12 21.5s7-6.2 7-11.2A7 7 0 0 0 5 10.3c0 5 7 11.2 7 11.2Z"/>
  <circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>`;

/** SVG do repo, embutido para herdar a cor — filtro CSS rasterizaria o elemento. */
function svgDoRepo(arquivo, extra = "", pasta = "marca") {
  return readFileSync(join(aqui, "..", pasta, arquivo), "utf8")
    .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, "")
    .replace("<svg", `<svg ${extra}`)
    .replace(/fill="(#fff|#ffffff|#FFF|#FFFFFF|white)"/g, 'fill="currentColor"');
}

export function programacao(dados, opcoes = {}) {
  const base = FORMATOS[opcoes.formato] ?? FORMATOS.stories;
  /* `escala` no dado deixa o dia denso (trilha: 6 horários + roteiro + asfalto)
     respirar no mesmo formato do dia leve (despedida: 2 horários). */
  const fmt = { ...base, k: base.k * (dados.escala ?? 1) };
  const comFoto = (opcoes.visual ?? dados.visual ?? "tipografico") === "foto";
  const pendencias = [];
  if (comFoto && !dados.fundo?.arquivo) {
    pendencias.push(`foto de fundo · ${dados.fundo?.descricao ?? "sem descrição"}`);
  }

  const [dia] = String(dados.data ?? "").split("/");

  const evento = (a) => `
        <li class="ev">
          <span class="hora">${esc(a.hora)}</span>
          <i class="trilho" aria-hidden="true"></i>
          <div class="corpo">
            <h2>${esc(a.titulo)}</h2>
            ${a.texto ? `<p class="txt">${esc(a.texto)}</p>` : ""}
            ${a.tags?.length ? `<p class="tags">${a.tags.map(esc).join(" <i>•</i> ")}</p>` : ""}
            ${a.extra ? `<p class="extra">${esc(a.extra)}</p>` : ""}
          </div>
        </li>`;

  return {
    pendencias,
    html: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${esc(dados.titulo)} — ${opcoes.formato ?? "stories"}</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  *{ margin:0; padding:0; box-sizing:border-box }
  html,body{ width:${fmt.l}px; height:${fmt.a}px; overflow:hidden }
  body{
    background:#000; color:#fff; font-size:${16 * fmt.k}px;
    font-family:"Archivo",sans-serif; font-weight:400; -webkit-font-smoothing:antialiased;
  }
  .peca{ position:relative; width:${fmt.l}px; height:${fmt.a}px; overflow:hidden }

  /* ==========================================================================
     REGRA DURA DESTA PEÇA: nenhum texto com line-height abaixo de 1.
     O Anton tem caixa mais curta que o glifo; com line-height .74 a letra
     transborda ~23px para cima e para baixo e invade o vizinho. Foi assim que
     "DIA 1 · CHEGADA" apareceu 93% dentro do "26". Espaço óptico se resolve com
     margin, nunca comprimindo a entrelinha.
     ========================================================================== */

  /* ---------- fundo ---------- */
  .topo{ position:absolute; inset:0; color:#fff; opacity:.28; pointer-events:none }
  .topo svg{ width:100%; height:100%; display:block }
  .veu{
    position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(180deg,
      rgba(0,0,0,.62) 0%, rgba(0,0,0,.22) 10%, rgba(0,0,0,.62) 22%,
      rgba(0,0,0,.84) 34%, rgba(0,0,0,.86) 74%, rgba(0,0,0,.66) 88%,
      rgba(0,0,0,.40) 100%);
  }
  .foto-topo{ position:absolute; inset:0 0 auto 0; height:46%; overflow:hidden }
  .foto-topo img{
    width:100%; height:100%; object-fit:cover;
    object-position:${esc(dados.fundo?.foco ?? "center 45%")};
    filter:grayscale(1) contrast(1.14) brightness(.88);
    -webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 46%,transparent 100%);
            mask-image:linear-gradient(to bottom,#000 0%,#000 46%,transparent 100%);
  }

  /* ---------- ritmo ----------
     A folga elástica fica DENTRO do miolo, entre os blocos (align-content:
     space-between), não em volta dele. Antes era o contrário: 43px entre os
     blocos e 400px de ar morto em cima e embaixo. */
  .coluna{
    position:absolute; inset:0;
    display:grid; grid-template-rows:auto 1fr auto;
    padding:${4 / fmt.k}em ${4.4 / fmt.k}em ${3.4 / fmt.k}em;
  }
  /* Escala hierárquica. space-between dava ~300px iguais entre tudo e a peça lia
     como quatro ilhas: data, título, agenda e fecho sem relação. Aqui o que pertence
     à mesma leitura fica perto e o que é seção nova fica longe. */
  .miolo{ display:grid; align-content:center; row-gap:0; padding:2em 0 }
  .bl-data{ margin-bottom:6em }
  .bl-titulo{ margin-bottom:9.5em }
  .agenda{ margin-bottom:9.5em }

  /* logo lateral: montanha · filete · #DESBRAVANDOUTV, o arquivo de marca de 26/08 */
  .marca{ width:${17.5 / fmt.k}em; color:#fff }
  .marca svg{ width:100%; height:auto; display:block; fill:currentColor }

  /* ---------- data ---------- */
  .rot{
    display:block; font-size:.92em; line-height:1.3; letter-spacing:.28em;
    text-transform:uppercase; color:#c4c4c4;
  }
  .data{ display:flex; align-items:baseline; gap:${1.7 / fmt.k}em; margin-top:.55em }
  .data .num{
    font-family:"Anton",sans-serif; font-weight:400; font-size:10em; line-height:1;
    letter-spacing:-.03em; font-variant-numeric:tabular-nums;
  }
  .data .mes{
    font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:2.9em; line-height:1; letter-spacing:-.01em;
  }
  /* seletor de classe única de propósito: era ".data .sem" e deixou de casar quando
     o dia da semana virou irmão do ".data" em vez de filho. Cuidado: backtick em
     comentário dentro deste template literal fecha a string e o CSS vira código. */
  .sem{
    display:block; font-size:.94em; line-height:1.3; letter-spacing:.22em;
    text-transform:uppercase; color:#b8b8b8; margin-top:1.05em;
  }

  /* ---------- título ---------- */
  h1{
    font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:5.9em; line-height:1.06; letter-spacing:-.016em; max-width:11.5em;
  }
  .sub{ font-size:1.3em; line-height:1.5; color:#dadada; margin-top:.9em; max-width:16em }
  .local{
    display:inline-flex; align-items:center; gap:.55em; margin-top:1.6em;
    font-size:1.04em; line-height:1.3;
    border:1px solid rgba(255,255,255,.3); border-radius:99px; padding:.6em 1.15em .6em .95em;
  }
  .local .pin{ width:1.25em; height:1.25em; flex:none }
  .local b{ font-weight:600; letter-spacing:.01em }

  /* ---------- previsão: três números do dia de trilha ---------- */
  .previsao{ display:flex; gap:2.6em; margin-bottom:3.6em; flex-wrap:wrap }
  .previsao div{ display:grid; gap:.3em }
  .previsao dt{
    font-size:.82em; line-height:1.3; letter-spacing:.2em; text-transform:uppercase; color:#9e9e9e;
  }
  .previsao dd{
    font-family:"Anton",sans-serif; font-weight:400; font-size:1.85em; line-height:1;
    letter-spacing:-.01em; font-variant-numeric:tabular-nums;
  }

  /* ---------- roteiro: os pontos do dia, em sequência ---------- */
  .secao-rot{
    display:block; font-size:.82em; line-height:1.3; letter-spacing:.24em;
    text-transform:uppercase; color:#9e9e9e; margin-bottom:1.1em;
  }
  .roteiro{ list-style:none; display:grid; gap:.55em; margin-bottom:3em }
  .roteiro li{
    display:flex; align-items:baseline; gap:.7em; font-size:1.16em; line-height:1.35;
  }
  .roteiro li b{ font-weight:600 }
  .roteiro li::before{
    content:""; width:.42em; height:.42em; border-radius:50%; background:rgba(255,255,255,.55);
    flex:none; transform:translateY(-.18em);
  }
  .roteiro li:last-child::before{ background:#fff; box-shadow:0 0 0 .18em rgba(255,255,255,.25) }

  /* ---------- asfalto e aviso: letra miúda, sem competir ---------- */
  .miudo{ margin-bottom:3em }
  .miudo ul{ list-style:none; display:grid; gap:.4em }
  .miudo li{ font-size:.98em; line-height:1.45; color:#b0b0b0 }
  .miudo .nota, .aviso{ font-size:.94em; line-height:1.5; color:#9a9a9a; margin-top:.7em }
  .aviso{
    border-left:2px solid rgba(255,255,255,.28); padding-left:1em; margin-bottom:3em;
  }

  /* ---------- agenda: linha do tempo ----------
     Trilho com marcador por item: dá estrutura visível ao que antes eram só
     linhas horizontais soltas. */
  .agenda{ list-style:none; display:grid; gap:3.6em }
  /* A coluna da hora era fixa em 7.4em, medida para "08h30". Hora composta ("13h30/14h",
     "17h00/18h", que a Origens trouxe em 13/10) tem quase o dobro de caracteres e, com o
     nowrap abaixo, TRANSBORDAVA por cima do trilho — o fim da hora saía escrito em cima
     do marcador. O minmax resolve sem mexer no passado: o piso de 7.4em mantém as peças
     já entregues byte a byte, e a coluna só cresce quando o conteúdo exige.
     (Sem acento grave nestes comentários: ele fecha o template literal e o CSS vira
     código. Foi o que aconteceu aqui na primeira tentativa desta correção.) */
  .ev{ display:grid; grid-template-columns:minmax(7.4em, max-content) 1.9em 1fr; align-items:start }
  .hora{
    font-family:"Anton",sans-serif; font-weight:400; font-size:2.1em; line-height:1;
    letter-spacing:-.01em; font-variant-numeric:tabular-nums; padding-top:.05em;
    white-space:nowrap;
  }
  .trilho{ position:relative; justify-self:center; width:2px; align-self:stretch; background:rgba(255,255,255,.30) }
  .trilho::before{
    content:""; position:absolute; top:.5em; left:50%; transform:translateX(-50%);
    width:.95em; height:.95em; border-radius:50%; background:#fff;
    box-shadow:0 0 0 .34em #000;
  }
  .ev:last-child .trilho{ background:linear-gradient(180deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,0) 78%) }
  .corpo{ padding-left:1.5em; padding-bottom:.2em }
  .ev h2{
    font-family:"Anton",sans-serif; font-weight:400; text-transform:uppercase;
    font-size:1.82em; line-height:1.08; letter-spacing:-.008em;
  }
  .txt{ font-size:1.14em; line-height:1.55; color:#c7c7c7; margin-top:.75em; max-width:18em }
  .tags{ font-size:1.02em; line-height:1.4; margin-top:.95em; color:#f0f0f0 }
  .tags i{ font-style:normal; color:#8a8a8a; padding:0 .28em }
  .extra{
    display:inline-block; margin-top:1em; font-size:.84em; line-height:1.3;
    letter-spacing:.16em; text-transform:uppercase; color:#e6e6e6;
    border:1px solid rgba(255,255,255,.34); border-radius:99px; padding:.5em 1.1em;
  }

  /* ---------- fecho ---------- */
  .rodape{ display:grid; gap:1.5em }
  .divisor{ height:1px; background:rgba(255,255,255,.18) }
  .fecho{ font-size:1.24em; line-height:1.5; font-weight:600; max-width:17em }
</style>
</head>
<body>
<div class="peca">
  ${
    comFoto && dados.fundo?.arquivo
      ? `<div class="foto-topo"><img src="${esc(dados.fundo.arquivo)}" alt=""></div>`
      : `<div class="topo">${svgDoRepo(`topografia-${dados.dia ?? 1}.svg`, "", "graficos")}</div>`
  }
  <div class="veu"></div>

  <div class="coluna">
    <div class="marca">${svgDoRepo("logo-lateral.svg")}</div>

    <div class="miolo">
    <div class="bl-data">
      ${dados.rotuloDia ? `<span class="rot">${esc(dados.rotuloDia)}</span>` : ""}
      <div class="data">
        <b class="num">${esc(dia ?? "")}</b>
        <span class="mes">${esc(dados.mesNome ?? "")}</span>
      </div>
      ${dados.diaSemana ? `<span class="sem">${esc(dados.diaSemana)}</span>` : ""}
    </div>

    <div class="bl-titulo">
      <h1>${esc(dados.titulo)}</h1>
      ${dados.subtitulo ? `<p class="sub">${esc(dados.subtitulo)}</p>` : ""}
      ${dados.local ? `<p class="local">${ALFINETE}<b>${esc(dados.local)}</b></p>` : ""}
    </div>

    ${
      dados.previsao?.length
        ? `<dl class="previsao">${dados.previsao
            .map((v) => `<div><dt>${esc(v.rotulo)}</dt><dd>${esc(v.valor)}</dd></div>`)
            .join("")}</dl>`
        : ""
    }

    <ul class="agenda">${(dados.agenda ?? []).map(evento).join("")}</ul>

    ${
      dados.roteiro?.length
        ? `<div><span class="secao-rot">Roteiro</span>
      <ul class="roteiro">${dados.roteiro.map((r) => `<li><b>${esc(r)}</b></li>`).join("")}</ul></div>`
        : ""
    }
    ${
      dados.asfalto?.itens?.length
        ? `<div class="miudo"><span class="secao-rot">Trechos de asfalto</span>
      <ul>${dados.asfalto.itens.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
      ${dados.asfalto.nota ? `<p class="nota">${esc(dados.asfalto.nota)}</p>` : ""}</div>`
        : ""
    }
    ${dados.aviso ? `<p class="aviso">${esc(dados.aviso)}</p>` : ""}

    ${dados.fecho ? `<div class="rodape"><div class="divisor"></div><p class="fecho">${esc(dados.fecho)}</p></div>` : ""}
    </div>


  </div>
</div>
</body>
</html>`,
  };
}

export const meta = { nome: "programacao", formatos: FORMATOS };
