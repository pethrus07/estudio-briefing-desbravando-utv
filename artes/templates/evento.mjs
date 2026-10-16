/**
 * PEÇA DE EVENTO — social, formato stories (1080 × 1920) e feed (1080 × 1350).
 *
 * Segue a estética das artes de pré-expedição: foto escura full-bleed, cantos em
 * cantoneira, logo centralizado no topo, sobrelinha espaçada, título em Anton
 * oblíquo, fio curto e rodapé com o patrocínio oficial.
 *
 * Registro: núcleo (P&B) sobre fotografia — a única cor vem da foto, como manda o
 * guia. O título é oblíquo por inclinação (o Anton não tem itálico), igual à
 * referência aprovada.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** A montanha embutida no HTML, não ligada por `src`: vetor que nunca pixela. */
const montanhaSvg = () =>
  readFileSync(join(aqui, "..", "marca", "logo-montanha-branco.svg"), "utf8")
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/width="[^"]*"|height="[^"]*"/g, "");

/**
 * `k` é a escala tipográfica. Nos formatos de tela ela vem da altura; nos de mesa,
 * da largura — o A5 é mais quadrado que o 9:16 e, escalando pela altura, o texto
 * saía pequeno demais para uma peça que é lida a um braço de distância.
 * `sangriaMm` > 0 marca formato de impressão: a página cresce e o conteúdo recua.
 */
const FORMATOS = {
  stories: { l: 1080, a: 1920, k: 1, sangriaMm: 0 },
  feed: { l: 1080, a: 1350, k: 1350 / 1920, sangriaMm: 0 },
  // A5 148×210 mm @96dpi = 559×794 px, + 3 mm de sangria por lado
  mesa: { l: 582, a: 816, k: 0.6, sangriaMm: 3, mm: [154, 216] },
  // A4 210×297 mm @96dpi = 794×1123 px, + 3 mm
  "mesa-a4": { l: 816, a: 1146, k: 0.82, sangriaMm: 3, mm: [216, 303] },
};

/** Ícones desenhados (relógio, pin, copo) — sem dependência de fonte de símbolo. */
const ICONES = {
  hora: `<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.5 2"/>`,
  local: `<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>`,
  taca: `<path d="M6.5 4h11l-1 5.5a4.5 4.5 0 0 1-9 0z"/><path d="M12 14v6"/><path d="M8.5 20h7"/>`,
  fatia: `<path d="M3 6.5 12 21l9-14.5A22 22 0 0 0 3 6.5z"/><circle cx="10" cy="10.5" r="1.4"/><circle cx="14" cy="13" r="1.4"/>`,
};

const icone = (nome, tamanho) => `
        <svg class="ic" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none"
             stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          ${ICONES[nome] ?? ICONES.fatia}
        </svg>`;

export function evento(dados, opcoes = {}) {
  const fmt = FORMATOS[opcoes.formato] ?? FORMATOS.stories;
  const k = fmt.k;
  // sangria em px: o conteúdo recua para não morrer no corte
  const sangria = Math.round((fmt.sangriaMm / 25.4) * 96);
  const pendencias = [];

  if (!dados.fundo?.arquivo) pendencias.push(`foto de fundo · ${dados.fundo?.descricao ?? "sem descrição"}`);

  /* Três tipos de linha na lista, e não um só. Entrou em 16/10/2026 com o cardápio da
     Origens, que é UMA peça por dia com as duas refeições dentro:

       { "secao": "Almoço" }            refeição — divisor forte
       { "grupo": "Acompanhamentos" }   categoria — rótulo pequeno
       { "nome": "Bife grelhado" }      prato

     Sem os dois níveis, batata frita e bife ancho saem do mesmo tamanho, e almoço e jantar
     viram uma lista só de quinze pratos sem ninguém saber onde um acaba.
     Compatível: cardápio sem `secao` nem `grupo` sai igual ao de agosto. */
  const itens = (dados.itens ?? [])
    .map((i) =>
      i.secao
        ? `
      <li class="secao"><span>${esc(i.secao)}</span></li>`
        : i.grupo
          ? `
      <li class="grupo"><span>${esc(i.grupo)}</span></li>`
          : `
      <li>
        <span class="item-nome">${esc(i.nome)}</span>
        ${i.detalhe ? `<span class="item-detalhe">${esc(i.detalhe)}</span>` : ""}
      </li>`
    )
    .join("");

  /* CONDENSAÇÃO. O corpo da peça é fixo: o que cresce é a lista. Com 7 linhas sobra espaço;
     com 21, que é o dia de parrilla com as duas refeições, o texto desce para fora do
     formato e o PNG sai cortado sem nenhum erro aparecer. `d` encolhe tipografia e respiro
     proporcionalmente, com piso para não virar letra miúda. O número 11 é a lista que cabe
     folgada em 1080×1350 no tamanho cheio — medido, não estimado. */
  const menuEstilo = dados.estilo === "menu";
  const linhasLista = (dados.itens ?? []).length;
  /* O limite depende do REGISTRO, não é um número do template. O registro menu usa Archivo
     num corpo bem menor que o Anton caixa alta e não tem fio por linha: cabe quase o dobro.
     Com o limite de 11 valendo para os dois, o cardápio do dia 2 saiu condensado sem
     precisar e deixou um terço da peça vazio — condensar o que já cabia. */
  const limite = menuEstilo ? 18 : 11;
  const d = linhasLista <= limite ? 1 : Math.max(0.58, limite / linhasLista);

  /* REGISTRO MENU — entrou em 16/10/2026, depois de o Pedro reprovar o cardápio da Origens
     por "pouco refinado".

     O defeito era de registro tipográfico, não de capricho: eu tinha posto CADA PRATO em
     Anton caixa alta. O guia da marca é explícito — Anton é TÍTULO, Archivo é corpo. Vinte
     linhas de Anton viram um paredão de caixa alta em que nada lidera, e o fio embaixo de
     cada uma transforma cardápio em planilha.

     Aqui o prato volta para Archivo, escrito como se escreve, e o fio só aparece onde
     separa refeição. Quem manda na página passa a ser o espaço, não o traço — que é o que
     faz um cardápio parecer cardápio. A escada de opacidade é a do guia: .82 no texto
     secundário, .55 no rótulo, .13 no divisor. */
  const menu = menuEstilo;

  const linhas = (dados.linhas ?? [])
    .map(
      (l) => `
      <div class="linha">
        ${icone(l.icone, Math.round(30 * k))}
        <span>${esc(l.texto)}</span>
      </div>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${esc(dados.titulo.replace(/<br>/g, " "))} — ${opcoes.formato ?? "stories"}</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${fmt.mm ? `${fmt.mm[0]}mm ${fmt.mm[1]}mm` : `${fmt.l}px ${fmt.a}px`}; margin: 0; }

  .peca {
    position: relative; width: ${fmt.l}px; height: ${fmt.a}px;
    background: var(--preto); overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: ${Math.round(96 * k) + sangria}px ${Math.round(84 * k) + sangria}px ${Math.round(74 * k) + sangria}px;
    text-align: center;
  }

  .fundo, .veu { position: absolute; inset: 0; }
  .fundo .slot-foto { width: 100%; height: 100%; border-radius: 0; border-width: 0; background: #0c0c0c; }
  /* a foto é a única cor da peça; sob véu pesado ela desbota, então recupera aqui */
  .fundo img { filter: contrast(1.14) saturate(1.18) brightness(.96); }

  /* modo "cover": foto vertical preenchendo a peça inteira */
  .fundo.cover img { width: 100%; height: 100%; object-fit: cover; object-position: ${esc(dados.fundo?.foco ?? "center 60%")}; }

  /* modo "base": foto horizontal ancorada embaixo, na largura da peça. Em cover, uma
     foto 3:2 numa peça 9:16 é ampliada até a altura e só sobra um detalhe irreconhecível. */
  /* altura travada: com height auto, uma foto 3:2 na largura da peça sobe até a
     metade dela e passa por trás da lista, comendo a legibilidade dos nomes */
  .fundo.base img {
    position: absolute; bottom: 0; left: 0; width: 100%;
    height: ${Math.round((dados.fundo?.alturaPct ?? 40) * 1)}%;
    object-fit: cover; object-position: ${esc(dados.fundo?.foco ?? "center 45%")};
    /* a borda de cima tem de morrer no preto: sem a máscara aparece um corte reto
       atravessando a peça na altura em que a foto começa */
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 26%, #000 100%);
            mask-image: linear-gradient(to bottom, transparent 0%, #000 26%, #000 100%);
  }

  /* Véu de leitura: fecha o topo (onde vive o texto) e abre na base, que é onde a
     comida precisa ser reconhecível. */
  .veu {
    background:
      radial-gradient(96% 44% at 50% 26%, rgba(0,0,0,.5) 0%, rgba(0,0,0,.72) 62%, rgba(0,0,0,.82) 100%),
      linear-gradient(180deg, #000 0%, rgba(0,0,0,.95) 34%, rgba(0,0,0,.88) 58%, rgba(0,0,0,.5) 72%, rgba(0,0,0,.3) 84%, rgba(0,0,0,.66) 100%);
  }

  /* cantoneiras */
  .canto {
    position: absolute; width: ${Math.round(58 * k)}px; height: ${Math.round(58 * k)}px;
    border: ${Math.max(2, Math.round(2.5 * k))}px solid rgba(255,255,255,.72);
  }
  .canto.tl { top: ${Math.round(44 * k) + sangria}px; left: ${Math.round(44 * k) + sangria}px; border-right: 0; border-bottom: 0; }
  .canto.tr { top: ${Math.round(44 * k) + sangria}px; right: ${Math.round(44 * k) + sangria}px; border-left: 0; border-bottom: 0; }
  .canto.bl { bottom: ${Math.round(44 * k) + sangria}px; left: ${Math.round(44 * k) + sangria}px; border-right: 0; border-top: 0; }
  .canto.br { bottom: ${Math.round(44 * k) + sangria}px; right: ${Math.round(44 * k) + sangria}px; border-left: 0; border-top: 0; }

  .conteudo { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; height: 100%; }

  /* teto relativo: no A5 a largura fixa deixava o logo ocupando quase a peça toda */
  .marca { width: min(${Math.round(262 * k)}px, 34%); height: auto; display: block; }
  .sobrelinha {
    margin-top: ${Math.round(26 * k)}px;
    font-size: ${Math.round(21 * k)}px; letter-spacing: ${Math.round(6 * k)}px;
    color: rgba(255,255,255,.74);
  }

  .titulo-bloco { margin-top: ${Math.round(52 * k)}px; }
  .titulo {
    font-size: ${Math.round(108 * k)}px; line-height: 1.02; letter-spacing: -1px;
    transform: skewX(-8deg);
  }
  .subtitulo {
    margin-top: ${Math.round(24 * k)}px;
    font-family: "Archivo"; font-weight: 400; font-size: ${Math.round(33 * k)}px;
    color: rgba(255,255,255,.9);
  }

  .fio {
    width: ${Math.round(430 * k)}px; height: ${Math.max(1, Math.round(2 * k))}px;
    background: rgba(255,255,255,.42); margin: ${Math.round(38 * k)}px 0 0;
  }

  /* lista principal (os sabores) */
  .itens { list-style: none; margin-top: ${Math.round(40 * k * d)}px; width: 100%; }
  .itens li {
    padding: ${Math.round(19 * k * d)}px 0;
    border-bottom: 1px solid rgba(255,255,255,.14);
  }
  .itens li:first-child { border-top: 1px solid rgba(255,255,255,.14); }
  .item-nome {
    display: block; font-family: "Anton"; font-weight: 400;
    font-size: ${Math.round(58 * k * d)}px; line-height: 1.06;
    text-transform: uppercase; color: var(--branco); letter-spacing: .5px;
  }
  .item-detalhe {
    display: block; margin-top: ${Math.round(7 * k * d)}px;
    font-size: ${Math.round(25 * k * d)}px; color: rgba(255,255,255,.74);
  }
  /* Categoria: mesma régua da sobrelinha, para ler como rótulo e não como prato.
     Sem o fio de baixo, senão vira linha de lista; o fio do item seguinte já separa. */
  .itens li.grupo {
    padding: ${Math.round(26 * k * d)}px 0 ${Math.round(9 * k * d)}px;
    border-bottom: 0;
  }
  .itens li.grupo span {
    font-size: ${Math.round(23 * k)}px; letter-spacing: ${Math.round(3 * k)}px;
    text-transform: uppercase; color: rgba(255,255,255,.55);
  }
  .itens li.grupo + li { border-top: 1px solid rgba(255,255,255,.14); }

  /* Refeição: divisor forte. Precisa vencer a categoria sem competir com o prato, por isso
     é branco cheio e com fio em cima — é ele que diz onde o almoço acaba e o jantar começa. */
  .itens li.secao {
    padding: ${Math.round(34 * k * d)}px 0 ${Math.round(12 * k * d)}px;
    border-bottom: 0; border-top: 2px solid rgba(255,255,255,.5);
    margin-top: ${Math.round(10 * k * d)}px;
  }
  /* Primeira linha da lista: o fio do título já separa, e o da seção em cima dele faz
     listra dupla. */
  .itens li:first-child.secao { margin-top: 0; border-top: 0; padding-top: ${Math.round(14 * k * d)}px; }
  .itens li.secao span {
    font-family: "Anton"; font-weight: 400;
    /* Medida RELATIVA ao prato, não fixa. Com a lista condensada o prato encolhe e um
       tamanho fixo de refeição passa a empatar com ele — foi o que aconteceu no dia 2:
       "ALMOÇO · PARRILLA" saiu do tamanho de "CHORIPÁN" e a refeição parou de liderar a
       leitura. Em 1,22× ela vence o prato em qualquer densidade. */
    font-size: ${Math.round(58 * k * d * 1.22)}px; letter-spacing: ${Math.round(2 * k)}px;
    text-transform: uppercase; color: var(--branco);
  }
  .itens li.secao + li, .itens li.secao + li.grupo + li { border-top: 0; }

  ${
    menu
      ? `
  /* ---- registro MENU ---- */
  .marca-vetor { width: ${Math.round(132 * k)}px; margin: 0 auto; }
  .marca-vetor svg { width: 100%; height: auto; display: block; fill: #fff; }

  /* A regra "li.grupo + li" lá de cima devolvia um fio no primeiro item depois da
     categoria, e como a categoria está oculta no menu ele aparecia solto no meio da lista,
     antes de "Arroz" e de "Batata frita". Regra escondida continua valendo: é preciso
     desligar, não basta esconder quem a dispara.
     SEM ACENTO GRAVE NESTE COMENTÁRIO: ele fecha o template literal que carrega o CSS, e
     foi assim que eu quebrei este arquivo agora há pouco. É a sexta vez nesta base. */
  .itens li, .itens li:first-child,
  .itens li.grupo + li, .itens li.secao + li, .itens li.secao + li.grupo + li {
    border: 0; padding: ${Math.round(12 * k * d)}px 0;
  }
  /* O rótulo do slot de foto vive atrás do véu. No registro menu sobra área escura sem
     texto por cima, e ele passou a aparecer de fininho no meio da peça. */
  .slot-foto span { display: none; }
  .item-nome {
    font-family: "Archivo"; font-weight: 400; text-transform: none;
    font-size: ${Math.round(40 * k * d)}px; line-height: 1.22;
    letter-spacing: 0; color: rgba(255,255,255,.92);
  }
  /* Rótulo some do registro menu: com o fio e o respiro, "Pratos principais" vira ruído.
     O que a pessoa precisa saber é a refeição e o que tem nela. O acompanhamento se
     distingue por ficar depois do fio curto, não por um rótulo em cima. */
  .itens li.grupo { display: none; }
  .itens li.secao {
    border-top: 0; margin-top: ${Math.round(40 * k * d)}px;
    padding: 0 0 ${Math.round(16 * k * d)}px;
  }
  .itens li:first-child.secao { margin-top: ${Math.round(8 * k)}px; padding-top: 0; }
  .itens li.secao span {
    font-family: "Anton"; font-size: ${Math.round(40 * k)}px;
    letter-spacing: ${Math.round(4 * k)}px; color: #fff;
  }
  /* O fio é do guia: 1,5px em .13, e um por refeição — não um por prato. */
  .itens li.secao::after {
    content: ""; display: block; width: ${Math.round(74 * k)}px;
    height: 1.5px; background: rgba(255,255,255,.4);
    margin: ${Math.round(14 * k * d)}px auto 0;
  }
  .fio { display: none; }
  .titulo { letter-spacing: ${Math.round(-1 * k)}px; }
  .sobrelinha { color: rgba(255,255,255,.55); }
  /* Piso de respiro entre o último prato e o rodapé. Sem ele, com a lista no limite, a
     data encosta no prato: o medidor não acusa, porque não chega a haver colisão, e o
     olho acusa na hora. Folga que depende do conteúdo não é folga, é sorte. */
  .linhas { margin-top: ${Math.round(46 * k)}px; }
  /* A lista FLUTUA no espaço que sobra, em vez de empilhar a partir do título. O dia 1 tem
     13 linhas e o dia 2 tem 20; ancorada no topo, a primeira sobrava um terço de peça vazia
     embaixo e as duas pareciam de pesos diferentes lado a lado no carrossel. Com a folga
     dividida em cima e embaixo, as duas lêem como a mesma peça. */
  .itens { margin-top: auto; margin-bottom: auto; }`
      : ""
  }

  /* recado do chef: fecha a lista sem competir com os nomes dos sabores */
  .nota {
    margin-top: ${Math.round(30 * k)}px;
    max-width: ${Math.round(760 * k)}px;
    font-size: ${Math.round(27 * k)}px; line-height: 1.5;
    color: rgba(255,255,255,.86);
  }

  /* linhas de serviço (hora, local, recado) — bloco centralizado, texto à esquerda,
     como na arte de referência: centralizar cada linha desalinha os ícones. */
  .linhas { margin-top: auto; display: grid; gap: ${Math.round(15 * k)}px; justify-items: start; }
  .linha {
    display: flex; align-items: center; gap: ${Math.round(14 * k)}px;
    font-size: ${Math.round(30 * k)}px; color: var(--branco); text-align: left;
  }
  .linha .ic { flex: none; opacity: .92; }

  .rodape { margin-top: ${Math.round(44 * k)}px; }
  .rodape .label {
    font-size: ${Math.round(17 * k)}px; letter-spacing: ${Math.round(4 * k)}px;
    color: rgba(255,255,255,.6);
  }
  .rodape img { width: ${Math.round(132 * k)}px; height: auto; display: block; margin: ${Math.round(14 * k)}px auto 0; }
</style>
</head>
<body>
  <div class="peca">
    <div class="fundo ${esc(dados.fundo?.modo ?? "cover")}">
      ${
        dados.fundo?.arquivo
          ? `<img src="${esc(dados.fundo.arquivo)}" alt="">`
          : `<div class="slot-foto"><span>${esc(dados.fundo?.descricao ?? "foto de fundo")}</span></div>`
      }
    </div>
    <div class="veu"></div>
    <div class="canto tl"></div><div class="canto tr"></div>
    <div class="canto bl"></div><div class="canto br"></div>

    <div class="conteudo">
      ${
        menu
          ? /* MONTANHA EM VETOR, não o lockup. O `logo-desbravando.png` tem 600px de largura
               e, pior que a resolução, traz o "UTV" ENCOSTADO no "DO" — ampliado, lê como
               defeito de montagem, e foi o que o Pedro chamou de "logo antiga" em 16/10/2026.
               A montanha sozinha é a mesma marca que ele aprovou hoje como ícone do site:
               vetor, nunca pixela, e numa peça de cardápio não precisa do nome por extenso,
               que a sobrelinha já diz. */
            `<div class="marca-vetor">${montanhaSvg()}</div>`
          : `<img class="marca" src="../marca/logo-desbravando.png" alt="Desbravando UTV">`
      }
      <p class="sobrelinha">${esc(dados.sobrelinha)}</p>

      <div class="titulo-bloco">
        <h1 class="titulo">${dados.titulo}</h1>
        ${dados.subtitulo ? `<p class="subtitulo">${esc(dados.subtitulo)}</p>` : ""}
      </div>
      <hr class="fio">

      <ul class="itens">${itens}
      </ul>

      ${dados.nota ? `<p class="nota">${esc(dados.nota)}</p>` : ""}

      <div class="linhas">${linhas}
      </div>

      ${
        dados.patrocinio
          ? `<div class="rodape">
        <p class="label sobrelinha">${esc(dados.patrocinio.label)}</p>
        <img src="${esc(dados.patrocinio.logo)}" alt="">
      </div>`
          : ""
      }
    </div>
  </div>
</body>
</html>`;

  return { html, pendencias };
}

export const meta = { nome: "evento", formatos: FORMATOS };
