/**
 * PROGRAMA DE PARCERIAS — documento para enviar às marcas
 *
 * Formato: 1920 × 1080 (16:9), uma seção por página, PDF.
 * Registro: núcleo (P&B estrito) + regra da peça de marca — foto dessaturada,
 * peça inteira monocromática. Sem patrocinador na peça: aqui o Desbravando fala
 * *com* marcas, não exibe as suas.
 *
 * Arquitetura de conteúdo (10 páginas), conforme os documentos de base:
 *   1 capa · 2 a tese · 3 o Desbravando · 4 o ciclo · 5 o território da marca
 *   6 o que a marca ganha · 7 casos ("imagine sua marca aqui") · 8 possibilidades
 *   9 como construímos · 10 encerramento
 * As páginas 5, 6, 7 e 8 mudam conforme o parceiro; as outras são institucionais.
 *
 * MODO TIPOGRÁFICO (`visual: "tipografico"`). O documento nasceu dependente de sete
 * fotos, e enquanto elas não existem o normal era sair com sete caixas cinzas escrito
 * "foto" — que num documento de proposta lê como rascunho e derruba a credibilidade de
 * tudo em volta. No modo tipográfico não há caixa vazia: a foto simplesmente não existe,
 * a grade de duas colunas colapsa em uma, e capa e encerramento trocam a foto pelo campo
 * de curvas de nível da identidade. Os casos da página 7 viram trio editorial com o
 * número grande em Anton. O documento fica coerente sem foto, e continua listando no
 * console quais fotos faltam — sem inventar nenhuma.
 *
 * O número da página é PARÂMETRO da função, não literal dentro dela: inserir a página 8
 * renumerava duas páginas à mão, e é o tipo de coisa que sai errada em silêncio.
 */

import { svgDoRepo } from "./comum.mjs";

const P = 1920;
const A = 1080;

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Campos que o Desbravando ainda precisa preencher aparecem como pendência, nunca inventados. */
const pendencias = [];
/**
 * A decisão de foto é POR SLOT, não da peça inteira. Foi global por uma versão e estava
 * errado: das sete fotos, quatro existem e três não, e o certo é a página que tem foto
 * usar a foto e a página que não tem virar tipográfica — não as sete se rebaixarem à pior.
 * `visual: "tipografico"` continua existindo como trava, para gerar a versão sem foto
 * nenhuma mesmo com arquivo no disco.
 */
let forcarTipografico = false;
const tem = (slot) => !forcarTipografico && Boolean(slot?.arquivo);
function valor(bruto, rotulo) {
  const v = String(bruto ?? "").trim();
  if (!v) {
    pendencias.push(rotulo);
    return `<span class="pendente">—</span>`;
  }
  return esc(v);
}

function foto(slot, classe = "") {
  if (slot?.arquivo) {
    return `<img class="foto mono ${classe}" src="${esc(slot.arquivo)}" alt="">`;
  }
  /* Ausência de foto não deixa marca na peça: quem cede é a grade, não a página. Caixa
     cinza escrito "foto" num documento de proposta lê como rascunho e derruba a
     credibilidade de tudo em volta. Quem registra a falta é `cobrarFotos`. */
  return "";
}

/** Todos os slots do documento, na ordem das páginas — a lista do que falta sair. */
const slotsDeFoto = (d) => [
  ["01 capa", d.capa],
  ["03 operação", d.fotoOperacao],
  ["05 território", d.territorio?.foto],
  ...(d.casos ?? []).map((c, i) => [`07 caso ${i + 1}`, c.foto]),
  ["10 encerramento", d.encerramento],
];

function cobrarFotos(d) {
  for (const [onde, slot] of slotsDeFoto(d)) {
    if (!tem(slot)) pendencias.push(`foto ${onde} · ${slot?.descricao ?? "sem descrição"}`);
  }
}

/** Fundo de capa e encerramento quando não há foto: o campo de curvas da identidade. */
const fundoGrafico = () =>
  `<div class="capa-fundo topo-grafico">${svgDoRepo("topografia-parcerias.svg", "", "graficos")}</div>`;

/**
 * Número vazio não vira travessão numa proposta comercial: a régua de audiência É o
 * argumento da página, e meia régua preenchida lê pior do que régua nenhuma. Ou entram
 * os quatro, ou a página fica só com o texto — e os quatro vão para a lista de pendências.
 */
const CAMPOS_NUM = ["seguidores", "alcance", "visualizacoes", "engajamento"];
const temNumero = (n = {}) => CAMPOS_NUM.some((k) => String(n[k] ?? "").trim());
function semNumero(n = {}) {
  CAMPOS_NUM.forEach((k) => pendencias.push(`número · ${k}`));
  return "";
}

/**
 * Lista de duas colunas lida de CIMA PARA BAIXO, não em ziguezague. Com o preenchimento
 * padrão do grid (por linha), "Presença" e "Utilidade" caem lado a lado e a ordem que o
 * cliente escreveu se perde — quem lê pula de coluna a cada item.
 */
const emColunas = (n) =>
  `style="grid-auto-flow:column;grid-template-rows:repeat(${Math.ceil(n / 2)},auto)"`;

/** Grade de duas colunas só existe se a coluna da direita existir. */
const grade = (classe, slot) => (tem(slot) ? classe : "grade-solo");

const marca = `<img class="marca-topo" src="../marca/logo-desbravando.png" alt="Desbravando UTV">`;
const rodape = (n) => `<div class="rodape"><span>Programa de Parcerias Desbravando</span><span>${n}</span></div>`;

/* ------------------------------------------------------------------ páginas */

const capa = (d) => `
<section class="pagina capa">
  ${tem(d.capa) ? `<div class="capa-fundo">${foto(d.capa, "cobre")}</div>` : fundoGrafico()}
  <div class="veu-capa"></div>
  <div class="capa-conteudo">
    ${marca}
    <p class="sobrelinha">Programa de Parcerias Desbravando</p>
    <h1 class="titulo hero">Experiências<br>que conectam<br>marcas e pessoas</h1>
    <div class="capa-base">
      <span class="pilula">${esc(d.territorio.nome)}</span>
      <p class="subtitulo">Sua marca dentro da experiência.</p>
    </div>
  </div>
</section>`;

const tese = (n) => `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">A tese</p>
  <h2 class="titulo secao">Existe uma diferença entre<br>anunciar uma marca e fazer<br>parte de uma experiência.</h2>
  <div class="duas-colunas">
    <div class="coluna apagada">
      <p class="rotulo-coluna">Publicidade tradicional</p>
      <div class="fluxo">
        <span>Marca</span><i>→</i><span>Anúncio</span><i>→</i><span>Cliente</span>
      </div>
      <p class="corpo nota">Interrompe. Termina quando o anúncio termina.</p>
    </div>
    <div class="coluna">
      <p class="rotulo-coluna forte">Programa de Parcerias</p>
      <div class="fluxo destaque">
        <span>Marca</span><i>→</i><span>Experiência</span><i>→</i><span>Conteúdo</span><i>→</i><span>Relacionamento</span><i>→</i><span>Negócio</span>
      </div>
      <p class="corpo nota">Participa. Permanece na memória de quem viveu e de quem acompanhou.</p>
    </div>
  </div>
  ${rodape(n)}
</section>`;

const oDesbravando = (d, n) => `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">A plataforma</p>
  <div class="${grade("grade-2-1", d.fotoOperacao)}">
    <div>
      <h2 class="titulo secao">O Desbravando</h2>
      <p class="corpo texto-largo">O Desbravando conecta pessoas apaixonadas pelo universo off-road através de
      expedições cuidadosamente planejadas, onde <strong>cada detalhe é pensado para transformar uma viagem em uma
      experiência memorável</strong>.</p>
      <p class="corpo texto-largo">Hoje somos uma comunidade em constante crescimento, reconhecida pela qualidade
      das experiências que entrega e pelo conteúdo que compartilha.</p>
      ${
        temNumero(d.numeros)
          ? `<div class="numeros">
        <div class="numero"><span class="n">${valor(d.numeros.seguidores, "número · seguidores")}</span><span class="rot">Seguidores</span></div>
        <div class="numero"><span class="n">${valor(d.numeros.alcance, "número · alcance")}</span><span class="rot">Alcance</span></div>
        <div class="numero"><span class="n">${valor(d.numeros.visualizacoes, "número · visualizações")}</span><span class="rot">Visualizações</span></div>
        <div class="numero"><span class="n">${valor(d.numeros.engajamento, "número · engajamento")}</span><span class="rot">Engajamento</span></div>
      </div>`
          : semNumero(d.numeros)
      }
    </div>
    ${foto(d.fotoOperacao, "alta")}
  </div>
  ${rodape(n)}
</section>`;

const ciclo = (n) => {
  const passos = [
    "O participante vive a experiência.",
    "A marca participa desse momento.",
    "O conteúdo registra esse momento.",
    "Milhares de pessoas acompanham.",
    "A marca ganha autoridade porque participou.",
  ];
  return `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">O ciclo</p>
  <h2 class="titulo secao">Por que esse modelo funciona</h2>
  <ol class="ciclo">
    ${passos
      .map(
        (t, i) => `<li><span class="ciclo-n">${String(i + 1).padStart(2, "0")}</span>
      <span class="ciclo-t">${esc(t)}</span></li>`
      )
      .join("\n    ")}
  </ol>
  <p class="corpo destaque-linha">Não falamos apenas de quem participa da expedição, mas das
  <strong>milhares de pessoas que acompanham cada momento</strong> pelo conteúdo produzido pelo Desbravando.</p>
  ${rodape(n)}
</section>`;
};

const territorio = (d, n) => `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">O território da marca</p>
  <div class="${grade("grade-1-1", d.territorio.foto)}">
    <div>
      <h2 class="titulo secao">${esc(d.territorio.nome)}</h2>
      <p class="subtitulo">${esc(d.territorio.promessa)}</p>
      <p class="corpo pergunta">${esc(
        d.territorio.pergunta ?? "Como essa marca melhora a experiência do participante?"
      )}</p>
      <ul class="lista lista-territorio" ${tem(d.territorio.foto) ? "" : emColunas(d.territorio.itens.length)}>
        ${d.territorio.itens
          .map((i) => `<li><span><strong>${esc(i.titulo)}</strong> ${esc(i.texto)}</span></li>`)
          .join("\n        ")}
      </ul>
    </div>
    ${foto(d.territorio.foto, "alta")}
  </div>
  ${rodape(n)}
</section>`;

const ganho = (d, n) => `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">O que a sua marca ganha</p>
  <h2 class="titulo secao">Sua empresa deixa de ser<br>um fornecedor e passa a ser<br>parte da experiência.</h2>
  <ul class="lista lista-ganho">
    ${d.ganhos.map((g) => `<li><span>${esc(g)}</span></li>`).join("\n    ")}
  </ul>
  ${rodape(n)}
</section>`;

const casos = (d, n) => `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">Momentos reais</p>
  <h2 class="titulo secao secao-menor">Imagine sua marca aqui.</h2>
  <div class="casos${d.casos.some((c) => tem(c.foto)) ? "" : " sem-foto"}">
    ${d.casos
      .map(
        (c, i) => `<figure class="caso${tem(c.foto) ? "" : " caso-solo"}">
      ${tem(c.foto) ? foto(c.foto, "caso-img") : `<span class="caso-n">${String(i + 1).padStart(2, "0")}</span>`}
      <figcaption><span class="caso-local">${esc(c.local)}</span><span class="caso-legenda">${esc(c.legenda)}</span></figcaption>
    </figure>`
      )
      .join("\n    ")}
  </div>
  ${rodape(n)}
</section>`;

/**
 * Página nova (8) — as possibilidades de participação do parceiro.
 *
 * Entra como LISTA DE POSSIBILIDADES, não como escopo: o briefing é explícito em
 * apresentar isso como exemplos de ativação a construir com o parceiro, e não como
 * pacote fechado. A nota de fecho é o que carrega essa ressalva na peça — sem ela a
 * lista lê como entrega contratada.
 */
const possibilidades = (d, n) => `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">Possibilidades</p>
  <h2 class="titulo secao secao-menor">${esc(d.possibilidades.titulo)}</h2>
  <ul class="lista lista-possib" ${emColunas(d.possibilidades.itens.length)}>
    ${d.possibilidades.itens.map((i) => `<li><span>${esc(i)}</span></li>`).join("\n    ")}
  </ul>
  ${d.possibilidades.nota ? `<p class="corpo destaque-linha">${esc(d.possibilidades.nota)}</p>` : ""}
  ${rodape(n)}
</section>`;

const construcao = (d, n) => {
  const etapas = [
    "Entendemos sua marca",
    "Identificamos oportunidades",
    "Desenhamos as ativações",
    "Executamos",
    "Mensuramos",
  ];
  return `
<section class="pagina">
  ${marca}
  <p class="sobrelinha">Como construímos juntos</p>
  <h2 class="titulo secao">Nenhuma parceria nasce pronta.</h2>
  <div class="etapas">
    ${etapas
      .map(
        (e, i) =>
          `<div class="etapa"><span class="etapa-n">${String(i + 1).padStart(2, "0")}</span><span class="etapa-t">${esc(e)}</span></div>`
      )
      .join("\n    ")}
  </div>
  <p class="corpo destaque-linha">Cada marca tem objetivos diferentes. Por isso não existe pacote pronto —
  existe <strong>uma ativação desenhada para a sua empresa</strong>.</p>
  ${
    d.faixa?.length
      ? `<div class="faixa">${d.faixa.map((t) => `<span>${esc(t)}</span>`).join('<i>+</i>')}</div>`
      : ""
  }
  ${rodape(n)}
</section>`;
};

/** Contato: só entra o que existe; vazio de tudo vira um aviso único, não três traços. */
function linhaContato(c = {}) {
  const campos = [
    [c.nome, "contato · nome"],
    [c.telefone, "contato · telefone"],
    [c.email, "contato · e-mail"],
  ];
  const preenchidos = campos.filter(([v]) => String(v ?? "").trim());
  campos.filter(([v]) => !String(v ?? "").trim()).forEach(([, rotulo]) => pendencias.push(rotulo));
  /* Documento que vai para a marca não anuncia o próprio buraco: sem contato, a linha
     não existe. A pendência aparece no console de quem renderiza, que é quem resolve. */
  if (!preenchidos.length) return "";
  return `<p class="contato">${preenchidos.map(([v]) => esc(v)).join(" · ")}</p>`;
}

const encerramento = (d) => `
<section class="pagina encerramento">
  ${tem(d.encerramento) ? `<div class="capa-fundo">${foto(d.encerramento, "cobre")}</div>` : fundoGrafico()}
  <div class="veu-encerramento"></div>
  <div class="capa-conteudo">
    ${marca}
    <h2 class="titulo hero hero-menor">As melhores marcas<br>não aparecem.<br>Elas fazem parte<br>da experiência.</h2>
    <div class="capa-base">
      <p class="subtitulo">Vamos construir essa parceria?</p>
      ${linhaContato(d.contato)}
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ montagem */

export function parcerias(dados, opcoes = {}) {
  pendencias.length = 0;
  forcarTipografico = (opcoes.visual ?? dados.visual) === "tipografico";
  cobrarFotos(dados);
  /* O número da página vive AQUI, ao lado da ordem — inserir uma página no meio é mexer
     numa lista, não caçar literal dentro de nove funções. */
  const paginas = [
    capa(dados),
    tese("02"),
    oDesbravando(dados, "03"),
    ciclo("04"),
    territorio(dados, "05"),
    ganho(dados, "06"),
    casos(dados, "07"),
    ...(dados.possibilidades ? [possibilidades(dados, "08")] : []),
    construcao(dados, dados.possibilidades ? "09" : "08"),
    encerramento(dados),
  ].join("\n");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Programa de Parcerias Desbravando — ${esc(dados.territorio.nome)}</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${P / 96}in ${A / 96}in; margin: 0; }

  .pagina {
    position: relative;
    width: ${P}px; height: ${A}px;
    background: var(--preto);
    padding: 96px 120px;
    overflow: hidden;
    page-break-after: always;
  }
  .pagina:last-child { page-break-after: auto; }

  /* align-self: o container da capa é flex — sem isso a marca estica na largura. */
  .marca-topo { height: 60px; width: auto; display: block; align-self: flex-start; margin-bottom: 54px; }
  .sobrelinha { font-size: 20px; letter-spacing: 6px; margin-bottom: 26px; }
  /* O guia pede line-height ~0.85, que só vale para caixa alta sem acento: no
     Anton o Ê chega a 1.101 em acima da linha de base (Ã: 1.072; o E puro para
     em 0.859). Abaixo de 1.11 o acento invade a linha de cima em qualquer
     título português de duas linhas — daí o piso de 1.12 aqui. */
  .titulo.secao { font-size: 92px; line-height: 1.12; }
  .titulo.secao-menor { font-size: 76px; line-height: 1.12; }
  .titulo.hero { font-size: 132px; line-height: 1.12; }
  /* 4 linhas em caixa alta acentuada (Ã, Ê): abaixo de ~1.14 os acentos batem
     na linha de cima — o Anton desenha o acento acima da altura de caixa. */
  .titulo.hero-menor { font-size: 104px; line-height: 1.12; }
  .subtitulo { font-family: "Archivo"; font-weight: 700; font-size: 34px; color: var(--branco); }
  .corpo { font-size: 27px; line-height: 1.5; }
  .texto-largo { max-width: 820px; margin-top: 30px; }
  .pendente { color: rgba(255,255,255,.32); }

  .rodape {
    position: absolute; left: 120px; right: 120px; bottom: 56px;
    display: flex; justify-content: space-between;
    font-size: 18px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: rgba(255,255,255,.38);
    border-top: 1.5px solid var(--divisor); padding-top: 22px;
  }

  /* ---------- capa / encerramento ---------- */
  .capa, .encerramento { padding: 0; }
  .capa-fundo { position: absolute; inset: 0; }
  .capa-fundo .cobre { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
  /* Slot de fundo: o rótulo do que entra ali vai para o rodapé direito,
     fora do caminho do título. */
  .capa-fundo .slot-foto {
    width: 100%; height: 100%; border-radius: 0; border-width: 0;
    background: #0b0b0b; align-items: flex-end; justify-content: flex-end;
    padding: 64px 120px; font-size: 15px; color: rgba(255,255,255,.22);
  }
  .veu-capa {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, #000 0%, rgba(0,0,0,.92) 38%, rgba(0,0,0,.55) 68%, rgba(0,0,0,.35) 100%),
                linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.6) 100%);
  }
  .veu-encerramento {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,.86) 0%, rgba(0,0,0,.78) 55%, #000 100%);
  }
  .capa-conteudo {
    position: absolute; inset: 0; padding: 96px 120px;
    display: flex; flex-direction: column;
  }
  .capa .hero { margin-top: 8px; }
  .capa-base { margin-top: auto; }
  .capa-base .pilula { padding: 13px 26px; font-size: 22px; margin-bottom: 26px; }
  .capa-base .subtitulo { margin-bottom: 0; }
  .encerramento .capa-conteudo { justify-content: flex-start; }
  .encerramento .hero { margin-top: 40px; }
  .contato {
    margin-top: 22px; font-size: 22px; font-weight: 600;
    letter-spacing: 2px; color: var(--label); text-transform: uppercase;
  }

  /* ---------- página 2 · a tese ---------- */
  .duas-colunas { display: grid; grid-template-columns: 1fr 1.6fr; gap: 76px; margin-top: 74px; }
  .coluna { border-top: 1.5px solid var(--divisor); padding-top: 34px; }
  .coluna.apagada { opacity: .45; }
  .rotulo-coluna {
    font-size: 20px; font-weight: 600; letter-spacing: 4px;
    text-transform: uppercase; color: var(--label); margin-bottom: 30px;
  }
  .rotulo-coluna.forte { color: var(--branco); }
  .fluxo { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; font-size: 26px; font-weight: 700; }
  .fluxo i { color: rgba(255,255,255,.4); font-style: normal; }
  .fluxo.destaque { font-size: 30px; }
  .nota { margin-top: 26px; max-width: 560px; }

  /* ---------- página 3 · o Desbravando ---------- */
  .grade-2-1 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 90px; align-items: start; }
  .grade-1-1 { display: grid; grid-template-columns: 1fr 1fr; gap: 90px; align-items: start; }
  .alta { width: 100%; height: 620px; }
  .numeros { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; margin-top: 54px; }
  .numero { border-top: 1.5px solid var(--divisor); padding-top: 20px; }
  .numero .n { display: block; font-family: "Anton"; font-size: 54px; line-height: 1; color: var(--branco); }
  .numero .rot {
    display: block; margin-top: 10px; font-size: 16px; font-weight: 600;
    letter-spacing: 3px; text-transform: uppercase; color: var(--label);
  }

  /* ---------- página 4 · o ciclo ---------- */
  .ciclo { list-style: none; margin-top: 46px; display: grid; gap: 16px; }
  .ciclo li { display: flex; align-items: baseline; gap: 30px; border-top: 1.5px solid var(--divisor); padding-top: 18px; }
  .ciclo-n { font-family: "Anton"; font-size: 36px; color: rgba(255,255,255,.42); min-width: 74px; }
  .ciclo-t { font-size: 30px; font-weight: 700; color: var(--branco); }
  .destaque-linha { margin-top: 44px; max-width: 1180px; }

  /* ---------- página 5 · território ---------- */
  .grade-1-1 .subtitulo { margin-top: 18px; }
  .pergunta { margin-top: 40px; font-weight: 700; color: var(--branco); font-size: 27px; }
  .lista-territorio { margin-top: 26px; display: grid; gap: 20px; }
  .lista-territorio li { font-size: 25px; line-height: 1.45; color: var(--texto); }
  .lista-territorio li::before { font-size: 22px; }

  /* ---------- página 6 · o que ganha ---------- */
  .lista-ganho { margin-top: 62px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px 90px; }
  .lista-ganho li { font-size: 30px; line-height: 1.4; color: var(--branco); font-weight: 700; }
  .lista-ganho li::before { font-size: 26px; color: rgba(255,255,255,.5); }

  /* ---------- página 7 · casos ---------- */
  /* 400px, não 420: com legenda de três linhas nos três casos, 420 encostava a última
     linha no filete do rodapé — sobravam 18px. */
  .casos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 48px; }
  .caso-img, .caso .slot-foto { width: 100%; height: 400px; }
  .caso figcaption { display: block; margin-top: 22px; }
  .caso-local {
    display: block; font-size: 16px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: var(--label); margin-bottom: 10px;
  }
  .caso-legenda { display: block; font-size: 24px; line-height: 1.4; color: var(--branco); font-weight: 700; }

  /* ---------- página 8 · como construímos ---------- */
  /* 5 colunas fixas: em flex-wrap a última etapa caía sozinha com uma seta órfã. */
  .etapas { display: grid; grid-template-columns: repeat(5, 1fr); gap: 34px; margin-top: 78px; }
  .etapa { position: relative; border-top: 1.5px solid var(--divisor); padding-top: 22px; }
  .etapa:not(:last-child)::after {
    content: "→"; position: absolute; right: -26px; top: 30px;
    font-size: 26px; color: rgba(255,255,255,.35);
  }
  .etapa-n { display: block; font-family: "Anton"; font-size: 34px; color: rgba(255,255,255,.42); }
  .etapa-t { display: block; margin-top: 12px; font-size: 24px; font-weight: 700; color: var(--branco); line-height: 1.25; }
  .etapa-seta { font-style: normal; font-size: 28px; color: rgba(255,255,255,.35); }

  /* ---------- modo tipográfico ---------- */
  /* capa e encerramento sem foto: o campo de curvas de nível da identidade entra no
     lugar da imagem. Os véus são os mesmos, então a hierarquia do título não muda. */
  .capa-fundo.topo-grafico { color: #fff; opacity: .34; }
  .capa-fundo.topo-grafico svg { width: 100%; height: 100%; display: block; }
  /* O véu da capa foi calibrado para escurecer FOTO. Sobre as curvas de nível ele apaga
     o fundo inteiro do lado do título — aqui ele só segura o contraste do texto. */
  .topo-grafico ~ .veu-capa {
    background: linear-gradient(90deg, rgba(0,0,0,.88) 0%, rgba(0,0,0,.62) 34%, rgba(0,0,0,.2) 72%, rgba(0,0,0,.1) 100%);
  }
  .topo-grafico ~ .veu-encerramento {
    background: linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.6) 55%, rgba(0,0,0,.9) 100%);
  }

  /* grade de duas colunas colapsada: a coluna do texto ganha a largura, mas com teto —
     linha de 1680px de largura é ilegível, e o vazio à direita é intencional. */
  .grade-solo { display: block; }
  /* Sem foto E sem régua de audiência, a página 3 ficaria um título com dois parágrafos
     pequenos em cima de meia página vazia. O texto sobe de corpo e assume a página como
     declaração — é o mesmo conteúdo ocupando o espaço que era da foto. */
  .grade-solo .texto-largo { max-width: 1420px; font-size: 33px; line-height: 1.45; margin-top: 38px; }
  .grade-solo .subtitulo { margin-top: 18px; }
  .grade-solo .lista-territorio { grid-template-columns: 1fr 1fr; gap: 22px 90px; max-width: 1560px; }

  /* página 7 sem foto: trio editorial com o número grande. O número faz o trabalho de
     estrutura que a foto fazia — sem ele as três legendas flutuariam soltas. */
  /* Trio inteiro sem foto: o bloco desce e cresce, porque não há imagem sustentando a
     página. Uma figura sozinha sem foto (classe caso-solo) só troca a imagem pelo número,
     e mantém a altura das vizinhas para as três legendas continuarem alinhadas.
     ATENÇÃO: nada de acento grave neste comentário — ele está dentro de um template
     literal, e um acento grave solto fecha a string e o CSS vira código. */
  .casos.sem-foto { margin-top: 96px; }
  .caso-solo .caso-n { height: 420px; display: flex; align-items: center; margin-bottom: 0; }
  .casos.sem-foto .caso-solo .caso-n { height: auto; display: block; }
  .casos.sem-foto .caso { border-top: 1.5px solid var(--divisor); padding-top: 34px; }
  .casos.sem-foto figcaption { margin-top: 0; }
  .casos.sem-foto .caso-legenda { font-size: 30px; }
  .caso-n {
    display: block; font-family: "Anton"; font-size: 190px; line-height: 1;
    color: rgba(255,255,255,.22); margin-bottom: 36px;
  }

  /* ---------- página 8 · possibilidades ---------- */
  .lista-possib { margin-top: 54px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px 90px; }
  .lista-possib li { font-size: 27px; line-height: 1.4; color: var(--texto); }
  .lista-possib li::before { font-size: 24px; color: rgba(255,255,255,.5); }

  /* ---------- faixa de destaque (página 9) ---------- */
  .faixa {
    display: flex; align-items: center; flex-wrap: wrap; gap: 16px;
    margin-top: 46px; border-top: 1.5px solid var(--divisor); padding-top: 32px;
    font-family: "Anton"; font-size: 38px; text-transform: uppercase; letter-spacing: .01em;
    color: var(--branco);
  }
  .faixa i {
    font-style: normal; font-family: "Archivo"; font-weight: 700; font-size: 28px;
    color: rgba(255,255,255,.45);
  }
</style>
</head>
<body>
${paginas}
</body>
</html>`;

  return { html, pendencias: [...pendencias] };
}

export const meta = { nome: "parcerias", formatoPx: [P, A] };
