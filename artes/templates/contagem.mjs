/**
 * CONTAGEM REGRESSIVA — story 1080 × 1920, uma arte por número.
 *
 * Foto de expedição sangrando a tela inteira e colorida (regra da marca: foto de expedição
 * entra com a cor dela; só peça de marca/patrocínio dessatura). O número é o herói, em
 * Anton; o resto é Archivo pequeno. Logo no topo, patrocínio oficial no fecho.
 *
 * ZONAS DO INSTAGRAM: os ~250 px de cima (barra de progresso, perfil) e os ~340 px de
 * baixo (campo de resposta) ficam cobertos no app. Nada de texto ali: a logo começa em
 * 250 e o bloco termina antes de 1580. O fundo continua sangrando por baixo.
 *
 * Regra herdada do comum: nenhum texto com line-height abaixo de 1. O Anton tem a caixa
 * mais curta que o glifo; o aperto óptico entre "FALTAM" e o número se faz com margin.
 */
import { esc, svgDoRepo } from "./comum.mjs";

const L = 1080;
const A = 1920;
const TOPO_SEGURO = 250;
const BASE_SEGURA = 340;

export function contagem(dados, n, opcoes = {}) {
  const item = dados.numeros.find((x) => x.n === n);
  if (!item) throw new Error(`número ${n} não está nos dados`);
  const um = n === 1;
  const foto = opcoes.resolverFoto ? opcoes.resolverFoto(item.foto) : item.foto;

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
  /* véu: escurece o topo só o bastante para a logo, deixa o meio respirar com a cor da
     foto e fecha em preto quase sólido onde mora o número. */
  .veu{
    position:absolute; inset:0;
    background:linear-gradient(180deg,
      rgba(0,0,0,.66) 0%, rgba(0,0,0,.30) 18%, rgba(0,0,0,.04) 27%,
      rgba(0,0,0,.56) 37%, rgba(0,0,0,.82) 46%, rgba(0,0,0,.90) 60%, rgba(0,0,0,.94) 100%);
  }

  .marca{ position:absolute; top:${TOPO_SEGURO}px; left:84px; width:190px; color:#fff }
  .marca svg{ width:100%; height:auto; display:block }

  .bloco{
    position:absolute; left:84px; right:84px; bottom:${BASE_SEGURA + 30}px;
  }
  .sobre{
    font-weight:700; font-size:26px; line-height:1.3; letter-spacing:.3em;
    text-transform:uppercase; color:rgba(255,255,255,.9);
  }
  .falta{
    font-family:"Anton",sans-serif; font-size:92px; line-height:1; text-transform:uppercase;
    letter-spacing:.02em; margin-top:26px;
  }
  .linha-num{ display:flex; align-items:baseline; gap:34px; margin-top:-10px }
  .num{
    font-family:"Anton",sans-serif; font-size:${dados.corpoNumero ?? 440}px; line-height:1;
    letter-spacing:-.02em; font-variant-numeric:tabular-nums;
  }
  .dias{
    font-family:"Anton",sans-serif; font-size:118px; line-height:1; text-transform:uppercase;
    letter-spacing:.06em;
  }
  .fio{ height:2px; background:rgba(255,255,255,.28); margin:6px 0 30px }
  .rodape{ display:flex; align-items:flex-end; justify-content:space-between; gap:40px }
  .data{ font-family:"Anton",sans-serif; font-size:50px; line-height:1.05; letter-spacing:.02em }
  .rota{ font-size:28px; line-height:1.35; color:rgba(255,255,255,.82); margin-top:10px }
  .patro{ text-align:right; flex:none }
  .patro .label{
    font-weight:600; font-size:18px; line-height:1.3; letter-spacing:.3em;
    text-transform:uppercase; color:rgba(255,255,255,.62);
  }
  .patro img{ width:230px; height:auto; display:block; margin:12px 0 0 auto }
  .credito{
    position:absolute; right:30px; top:${TOPO_SEGURO + 10}px; font-size:16px;
    color:rgba(255,255,255,.7);
  }
</style>
</head>
<body>
  <div class="peca">
    <img class="foto" src="${esc(foto)}" alt="">
    <div class="veu"></div>
    <div class="marca">${svgDoRepo("logo-montanha.svg")}</div>
    ${item.credito ? `<p class="credito">© ${esc(item.credito)}</p>` : ""}

    <div class="bloco">
      <p class="sobre">Expedição ${esc(dados.expedicao)}</p>
      <p class="falta">${um ? "Falta" : "Faltam"}</p>
      <div class="linha-num">
        <span class="num">${n}</span>
        <span class="dias">${um ? "dia" : "dias"}</span>
      </div>
      <div class="fio"></div>
      <div class="rodape">
        <div>
          <p class="data">${esc(dados.periodo)}</p>
          <p class="rota">${esc(dados.rota)}</p>
        </div>
        <div class="patro">
          <p class="label">Patrocínio oficial</p>
          <img src="${esc(dados.patrocinioLogo)}" alt="Can-Am">
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export const meta = { nome: "contagem", px: [L, A], topoSeguro: TOPO_SEGURO, baseSegura: BASE_SEGURA };
