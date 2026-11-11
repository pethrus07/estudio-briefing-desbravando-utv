/**
 * CONTAGEM REGRESSIVA — story 1080 × 1920, uma arte por número.
 *
 * Foto de expedição sangrando a tela inteira e colorida (regra da marca: foto de expedição
 * entra com a cor dela; só peça de marca/patrocínio dessatura). O número é o herói, em
 * Anton; o resto é Archivo. A linguagem segue o PDF de apresentação da expedição que o
 * cliente usa (sobrelinha espaçada, Anton gigante, pílulas de borda fina), para a contagem
 * ler como parte da mesma campanha.
 *
 * LOGO: a oficial, montanha · filete · #DESBRAVANDOUTV (`marca/logo-oficial.svg`, gerado por
 * `ferramentas/atualizar-logo.py` a partir do arquivo que o Pedro mandou em 11/11/2026). Não é o `logo-lateral.svg` de 26/08: a
 * montanha nova é mais achatada e a fonte do texto é outra.
 *
 * SÉRIE: a régua "20 · 15 · 7 · 3 · 1" acende o número do dia e apaga os outros. É o que
 * faz as cinco artes lerem como uma sequência no feed de stories.
 *
 * ZONAS DO INSTAGRAM: os ~250 px de cima (barra de progresso, perfil) e os ~340 px de
 * baixo (campo de resposta) ficam cobertos no app. Nada de texto ali: a logo começa em
 * 250 e o bloco termina antes de 1580. O fundo continua sangrando por baixo.
 *
 * Regra herdada do comum: nenhum texto com line-height abaixo de 1. O Anton tem a caixa
 * mais curta que o glifo; o aperto óptico entre linhas se faz com margin.
 */
import { esc, svgDoRepo } from "./comum.mjs";

const L = 1080;
const A = 1920;
const TOPO_SEGURO = 250;
const BASE_SEGURA = 340;
const MARGEM = 84;

export function contagem(dados, n, opcoes = {}) {
  const item = dados.numeros.find((x) => x.n === n);
  if (!item) throw new Error(`número ${n} não está nos dados`);
  const um = n === 1;
  const url = (c) => (opcoes.resolverFoto ? opcoes.resolverFoto(c) : c);
  const serie = dados.numeros.map((x) => x.n);

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Contagem ${n} · ${esc(dados.expedicao)}</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  *{ margin:0; padding:0; box-sizing:border-box }
  html,body{ width:${L}px; height:${A}px; overflow:hidden; background:#000 }
  body{ color:#fff; font-family:"Archivo",sans-serif; -webkit-font-smoothing:antialiased }
  .peca{ position:relative; width:${L}px; height:${A}px; overflow:hidden }

  .foto{
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover; object-position:${item.posicao ?? "50% 50%"};
  }
  /* véu: degradê contínuo (uma janela clara entre duas faixas escuras vira listra) + uma
     sombra elíptica só atrás da logo, para a foto continuar aberta no resto do topo. Fecha
     em preto quase sólido onde mora o número. Calibrado por medição de
     contraste nas cinco fotos (texto mais fraco acima de 4,5:1). */
  .veu{
    position:absolute; inset:0;
    background:
      radial-gradient(ellipse 1040px 330px at 400px 345px, rgba(0,0,0,.76), rgba(0,0,0,.30) 55%, rgba(0,0,0,0) 80%),
      linear-gradient(180deg,
        rgba(0,0,0,.50) 0%, rgba(0,0,0,.22) 15%, rgba(0,0,0,.20) 25%,
        rgba(0,0,0,.48) 33%, rgba(0,0,0,.78) 42%, rgba(0,0,0,.90) 54%, rgba(0,0,0,.95) 100%);
  }
  /* grão fino: tira o ar de foto ampliada e amarra as cinco fotos num mesmo acabamento */
  .grao{
    position:absolute; inset:0; opacity:.07; mix-blend-mode:overlay; pointer-events:none;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>");
  }

  .marca{ position:absolute; top:${TOPO_SEGURO + 6}px; left:${MARGEM}px; width:640px }
  .marca{ color:#fff }
  .marca svg{ width:100%; height:auto; display:block; filter:drop-shadow(0 2px 18px rgba(0,0,0,.6)) }

  .bloco{ position:absolute; left:${MARGEM}px; right:${MARGEM}px; bottom:${BASE_SEGURA + 24}px }

  .sobre{
    font-weight:700; font-size:24px; line-height:1.3; letter-spacing:.34em;
    text-transform:uppercase; color:#fff; text-shadow:0 1px 16px rgba(0,0,0,.6);
  }
  .falta{
    font-family:"Anton",sans-serif; font-size:96px; line-height:1; text-transform:uppercase;
    letter-spacing:.015em; margin-top:22px;
  }
  .linha-num{ display:flex; align-items:baseline; gap:30px; margin-top:-14px }
  .num{
    font-family:"Anton",sans-serif; font-size:470px; line-height:1;
    letter-spacing:-.025em; font-variant-numeric:tabular-nums;
  }
  .dias{
    font-family:"Anton",sans-serif; font-size:124px; line-height:1; text-transform:uppercase;
    letter-spacing:.05em;
  }

  /* régua da série: trilho fino com os cinco marcos; o do dia aceso */
  .serie{ position:relative; display:flex; justify-content:space-between; margin:8px 0 40px }
  .serie::before{
    content:""; position:absolute; left:0; right:0; top:50%; height:2px;
    background:rgba(255,255,255,.22); transform:translateY(-50%);
  }
  .marco{
    position:relative; font-family:"Anton",sans-serif; font-size:30px; line-height:1;
    padding:10px 18px; border-radius:999px; background:#000; color:rgba(255,255,255,.42);
    border:1.5px solid rgba(255,255,255,.22); min-width:72px; text-align:center;
  }
  .marco.ativo{ background:#fff; color:#000; border-color:#fff }

  .rodape{ display:flex; align-items:center; justify-content:space-between; gap:24px }
  .pilulas{ display:flex; gap:14px; flex-wrap:wrap }
  .pilula{
    font-weight:600; font-size:24px; line-height:1.2; padding:14px 26px; border-radius:999px;
    border:1.5px solid rgba(255,255,255,.38); color:#fff; white-space:nowrap;
  }
  .patro{ text-align:right; flex:none }
  .patro .label{
    font-weight:600; font-size:16px; line-height:1.3; letter-spacing:.3em;
    text-transform:uppercase; color:rgba(255,255,255,.62);
  }
  .patro img{ width:200px; height:auto; display:block; margin:12px 0 0 auto }
</style>
</head>
<body>
  <div class="peca">
    <img class="foto" src="${esc(url(item.foto))}" alt="">
    <div class="veu"></div>
    <div class="grao"></div>
    <div class="marca" role="img" aria-label="Desbravando UTV">${svgDoRepo("logo-oficial.svg")}</div>

    <div class="bloco">
      <p class="sobre">Expedição ${esc(dados.expedicao)}</p>
      <p class="falta">${um ? "Falta" : "Faltam"}</p>
      <div class="linha-num">
        <span class="num">${n}</span>
        <span class="dias">${um ? "dia" : "dias"}</span>
      </div>
      <div class="serie">
        ${serie.map((x) => `<span class="marco${x === n ? " ativo" : ""}">${x}</span>`).join("")}
      </div>
      <div class="rodape">
        <div class="pilulas">
          ${(dados.pilulas ?? []).map((p) => `<span class="pilula">${esc(p)}</span>`).join("")}
        </div>
        <div class="patro">
          <p class="label">Patrocínio oficial</p>
          <img src="${esc(url(dados.patrocinioLogo))}" alt="Can-Am">
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export const meta = { nome: "contagem", px: [L, A], topoSeguro: TOPO_SEGURO, baseSegura: BASE_SEGURA };
