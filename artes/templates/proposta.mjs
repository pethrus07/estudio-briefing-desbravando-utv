/**
 * PROPOSTA COMERCIAL — documento RYZE de renegociação do plano.
 *
 * Segundo documento com o cromo RYZE (o primeiro é o fechamento do mês). A folha, as
 * fontes e a capa vêm de ryze-doc.mjs; aqui ficam só os blocos que existem nesta peça:
 * marcos de volume, tabela de horas, plano atual em duas colunas, cartões de opção,
 * comparativo e itens à parte.
 *
 * REGRA DE OURO, a mesma do fechamento: nenhum total vem do JSON. Horas, médias, hora
 * efetiva e saldos são somados aqui, e o auditar-proposta.py confere o PDF contra os
 * dados depois. Número de negociação escrito à mão é como se perde a conversa inteira:
 * basta o cliente somar a coluna e achar outro resultado.
 *
 * Pesos disponíveis em marca/ryze/fontes-ryze.css — respeitar, senão o Chrome fabrica
 * negrito sintético e o trecho sai do PDF como Type3:
 *   Space Grotesk 700 · Plus Jakarta Sans 400/600/700 · JetBrains Mono 400/500
 *
 * NUNCA escrever acento grave dentro dos comentários do CSS abaixo: ele fecha o template
 * literal, o CSS vira código e a página sai quebrada. Já aconteceu três vezes.
 */

import { esc, real, cssRyze } from "./ryze-doc.mjs";

/** Horas em português, uma casa decimal — "13,8 h". Nunca escrito à mão. */
const hora = (n) =>
  `${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h`;

/* 365 / 12 / 7 — a media de semanas num mes, para a frase do argumento nao chutar "quatro". */
const SEMANAS_NO_MES = 365 / 12 / 7;

const soma = (lista, campo) => lista.reduce((s, i) => s + (Number(i[campo]) || 0), 0);

/* Blocos que só existem nesta peça. Tudo em mm, como o resto da folha A4. */
function cssProposta() {
  return `
  .quebra{ break-before:page }

  /* O .bloco do cromo nao parte (break-inside:avoid) — regra boa para o fechamento, onde
     cada bloco e curto. Aqui os blocos sao longos e a regra joga meia folha fora a cada
     seccao. Entao o bloco flui, e quem fica inteiro e a unidade que nao faz sentido partida. */
  .bloco{ break-inside:auto }
  .bloco h2, .bloco .cap, .col h4, .horas th, .comp th{ break-after:avoid }
  .opcao, .kpi, .peso, .fim, tr{ break-inside:avoid }

  /* ---------- marcos de volume ---------- */
  .kpis{ display:grid; grid-template-columns:1fr 1fr; gap:0; margin-top:1mm;
    border-top:.25mm solid var(--line) }
  .kpi{ padding:5.5mm 6mm 5.5mm 0; border-bottom:.25mm solid var(--line) }
  .kpi:nth-child(odd){ padding-right:8mm; border-right:.25mm solid var(--line) }
  .kpi:nth-child(even){ padding-left:8mm }
  .kpi b{ font-family:"Space Grotesk",sans-serif; font-size:9mm; line-height:1; color:var(--black) }
  .kpi em{ font-family:"JetBrains Mono",monospace; font-style:normal; font-size:2.5mm;
    letter-spacing:.7mm; text-transform:uppercase; color:var(--gold); margin-left:2.2mm }
  .kpi p{ font-size:2.85mm; line-height:1.55; color:var(--ink70); margin-top:2mm }

  /* ---------- tabela de horas ---------- */
  .horas{ width:100%; border-collapse:collapse; margin-top:1mm }
  .horas th{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:2.3mm;
    letter-spacing:.6mm; text-transform:uppercase; color:var(--ink45); text-align:right;
    padding:0 0 2.5mm; border-bottom:.25mm solid var(--line) }
  .horas th:first-child{ text-align:left }
  .horas td{ font-size:3mm; padding:3.4mm 0; border-bottom:.25mm solid var(--line);
    text-align:right; vertical-align:top }
  .horas td:first-child{ text-align:left; font-weight:600 }
  .horas td.h{ font-family:"Space Grotesk",sans-serif; font-weight:700; white-space:nowrap }
  .horas th:nth-child(n+2), .horas td:nth-child(n+2){ width:23mm; padding-left:3mm }
  .horas td i{ display:block; font-style:normal; font-size:2.55mm; font-weight:400;
    color:var(--ink45); margin-top:1.1mm; line-height:1.5; max-width:88mm }
  .horas tr.tot td{ border-bottom:none; border-top:.5mm solid var(--ink); padding-top:3.2mm;
    font-family:"Space Grotesk",sans-serif; font-weight:700 }

  /* ---------- duas colunas: dentro e fora ---------- */
  .duas{ display:grid; grid-template-columns:1fr 1fr; gap:7mm; margin-top:1mm }
  .col h4{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:2.4mm;
    letter-spacing:.8mm; text-transform:uppercase; color:var(--ink45);
    padding-bottom:2.4mm; border-bottom:.25mm solid var(--line); margin-bottom:3.4mm }
  .col.sim h4{ color:var(--black) }
  .col ul{ list-style:none; display:grid; gap:2.2mm }
  .col li{ font-size:2.9mm; line-height:1.5; color:var(--ink70); padding-left:5mm; position:relative }
  .col.sim li::before{ content:""; position:absolute; left:0; top:1.5mm; width:2.2mm; height:2.2mm;
    background:var(--gold); border-radius:.4mm }
  .col.nao li::before{ content:""; position:absolute; left:0; top:2.4mm; width:2.6mm; height:.5mm;
    background:var(--ink45) }

  /* ---------- cartões de opção ---------- */
  .opcao{ margin-top:5mm; border:.3mm solid var(--line); border-radius:2mm;
    padding:6mm 6.5mm; break-inside:avoid }
  .opcao.alvo{ border:.5mm solid var(--gold); background:#fffdf6 }
  .opcao > header{ display:flex; align-items:flex-start; gap:5mm;
    padding-bottom:4mm; border-bottom:.25mm solid var(--line) }
  .opcao .id{ flex:1; min-width:0 }
  .opcao h3{ font-size:5.2mm; line-height:1.15 }
  .opcao .res{ font-size:2.9mm; color:var(--ink45); margin-top:1.2mm }
  .opcao .tag{ display:inline-block; margin-bottom:2.2mm;
    font-family:"JetBrains Mono",monospace; font-size:2.2mm; letter-spacing:.7mm;
    text-transform:uppercase; color:var(--black); background:var(--gold);
    padding:.9mm 2.4mm; border-radius:.8mm }
  .opcao .val{ text-align:right; flex:none }
  .opcao .val b{ display:block; font-family:"Space Grotesk",sans-serif; font-size:8.4mm; line-height:1 }
  .opcao .val span{ font-family:"JetBrains Mono",monospace; font-size:2.4mm;
    letter-spacing:.6mm; text-transform:uppercase; color:var(--ink45) }
  .opcao .quem{ font-size:2.95mm; line-height:1.6; color:var(--ink70); margin-top:4mm;
    padding-top:3.6mm; border-top:.25mm solid var(--line) }
  .opcao .duas{ margin-top:4.2mm }

  /* Cada opção tem seu acento, dentro da paleta RYZE: a mais enxuta em cinza, a do meio
     em roxo, a completa em dourado — e só a completa ganha fundo, borda grossa e tarja. */
  .opcao.neutra{ --acento:var(--ink45) }
  .opcao.roxo{ --acento:#6A28C9; border-color:#d8c6f2 }
  .opcao.ouro{ --acento:var(--gold); border:.6mm solid var(--gold); background:#fffdf6 }
  .opcao .val b{ color:var(--acento) }
  .opcao.neutra .val b{ color:var(--ink) }
  .opcao .tag{ background:var(--acento); color:#fff }
  .opcao.ouro .tag{ color:var(--black) }
  .opcao .col.sim li::before{ background:var(--acento) }
  .opcao::before{ content:""; display:block; height:1.2mm; background:var(--acento);
    border-radius:.6mm; width:14mm; margin-bottom:4.5mm }

  /* ---------- matriz: os tres formatos lado a lado ----------
     Os cartoes empilhados ocupavam a folha inteira cada um e se partiam entre paginas: o
     cliente nunca via os tres juntos, que e exatamente o que uma proposta de escolha precisa
     mostrar. Aqui a coluna e o formato, a linha e o item, e a cor vive na coluna. */
  .matriz{ width:100%; border-collapse:collapse; margin-top:2mm; table-layout:fixed }
  .matriz col.item{ width:64mm }
  .matriz col.op{ width:38mm }
  .matriz th, .matriz td{ padding:2.8mm 3mm; vertical-align:middle;
    border-bottom:.25mm solid var(--line) }
  /* <th> e negrito por padrao do navegador, e JetBrains Mono so existe em 400 e 500: dentro
     do cabecalho o Chrome FABRICAVA o negrito da tarja e do "por mes", e o trecho saia do PDF
     como Type3. Peso explicito em tudo que mora aqui dentro. */
  .matriz th{ vertical-align:bottom; border-bottom:.5mm solid var(--ink); padding-bottom:3.4mm;
    font-weight:400 }
  .matriz td:first-child, .matriz th:first-child{ padding-left:0; text-align:left }
  .matriz td.op, .matriz th.op{ text-align:center }

  .matriz .barra{ display:block; height:1.2mm; width:12mm; margin:0 auto 3mm;
    background:var(--acento); border-radius:.6mm }
  .matriz .tag{ display:inline-block; margin-bottom:2mm; font-family:"JetBrains Mono",monospace; font-weight:400;
    font-size:2mm; letter-spacing:.35mm; text-transform:uppercase; color:var(--black); white-space:nowrap;
    background:var(--gold); padding:.8mm 2mm; border-radius:.8mm }
  .matriz .nome{ display:block; font-family:"Space Grotesk",sans-serif; font-weight:700;
    font-size:3.5mm; line-height:1.2; color:var(--ink) }
  .matriz .preco{ display:block; font-family:"Space Grotesk",sans-serif; font-weight:700;
    font-size:7mm; line-height:1.1; margin-top:1.6mm; color:var(--acento) }
  .matriz .mes{ display:block; font-family:"JetBrains Mono",monospace; font-weight:400; font-size:2.1mm;
    letter-spacing:.5mm; text-transform:uppercase; color:var(--ink45); margin-top:.6mm }

  .matriz td:first-child{ font-size:2.9mm; line-height:1.45; color:var(--ink) }
  .matriz td.op{ font-size:2.7mm; color:var(--ink70); line-height:1.4 }
  .matriz .sim{ display:inline-block; width:2.8mm; height:2.8mm; border-radius:.5mm;
    background:var(--acento) }
  .matriz .nao{ display:inline-block; width:3.2mm; height:.5mm; background:var(--line) }
  .matriz tr.total td{ border-bottom:none; border-top:.5mm solid var(--ink); padding-top:3.4mm }
  .matriz tr.total td:first-child{ font-family:"Space Grotesk",sans-serif; font-weight:700;
    font-size:3.2mm }
  .matriz tr.total td.op{ font-family:"Space Grotesk",sans-serif; font-weight:700;
    font-size:4.6mm; color:var(--ink) }

  /* a coluna em destaque e pintada do topo ao rodape, por isso o fundo vai em toda celula */
  .matriz .c-base{ --acento:var(--ink45) }
  .matriz .c-roxo{ --acento:#6A28C9 }
  .matriz .c-ouro{ --acento:var(--gold); background:#fffdf6 }
  .matriz th.c-ouro{ box-shadow:inset 0 .6mm 0 var(--gold), inset .6mm 0 0 var(--gold),
    inset -.6mm 0 0 var(--gold) }
  .matriz td.c-ouro{ box-shadow:inset .6mm 0 0 var(--gold), inset -.6mm 0 0 var(--gold) }
  .matriz tr.total td.c-ouro{ box-shadow:inset .6mm 0 0 var(--gold), inset -.6mm 0 0 var(--gold),
    inset 0 -.6mm 0 var(--gold) }

  /* ---------- a linha de "para quem", embaixo de cada coluna ---------- */
  .paraquem{ display:grid; grid-template-columns:64mm 38mm 38mm 38mm; margin-top:4mm }
  .paraquem div{ padding:0 3mm }
  .paraquem div:first-child{ padding-left:0 }
  .paraquem p{ font-size:2.6mm; line-height:1.5; color:var(--ink70) }

  /* ---------- o que entrou na rotina ---------- */
  .rotina{ width:100%; border-collapse:collapse; margin-top:1mm }
  .rotina td{ padding:3.2mm 0; border-bottom:.25mm solid var(--line); vertical-align:top }
  .rotina td.q{ width:22mm; font-family:"JetBrains Mono",monospace; font-size:2.4mm;
    letter-spacing:.4mm; text-transform:uppercase; color:var(--gold); padding-top:4mm }
  .rotina td.d strong{ display:block; font-size:3.1mm; font-weight:700 }
  .rotina td.d span{ display:block; font-size:2.8mm; line-height:1.55; color:var(--ink70);
    margin-top:1mm }

  /* ---------- bloco que não pode partir no meio ---------- */
  .inteiro{ break-inside:avoid }

  /* ---------- comparativo ---------- */
  .comp{ width:100%; border-collapse:collapse; margin-top:1mm }
  .comp th{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:2.3mm;
    letter-spacing:.6mm; text-transform:uppercase; color:var(--ink45); text-align:right;
    padding:0 0 2.5mm; border-bottom:.25mm solid var(--line) }
  .comp th:first-child{ text-align:left }
  .comp td{ font-size:3mm; padding:3.6mm 0; border-bottom:.25mm solid var(--line); text-align:right }
  .comp td:first-child{ text-align:left; font-weight:600 }
  .comp td i{ display:block; font-style:normal; font-size:2.55mm; font-weight:400;
    color:var(--ink45); margin-top:1.1mm }
  .comp td.tt{ font-family:"Space Grotesk",sans-serif; font-weight:700; white-space:nowrap }
  .comp tr.ref td{ color:var(--ink45) }
  .comp tr.ref td.tt{ color:var(--ink) }
  .comp tr.alvo td{ background:#fffdf6 }
  .comp tr.alvo td:first-child{ box-shadow:inset .8mm 0 0 var(--gold); padding-left:3mm }

  /* ---------- itens à parte ---------- */
  .aparte{ width:100%; border-collapse:collapse; margin-top:1mm }
  .aparte td{ font-size:3mm; padding:3.4mm 0; border-bottom:.25mm solid var(--line);
    vertical-align:top }
  .aparte td:first-child{ font-weight:600 }
  .aparte td i{ display:block; font-style:normal; font-size:2.55mm; font-weight:400;
    color:var(--ink45); margin-top:1.1mm; line-height:1.5 }
  .aparte td.v{ text-align:right; white-space:nowrap; width:26mm;
    font-family:"Space Grotesk",sans-serif; font-weight:700 }

  /* ---------- parágrafo de argumento ---------- */
  .peso{ font-size:3.25mm; line-height:1.62; color:var(--ink); margin-top:5mm;
    padding-left:5mm; border-left:.7mm solid var(--gold) }
  .nota{ font-size:2.8mm; line-height:1.55; color:var(--ink45); margin-top:4mm }`;
}

export function proposta(d) {
  /* ---------- tudo que é número sai daqui, nunca do JSON ---------- */
  /* O ciclo versionado nas duas frentes dá o ritmo de produção de arte (horas por arte).
     É esse ritmo que reconstrói o tempo das artes do ciclo anterior ao repositório — a
     reconstrução é CALCULADA, não escrita: número de negociação digitado à mão é número
     que ninguém consegue defender quando o cliente pergunta de onde saiu. */
  const c = d.horas.ciclos;
  const medido = c.find((x) => x.horasArtes);
  if (!medido) throw new Error("nenhum ciclo tem horasArtes — sem ele não há ritmo para reconstruir");
  const ritmo = medido.horasArtes / medido.artes;
  for (const x of c) x.reconstruidas = x.reconstruir ? x.artes * ritmo : 0;

  const apuradas = soma(c, "apuradas");
  const reconstruidas = soma(c, "reconstruidas");
  const totalHoras = apuradas + reconstruidas;
  const mediaHoras = totalHoras / c.length;
  const faturado = soma(c, "faturado");
  const mediaFaturado = faturado / c.length;
  const horaEfetiva = faturado / totalHoras;
  const baseHoje = d.planoAtual.valorHoje + d.planoAtual.token;
  const hojeTotal = d.comparativo.hoje.fixo + d.comparativo.hoje.variavel;

  const li = (t) => `<li>${esc(t)}</li>`;

  const duasColunas = (dentro, fora, rotuloDentro, rotuloFora) => `
      <div class="duas">
        <div class="col sim">
          <h4>${esc(rotuloDentro)}</h4>
          <ul>${dentro.map(li).join("")}</ul>
        </div>
        <div class="col nao">
          <h4>${esc(rotuloFora)}</h4>
          <ul>${fora.map(li).join("")}</ul>
        </div>
      </div>`;

  /* A cor de cada coluna da matriz, pela chave da opção — a mesma do cartão de antes. */
  const CLASSE = { neutra: "c-base", roxo: "c-roxo", ouro: "c-ouro" };
  const classeDa = (o) => CLASSE[o.cor] ?? "c-base";

  /* "sim" e "nao" viram marca; qualquer outro texto sai como está (ex.: "R$ 300 o pacote"). */
  const celulaMatriz = (valor) =>
    valor === "sim"
      ? `<span class="sim"></span>`
      : valor === "nao"
        ? `<span class="nao"></span>`
        : esc(valor);

  const cabecaMatriz = (o) => `
        <th class="op ${classeDa(o)}">
          <span class="barra"></span>
          ${o.destaque ? `<span class="tag">Pacote completo</span>` : ""}
          <span class="nome">${esc(o.nome)}</span>
          <span class="preco">${real(o.preco)}</span>
          <span class="mes">${esc(o.unidade)}</span>
        </th>`;

  const linhaMatriz = (l) => `
      <tr>
        <td>${esc(l.item)}</td>
        ${d.opcoes
          .map((o) => `<td class="op ${classeDa(o)}">${celulaMatriz(l.v[o.chave])}</td>`)
          .join("")}
      </tr>`;

  const linhaHora = (x) => `
      <tr>
        <td>${esc(x.ciclo)}<i>${esc(x.nota)}</i></td>
        <td class="h">${hora(x.apuradas)}</td>
        <td class="h">${x.reconstruidas ? hora(x.reconstruidas) : "—"}</td>
        <td class="h">${hora(x.apuradas + x.reconstruidas)}</td>
        <td class="h">${real(x.faturado)}</td>
      </tr>`;

  const linhaComp = (l) => `
      <tr class="${l.opcao === d.opcoes.find((o) => o.destaque)?.nome ? "alvo" : ""}">
        <td>${esc(l.opcao)}<i>${esc(l.nota)}</i></td>
        <td class="tt">${real(l.fixo)}</td>
        <td class="tt">${l.variavel ? real(l.variavel) : "—"}</td>
        <td class="tt">${real(l.fixo + l.variavel)}</td>
      </tr>`;

  const linhaParte = (i) => `
      <tr>
        <td>${esc(i.nome)}<i>${esc(i.detalhe)} · ${esc(i.obs)}</i></td>
        <td class="v">${i.saldo === null ? esc(i.unidade) : real(i.saldo)}</td>
      </tr>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Proposta comercial — ${esc(d.cliente)} · ${esc(d.emissao)}</title>
<link rel="stylesheet" href="../marca/ryze/fontes-ryze.css">
<style>
${cssRyze()}
${cssProposta()}
</style>
</head>
<body>

<div class="capa">
  <div class="topo">
    <div class="marca">
      <img src="../marca/ryze/ryze-symbol-gold-transparent.svg" alt="">
      <div><b>RYZE</b><span>${esc(d.plano)}</span></div>
    </div>
    <div class="meta">
      Cliente <em>${esc(d.cliente)}</em><br>
      Aos cuidados de <em>${esc(d.interlocutor)}</em><br>
      Emissão <em>${esc(d.emissao)}</em><br>
      Validade <em>${esc(d.validade)}</em>
    </div>
  </div>
  <span class="selo">${esc(d.carater)}</span>
  <h1>${d.capa.titulo}</h1>
  <p class="sub">${esc(d.capa.sub)}</p>
</div>

<div class="faixa">
  <div class="cel">
    <span class="k">Trabalho no período</span>
    <div class="v">${hora(totalHoras)}<small> em 2 ciclos</small></div>
  </div>
  <div class="cel">
    <span class="k">Média por mês</span>
    <div class="v">${hora(mediaHoras)}<small> · ${real(Math.round(mediaFaturado))}</small></div>
  </div>
  <div class="cel">
    <span class="k">Hora efetiva</span>
    <div class="v">${real(Math.round(horaEfetiva))}<small> / piso ${real(d.horas.piso)}</small></div>
  </div>
</div>

<div class="regras">
  <span class="rot">Como esta proposta foi montada</span>
  <ol>${d.regra.map((r) => `<li>${esc(r)}</li>`).join("\n    ")}</ol>
</div>

<div class="bloco">
  <h2>${esc(d.maturidade.titulo)}</h2>
  <p class="cap">${esc(d.maturidade.nota)}</p>
  <div class="kpis">
    ${d.maturidade.marcos
      .map((m) => `<div class="kpi"><b>${esc(m.n)}</b><em>${esc(m.u)}</em><p>${esc(m.o)}</p></div>`)
      .join("\n    ")}
  </div>
  <p class="peso">${esc(d.maturidade.argumento)}</p>
</div>

<div class="bloco">
  <h2>${esc(d.horas.titulo)}</h2>
  <p class="cap">${esc(d.horas.metodo)} Ritmo medido: ${ritmo.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h por arte.</p>
  <table class="horas">
    <tr>
      <th>Ciclo</th><th>Apurado</th><th>Reconstruído</th><th>Total</th><th>Faturado</th>
    </tr>
    ${c.map(linhaHora).join("")}
    <tr class="tot">
      <td>${c.length} ciclos · média de ${hora(mediaHoras)} por mês</td>
      <td class="h">${hora(apuradas)}</td>
      <td class="h">${hora(reconstruidas)}</td>
      <td class="h">${hora(totalHoras)}</td>
      <td class="h">${real(faturado)}</td>
    </tr>
  </table>

  <div class="duas" style="margin-top:7mm">
    <div class="col nao">
      <h4>Não entrou em nenhuma linha acima</h4>
      <ul>${d.horas.foraDaConta.map(li).join("")}</ul>
    </div>
    <div class="col sim">
      <h4>O que a conta mostra</h4>
      <ul>
        <li>${esc(hora(mediaHoras))} por mês, dois ciclos seguidos</li>
        <li>${real(Math.round(horaEfetiva))} por hora efetiva, contra um piso de ${real(d.horas.piso)}</li>
        <li>${esc(hora(apuradas))} estão no registro de versão e podem ser conferidas uma a uma</li>
        <li>${real(Math.round(mediaFaturado))} foi a média mensal faturada da parceria, fora as parcelas de projeto</li>
      </ul>
    </div>
  </div>

  <p class="peso">${esc(
    d.horas.argumento
      .replace("{media}", hora(mediaHoras))
      .replace("{semana}", hora(mediaHoras / SEMANAS_NO_MES))
  )}</p>
  <div class="acomp" style="margin-top:6mm">
    <span class="rot">${esc(d.horas.rebaixamento.titulo)}</span>
    <ul>${d.horas.rebaixamento.itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    <p class="arg" style="margin-top:3.4mm">${esc(d.horas.rebaixamento.fecho)}
      ${esc(d.horas.fecho)}</p>
  </div>
</div>

<div class="bloco inteiro">
  <h2>${esc(d.planoAtual.titulo)}</h2>
  <p class="cap">${esc(d.planoAtual.nota)} Mensalidade de ${real(d.planoAtual.valorHoje)}
    mais ${real(d.planoAtual.token)} de token — ${real(baseHoje)} fixos por mês.</p>
  ${duasColunas(d.planoAtual.incluso, d.planoAtual.fora, "Dentro da mensalidade hoje", "Fora dela hoje")}
  <p class="peso">${esc(d.planoAtual.argumento)}</p>
</div>

<div class="bloco">
  <h2>${esc(d.entrouNaRotina.titulo)}</h2>
  <p class="cap">${esc(d.entrouNaRotina.nota)}</p>
  <table class="rotina">
    ${d.entrouNaRotina.itens
      .map(
        (i) => `<tr>
      <td class="q">${esc(i.quando)}</td>
      <td class="d"><strong>${esc(i.nome)}</strong><span>${esc(i.oque)}</span></td>
    </tr>`
      )
      .join("")}
  </table>
  <p class="peso">${esc(d.entrouNaRotina.argumento)}</p>
</div>

<div class="bloco inteiro">
  <h2>${esc(d.matriz.titulo)}</h2>
  <p class="cap">${esc(d.matriz.nota)}</p>
  <table class="matriz">
    <colgroup>
      <col class="item">${d.opcoes.map(() => `<col class="op">`).join("")}
    </colgroup>
    <tr><th></th>${d.opcoes.map(cabecaMatriz).join("")}</tr>
    ${d.matriz.linhas.map(linhaMatriz).join("")}
    <tr class="total">
      <td>Total no mês típico medido</td>
      ${d.opcoes
        .map((o) => {
          const l = d.comparativo.linhas.find((x) => x.opcao === o.nome);
          if (!l) throw new Error(`a opção "${o.nome}" não tem linha no comparativo`);
          return `<td class="op ${classeDa(o)}">${real(l.fixo + l.variavel)}</td>`;
        })
        .join("")}
    </tr>
  </table>
  <div class="paraquem">
    <div></div>
    ${d.opcoes.map((o) => `<div><p>${esc(o.curto)}</p></div>`).join("")}
  </div>
</div>

<div class="bloco">
  <h2>${esc(d.comparativo.titulo)}</h2>
  <p class="cap">${esc(d.comparativo.nota)}</p>
  <table class="comp">
    <tr><th>Formato</th><th>Fixo</th><th>Variável</th><th>Total do mês</th></tr>
    <tr class="ref">
      <td>${esc(d.comparativo.hoje.rotulo)}<i>${esc(d.comparativo.hoje.nota)}</i></td>
      <td class="tt">${real(d.comparativo.hoje.fixo)}</td>
      <td class="tt">${real(d.comparativo.hoje.variavel)}</td>
      <td class="tt">${real(hojeTotal)}</td>
    </tr>
    ${d.comparativo.linhas.map(linhaComp).join("")}
  </table>
  <p class="peso">${esc(d.comparativo.argumento)}</p>
</div>

<div class="bloco">
  <h2>${esc(d.aParte.titulo)}</h2>
  <p class="cap">${esc(d.aParte.nota)}</p>
  <table class="aparte">
    ${d.aParte.itens.map(linhaParte).join("")}
  </table>
</div>

<div class="fim">
  <h2>${esc(d.encerramento.titulo)}</h2>
  <p>${esc(d.encerramento.texto)}</p>
  <div class="grande">
    <b>${real(d.encerramento.numero)}</b>
    <span>${esc(d.encerramento.legenda)}</span>
  </div>
</div>

<footer>
  <span>RYZE · ${esc(d.cliente)}</span>
  <span>${esc(d.vigencia)}</span>
  <span>Proposta válida até ${esc(d.validade)}</span>
</footer>

</body>
</html>`;
}
