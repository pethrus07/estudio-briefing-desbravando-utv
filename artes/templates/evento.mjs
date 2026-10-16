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

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

  /* Um item com `grupo` no lugar de `nome` é CABEÇALHO de seção, não prato. Entrou em
     16/10/2026 porque o cardápio da Origens chegou dividido em "Pratos principais" e
     "Acompanhamentos", e sem a divisão o acompanhamento aparece do mesmo tamanho do prato —
     a peça passa a dizer que batata frita e bife ancho têm o mesmo peso.
     Compatível com o que já existe: cardápio sem `grupo` nenhum sai igual ao de agosto. */
  const itens = (dados.itens ?? [])
    .map((i) =>
      i.grupo
        ? `
      <li class="grupo"><span>${esc(i.grupo)}</span></li>`
        : `
      <li>
        <span class="item-nome">${esc(i.nome)}</span>
        ${i.detalhe ? `<span class="item-detalhe">${esc(i.detalhe)}</span>` : ""}
      </li>`
    )
    .join("");

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
  .itens { list-style: none; margin-top: ${Math.round(40 * k)}px; width: 100%; }
  .itens li {
    padding: ${Math.round(19 * k)}px 0;
    border-bottom: 1px solid rgba(255,255,255,.14);
  }
  .itens li:first-child { border-top: 1px solid rgba(255,255,255,.14); }
  .item-nome {
    display: block; font-family: "Anton"; font-weight: 400;
    font-size: ${Math.round(58 * k)}px; line-height: 1.06;
    text-transform: uppercase; color: var(--branco); letter-spacing: .5px;
  }
  .item-detalhe {
    display: block; margin-top: ${Math.round(7 * k)}px;
    font-size: ${Math.round(25 * k)}px; color: rgba(255,255,255,.74);
  }
  /* Cabeçalho de seção: mesma régua da sobrelinha, para ler como rótulo e não como prato.
     Sem o fio de baixo, senão vira linha de lista; o fio do item seguinte já separa. */
  .itens li.grupo {
    padding: ${Math.round(26 * k)}px 0 ${Math.round(9 * k)}px;
    border-bottom: 0;
  }
  .itens li.grupo span {
    font-size: ${Math.round(23 * k)}px; letter-spacing: ${Math.round(3 * k)}px;
    text-transform: uppercase; color: rgba(255,255,255,.55);
  }
  .itens li.grupo + li { border-top: 1px solid rgba(255,255,255,.14); }

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
      <img class="marca" src="../marca/logo-desbravando.png" alt="Desbravando UTV">
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
