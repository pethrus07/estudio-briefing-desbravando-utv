/**
 * DOSSIÊ DA EXPEDIÇÃO — o PDF 16:9 que o cliente manda para quem vai viajar.
 *
 * Refaz em código o modelo que a Desbravando já usava (Costa Doce e Urubici): aqueles PDFs
 * saíram de Chrome headless em junho/2026, mas a FONTE nunca existiu nesta máquina. Em
 * 21/10/2026 o cliente pediu a Lençóis "no mesmo modelo", então o modelo foi lido do PDF
 * pronto, página por página, e reconstruído aqui — a partir de agora cada expedição nova é
 * um JSON, não um documento montado à mão.
 *
 * O conteúdo vem do CMS do site (ver desbravando-site/design/dossie-dados.mjs). O dossiê e a
 * página do site dizem a mesma coisa para a mesma pessoa: digitados à parte, divergem no
 * primeiro ajuste, e quem percebe é o cliente lendo um roteiro que não bate.
 *
 * Registro: núcleo P&B. A única cor vem da fotografia, e aqui ela vem — é peça de expedição,
 * não de marca.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));

/** A montanha embutida no HTML, nunca ligada por src: vetor que não pixela em 1920. */
const montanhaSvg = () =>
  readFileSync(join(aqui, "..", "marca", "logo-montanha-branco.svg"), "utf8")
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/width="[^"]*"|height="[^"]*"/g, "");

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const P = 1920;
const A = 1080;

/** Espaçado letra a letra, como as sobrelinhas do modelo. */
const sobre = (t) => esc(String(t ?? "").toUpperCase());

/**
 * Slot de foto. Sem arquivo, vira retângulo escuro com a descrição — a peça fica legível e
 * a falta aparece na lista de pendências, em vez de virar surpresa no envio.
 */
function foto(slot, classe = "") {
  if (!slot || !slot.arquivo)
    return `<div class="slot ${classe}"><span>${esc(slot?.descricao ?? "foto")}</span></div>`;
  return `<div class="foto ${classe}"><img src="${esc(slot.arquivo)}" alt="" style="object-position:${esc(slot.foco ?? "center 50%")}"></div>`;
}

const lista = (itens, marcador = "↗") =>
  itens.map((i) => `<li><span class="mk">${marcador}</span>${esc(i)}</li>`).join("");

export function dossie(dados) {
  const pendencias = [...(dados._pendencias ?? [])];
  const f = dados.fotos ?? {};
  /* A MONTANHA EM VETOR, e o nome como TEXTO espaçado — que é o que o modelo original faz:
     a primeira linha da capa dele é "D E S B R A V A N D O U T V · E X P E D I Ç Ã O", tipo,
     não imagem. O lockup em PNG traz o "UTV" encostado no "DO" e lê como erro de montagem;
     foi reprovado em 16/10 no cardápio pelo mesmo motivo. */
  const marca = `<div class="marca-vetor">${montanhaSvg()}</div>`;

  const pag = (classe, dentro) => `<section class="pagina ${classe}">${dentro}</section>`;

  /* ---- 1 · capa ---------------------------------------------------- */
  const capa = pag(
    "capa",
    `${foto(f.capa, "sangra")}
     <div class="veu"></div>
     <div class="dentro">
       ${marca}
       <p class="sobrelinha marca-nome">DESBRAVANDO UTV · EXPEDIÇÃO</p>
       <h1 class="titulo hero">${esc(dados.titulo)}</h1>
       <p class="linha-regiao">${esc(dados.subtitulo)}${dados.regiao ? " · " + esc(dados.regiao) : ""}</p>
       <p class="sobrelinha destaque">${sobre([dados.duracao, dados.destaques].filter(Boolean).join(" · "))}</p>
     </div>`
  );

  /* ---- 2 · quem somos ---------------------------------------------- */
  const quemSomos = pag(
    "texto-foto",
    `<div class="col">
       <p class="sobrelinha">QUEM SOMOS</p>
       <h2 class="titulo secao">CONHEÇA O<br>DESBRAVANDO UTV.</h2>
       <p class="corpo">${esc(dados.quemSomos ?? "")}</p>
     </div>
     ${foto(f.equipe, "meia")}`
  );
  if (!dados.quemSomos) pendencias.push("quemSomos — o texto da empresa (o mesmo do dossiê da Costa Doce serve)");

  /* ---- 3 · a expedição ---------------------------------------------- */
  const aExpedicao = pag(
    "texto-foto",
    `<div class="col">
       <p class="sobrelinha">A EXPEDIÇÃO</p>
       <h2 class="titulo secao">${esc(dados.tituloSobre)}</h2>
       <p class="corpo">${esc(dados.sobreDestino)}</p>
       <div class="numeros">
         ${[["duração", dados.duracao], ["percurso", dados.percurso], ["formato", dados.formato], ["base", dados.regiao ? dados.regiao.split("·")[0].trim() : ""]]
           .filter(([, v]) => v)
           .map(([r, v]) => `<div><small>${sobre(r)}</small><b>${esc(v)}</b></div>`)
           .join("")}
       </div>
     </div>
     ${foto(f.expedicao, "meia")}`
  );

  /* ---- 4..N · um slide por dia -------------------------------------- */
  const dias = (dados.roteiro ?? []).map((d, i) => {
    const cabeca = i === 0
      ? `<p class="sobrelinha">A JORNADA</p><h2 class="titulo secao-menor">O ROTEIRO · ${esc(dados.roteiro.length)} DIAS.</h2>`
      : `<p class="sobrelinha">${sobre(`DIA ${String(d.dia).padStart(2, "0")}${d.data ? " · " + d.data : ""}${d.local ? " · " + d.local : ""}`)}</p>`;
    return pag(
      "dia",
      `<div class="col">
         ${cabeca}
         <div class="dia-bloco">
           <span class="numero">${String(d.dia).padStart(2, "0")}</span>
           <div>
             <h3 class="titulo dia-titulo">${esc(String(d.titulo).replace(/^\s*dia\s*0?\d+\s*[-–—·:]\s*/i, ""))}</h3>
             <p class="corpo">${esc(d.texto)}</p>
             ${d.km ? `<p class="km">${sobre("trecho")} · ${esc(d.km)}</p>` : ""}
           </div>
         </div>
       </div>
       ${foto((f.dias ?? {})[String(d.dia)], "meia")}`
    );
  });

  /* ---- fora do volante ---------------------------------------------- */
  const foraDoVolante = pag(
    "texto-foto",
    `<div class="col">
       <p class="sobrelinha">FORA DO VOLANTE</p>
       <h2 class="titulo secao">BOAS-VINDAS &amp;<br>ENCERRAMENTO.</h2>
       <p class="corpo">Toda expedição começa e termina com um evento à altura — o seu momento fora do
         volante. Antes da primeira trilha e no fim da última, o grupo se encontra fora do UTV.</p>
     </div>
     ${foto(f.encerramento, "meia")}`
  );

  /* ---- o padrão Desbravando ------------------------------------------ */
  const padrao = pag(
    "lista",
    `<p class="sobrelinha">O PADRÃO DESBRAVANDO</p>
     <h2 class="titulo secao">A GENTE CUIDA DOS DETALHES.</h2>
     <ul class="itens duas">${lista(dados.padrao ?? [])}</ul>
     <p class="assinatura">TUDO O QUE VOCÊ PRECISA FAZER<br>É ESTAR PRESENTE.</p>`
  );

  /* ---- hospedagem ----------------------------------------------------- */
  const hosp = pag(
    "hospedagem",
    `<p class="sobrelinha">HOSPEDAGEM</p>
     <h2 class="titulo secao-menor">ONDE VOCÊ FICA.</h2>
     <div class="hoteis">
       ${(dados.hospedagens ?? [])
         .map(
           (h) => `<div class="hotel">
         <p class="sobrelinha mini">${sobre(h.onde)}</p>
         ${h.papel ? `<p class="papel">${esc(h.papel)}</p>` : ""}
         <h3 class="titulo hotel-nome">${esc(h.nome)}</h3>
         ${h.noites ? `<p class="km">${esc(h.noites)}</p>` : ""}
         ${h.texto ? `<p class="corpo menor">${esc(h.texto)}</p>` : ""}
       </div>`
         )
         .join("")}
     </div>
     ${dados.hospedagemNota ? `<p class="nota-rodape">${esc(dados.hospedagemNota)}</p>` : ""}`
  );

  /* ---- o pacote -------------------------------------------------------- */
  const pacote = pag(
    "pacote",
    `<p class="sobrelinha">O PACOTE</p>
     <h2 class="titulo secao-menor">O QUE ESTÁ INCLUSO.</h2>
     <div class="duas-colunas">
       <div>
         <p class="sobrelinha mini">INCLUSO</p>
         <ul class="itens">${lista(dados.incluso ?? [], "✓")}</ul>
       </div>
       <div>
         <p class="sobrelinha mini">NÃO INCLUSO</p>
         <ul class="itens fora">${lista(dados.naoIncluso ?? [], "–")}</ul>
       </div>
     </div>`
  );

  /* ---- fecho ----------------------------------------------------------- */
  const fecho = pag(
    "fecho",
    `${foto(f.fecho, "sangra")}
     <div class="veu"></div>
     <div class="dentro centro">
       <h2 class="titulo secao">ISSO NÃO É TRILHA,<br>É EXPEDIÇÃO PADRÃO DESBRAVANDO.</h2>
       <p class="sobrelinha destaque">${sobre(`EXPEDIÇÃO ${dados.titulo} · ${dados.subtitulo}`)}</p>
       <p class="corpo menor">Reservas &amp; Info · Fale com a equipe Desbravando</p>
       ${marca}
     </div>`
  );

  const corpo = [capa, quemSomos, aExpedicao, ...dias, foraDoVolante, padrao, hosp, pacote, fecho].join("\n");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Expedição ${esc(dados.titulo)} — Desbravando UTV</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${P / 96}in ${A / 96}in; margin: 0; }
  html, body { margin: 0; padding: 0; background: #0d0d0d; }

  .pagina {
    position: relative; width: ${P}px; height: ${A}px;
    background: var(--preto); color: #fff; padding: 96px 120px;
    overflow: hidden; page-break-after: always;
    display: flex; gap: 72px; align-items: center;
  }
  .pagina:last-child { page-break-after: auto; }

  .marca-vetor { width: 128px; margin-bottom: 30px; }
  .marca-vetor svg { width: 100%; height: auto; display: block; fill: #fff; }
  .fecho .marca-vetor { margin: 40px auto 0; }
  .sobrelinha.marca-nome { letter-spacing: 8px; color: rgba(255,255,255,.72); }
  /* line-height 1.11 e não 0.85: no Anton o Ç e o Ã passam de 1.07em acima da linha de base,
     e abaixo disso o acento invade a linha de cima. O guia pede 0.85 para caixa alta SEM
     acento, que em português quase não existe. */
  .titulo { font-family: "Anton"; font-weight: 400; text-transform: uppercase; line-height: 1.11; margin: 0; letter-spacing: -0.5px; }
  .titulo.hero { font-size: 148px; }
  .titulo.secao { font-size: 84px; }
  .titulo.secao-menor { font-size: 68px; }
  .titulo.dia-titulo { font-size: 54px; margin-bottom: 18px; }
  .titulo.hotel-nome { font-size: 34px; margin: 8px 0 6px; }

  .sobrelinha {
    font-family: "Archivo"; font-size: 19px; letter-spacing: 6px;
    color: rgba(255,255,255,.55); margin: 0 0 22px; text-transform: uppercase;
  }
  .sobrelinha.mini { font-size: 16px; letter-spacing: 4px; margin-bottom: 10px; }
  .sobrelinha.destaque { color: rgba(255,255,255,.82); margin: 28px 0 0; }

  .corpo { font-family: "Archivo"; font-size: 26px; line-height: 1.52; color: rgba(255,255,255,.82); margin: 24px 0 0; max-width: 46ch; }
  .corpo.menor { font-size: 21px; margin-top: 12px; }
  .km { font-family: "Archivo"; font-size: 18px; letter-spacing: 3px; color: rgba(255,255,255,.55); margin: 16px 0 0; text-transform: uppercase; }
  .linha-regiao { font-family: "Archivo"; font-size: 28px; color: rgba(255,255,255,.82); margin: 22px 0 0; }

  .col { flex: 1 1 52%; min-width: 0; }
  .foto, .slot { flex: 1 1 48%; align-self: stretch; margin: -96px -120px -96px 0; }
  .foto.meia, .slot.meia { max-width: 46%; }
  .foto img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(1.05) contrast(1.04); }
  .slot { background: #171717; display: flex; align-items: center; justify-content: center; }
  .slot span { font-family: "Archivo"; font-size: 20px; letter-spacing: 3px; color: rgba(255,255,255,.38); text-transform: uppercase; }
  .foto.sangra, .slot.sangra { position: absolute; inset: 0; margin: 0; max-width: none; }
  .veu { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.86) 0%, rgba(0,0,0,.62) 52%, rgba(0,0,0,.35) 100%); }
  .capa .dentro, .fecho .dentro { position: relative; width: 100%; }
  .fecho .dentro.centro { text-align: center; }

  .dia-bloco { display: flex; gap: 34px; align-items: flex-start; margin-top: 30px; }
  .numero { font-family: "Anton"; font-size: 92px; line-height: 1; color: rgba(255,255,255,.26); }

  .itens { list-style: none; padding: 0; margin: 30px 0 0; }
  .itens li { font-family: "Archivo"; font-size: 23px; line-height: 1.5; color: rgba(255,255,255,.88); margin-bottom: 14px; display: flex; gap: 14px; }
  .itens li .mk { color: rgba(255,255,255,.55); flex: none; }
  .itens.fora li { color: rgba(255,255,255,.62); }
  .itens.duas { columns: 2; column-gap: 72px; }
  .itens.duas li { break-inside: avoid; }
  .lista, .pacote, .hospedagem { flex-direction: column; align-items: flex-start; justify-content: center; }
  .duas-colunas { display: flex; gap: 96px; width: 100%; margin-top: 10px; }
  .duas-colunas > div { flex: 1 1 50%; }
  .assinatura { font-family: "Anton"; font-size: 46px; line-height: 1.14; text-transform: uppercase; margin: 44px 0 0; color: #fff; }

  .numeros { display: flex; gap: 56px; margin-top: 44px; }
  .numeros small { display: block; font-family: "Archivo"; font-size: 15px; letter-spacing: 4px; color: rgba(255,255,255,.55); text-transform: uppercase; }
  .numeros b { display: block; font-family: "Anton"; font-size: 34px; font-weight: 400; margin-top: 8px; }

  .hoteis { display: flex; gap: 48px; width: 100%; margin-top: 18px; }
  .hotel { flex: 1 1 0; border-top: 1.5px solid rgba(255,255,255,.4); padding-top: 18px; }
  .papel { font-family: "Archivo"; font-size: 17px; line-height: 1.4; color: rgba(255,255,255,.62); margin: 6px 0 0; }
  .titulo.hotel-nome { font-size: 30px; }
  .nota-rodape { font-family: "Archivo"; font-size: 19px; color: rgba(255,255,255,.55); margin: 40px 0 0; }
</style>
</head>
<body>
${corpo}
</body>
</html>`;

  return { html, pendencias };
}
