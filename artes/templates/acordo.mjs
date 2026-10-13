/**
 * ACORDO DE PARCERIA — documento RYZE que fecha a renegociação.
 *
 * Terceiro documento com o cromo RYZE (fechamento do mês, proposta, acordo). A folha, as
 * fontes e a capa vêm de ryze-doc.mjs; aqui ficam os blocos desta peça: o fluxo da demanda,
 * o catálogo de peças, as duas colunas de dentro/fora, as regras do preço e a implantação.
 *
 * A diferença de risco em relação aos outros dois: fechamento erra em dinheiro, proposta erra
 * em argumento, e ACORDO erra em ESCOPO. O que não estiver escrito aqui vai ser pedido como se
 * estivesse, daqui a dois meses, sem má-fé nenhuma dos dois lados. Por isso o auditor confere
 * que nenhum item aparece ao mesmo tempo no "dentro" e no "fora", e que o catálogo tem o
 * tamanho que o texto afirma.
 *
 * Pesos disponíveis em marca/ryze/fontes-ryze.css — respeitar, senão o Chrome fabrica negrito
 * sintético e o trecho sai do PDF como Type3:
 *   Space Grotesk 700 · Plus Jakarta Sans 400/600/700 · JetBrains Mono 400/500
 * Atenção especial em <th> e <strong>, que o navegador deixa em 700 por padrao: dentro deles,
 * JetBrains Mono (que so tem 400 e 500) fabrica negrito. Peso explicito sempre.
 *
 * NUNCA escrever acento grave dentro dos comentários do CSS abaixo: ele fecha o template
 * literal, o CSS vira código e a página sai quebrada. Já aconteceu três vezes.
 */

import { esc, real, cssRyze } from "./ryze-doc.mjs";

function cssAcordo() {
  return `
  .bloco{ break-inside:auto }
  .bloco h2, .bloco .cap{ break-after:avoid }
  .inteiro, .passo, .peca-cat, .regra-preco, .peso, .fim, tr{ break-inside:avoid }

  /* ---------- o fluxo da demanda ---------- */
  .passos{ display:grid; gap:0; margin-top:2mm; border-top:.25mm solid var(--line) }
  .passo{ display:flex; gap:5mm; align-items:flex-start;
    padding:4.6mm 0; border-bottom:.25mm solid var(--line) }
  .passo .n{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:3mm;
    color:var(--gold); width:8mm; flex:none; padding-top:.5mm }
  .passo .t{ flex:1; min-width:0 }
  .passo strong{ display:block; font-family:"Space Grotesk",sans-serif; font-weight:700;
    font-size:3.6mm; line-height:1.2 }
  .passo span{ display:block; font-size:2.9mm; line-height:1.5; color:var(--ink70); margin-top:1.4mm }

  /* ---------- catalogo ---------- */
  .catalogo{ display:grid; grid-template-columns:1fr 1fr; gap:0 9mm; margin-top:2mm;
    border-top:.25mm solid var(--line) }
  .peca-cat{ display:flex; gap:3.4mm; align-items:flex-start;
    padding:3.6mm 0; border-bottom:.25mm solid var(--line) }
  .peca-cat .n{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:2.5mm;
    color:var(--gold); width:5mm; flex:none; padding-top:.7mm }
  .peca-cat .t{ flex:1; min-width:0 }
  .peca-cat strong{ display:block; font-weight:700; font-size:3.1mm; line-height:1.2 }
  .peca-cat span{ display:block; font-size:2.7mm; line-height:1.45; color:var(--ink45);
    margin-top:.9mm }

  /* ---------- dentro e fora ---------- */
  .dentro ul{ list-style:none; display:grid; gap:2.6mm; margin-top:2mm }
  .dentro li{ font-size:3.05mm; line-height:1.5; color:var(--ink); padding-left:6mm;
    position:relative }
  .dentro li::before{ content:""; position:absolute; left:0; top:1.5mm; width:2.6mm; height:2.6mm;
    background:var(--gold); border-radius:.5mm }

  .fora{ width:100%; border-collapse:collapse; margin-top:2mm }
  .fora td{ padding:3.4mm 0; border-bottom:.25mm solid var(--line); vertical-align:top }
  .fora td.d strong{ display:block; font-weight:700; font-size:3.05mm }
  .fora td.d span{ display:block; font-size:2.7mm; line-height:1.5; color:var(--ink45);
    margin-top:1mm }
  .fora td.v{ text-align:right; white-space:nowrap; width:32mm; padding-left:4mm }
  .fora td.v b{ display:block; font-family:"Space Grotesk",sans-serif; font-weight:700;
    font-size:4.2mm }
  .fora td.v i{ display:block; font-style:normal; font-family:"JetBrains Mono",monospace;
    font-weight:400; font-size:2.2mm; letter-spacing:.4mm; text-transform:uppercase;
    color:var(--ink45); margin-top:.8mm }

  /* ---------- regras do preco ---------- */
  .regra-preco{ margin-top:4.5mm; background:var(--soft); border-left:.8mm solid var(--gold);
    border-radius:0 1.4mm 1.4mm 0; padding:4.4mm 5mm }
  .regra-preco h3{ font-size:3.8mm; margin-bottom:1.8mm }
  .regra-preco p{ font-size:2.95mm; line-height:1.55; color:var(--ink70) }
  .regra-preco .pq{ margin-top:2.4mm; padding-top:2.4mm; border-top:.25mm solid var(--line);
    font-size:2.75mm; color:var(--ink45) }
  .regra-preco .pq b{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:2.2mm;
    letter-spacing:.6mm; text-transform:uppercase; color:var(--ink45) }

  /* ---------- retrabalho: o que entra, o que nao ---------- */
  .retra{ width:100%; border-collapse:collapse; margin-top:2mm }
  .retra td{ padding:3.4mm 0; border-bottom:.25mm solid var(--line); vertical-align:top }
  .retra td.t{ width:46mm; padding-right:5mm; font-family:"Space Grotesk",sans-serif;
    font-weight:700; font-size:3.05mm; line-height:1.25 }
  .retra td.o{ font-size:2.9mm; line-height:1.5; color:var(--ink70) }

  /* ---------- implantacao ---------- */
  .etapas{ width:100%; border-collapse:collapse; margin-top:2mm }
  .etapas td{ padding:3.4mm 0; border-bottom:.25mm solid var(--line); vertical-align:top }
  .etapas td.q{ width:24mm; font-family:"JetBrains Mono",monospace; font-weight:400;
    font-size:2.4mm; letter-spacing:.5mm; text-transform:uppercase; color:var(--gold);
    padding-top:.6mm }
  .etapas td.d strong{ display:block; font-weight:700; font-size:3.05mm }
  .etapas td.d span{ display:block; font-size:2.75mm; line-height:1.5; color:var(--ink45);
    margin-top:1mm }

  .peso{ font-size:3.25mm; line-height:1.62; color:var(--ink); margin-top:5mm;
    padding-left:5mm; border-left:.7mm solid var(--gold) }`;
}

export function acordo(d) {
  /* Nada de número escrito no JSON de texto: o que é contagem sai daqui. */
  const nPecas = d.catalogo.pecas.length;
  if (nPecas !== d.catalogoQtd) {
    throw new Error(`o catálogo tem ${nPecas} peças mas o documento anuncia ${d.catalogoQtd}`);
  }

  const passo = (p) => `
      <div class="passo">
        <span class="n">${esc(p.n)}</span>
        <div class="t"><strong>${esc(p.nome)}</strong><span>${esc(p.oque)}</span></div>
      </div>`;

  const pecaCat = (p) => `
      <div class="peca-cat">
        <span class="n">${esc(p.n)}</span>
        <div class="t"><strong>${esc(p.nome)}</strong><span>${esc(p.oque)}</span></div>
      </div>`;

  const linhaFora = (i) => `
      <tr>
        <td class="d"><strong>${esc(i.nome)}</strong><span>${esc(i.detalhe)}</span></td>
        <td class="v">
          <b>${i.valor === null ? "—" : real(i.valor)}</b>
          <i>${esc(i.unidade)}</i>
        </td>
      </tr>`;

  const regraPreco = (r) => `
    <section class="regra-preco">
      <h3>${esc(r.nome)}</h3>
      <p>${esc(r.oque)}</p>
      <p class="pq"><b>Por quê</b> &nbsp; ${esc(r.porque)}</p>
    </section>`;

  const etapa = (e) => `
      <tr>
        <td class="q">${esc(e.quando)}</td>
        <td class="d"><strong>${esc(e.nome)}</strong><span>${esc(e.oque)}</span></td>
      </tr>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Acordo de parceria — ${esc(d.cliente)} · ${esc(d.emissao)}</title>
<link rel="stylesheet" href="../marca/ryze/fontes-ryze.css">
<style>
${cssRyze()}
${cssAcordo()}
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
      Vigência <em>${esc(d.vigencia)}</em>
    </div>
  </div>
  <span class="selo">${esc(d.carater)}</span>
  <h1>${d.capa.titulo}</h1>
  <p class="sub">${esc(d.capa.sub)}</p>
</div>

<div class="faixa">
  <div class="cel">
    <span class="k">Valor fixo</span>
    <div class="v">${real(d.valor)}<small> por mês</small></div>
  </div>
  <div class="cel">
    <span class="k">Pacote da expedição</span>
    <div class="v">${nPecas}<small> peças</small></div>
  </div>
  <div class="cel">
    <span class="k">Prazo do lote</span>
    <div class="v">${esc(d.prazoLote.split(" ")[0])}<small> dias úteis</small></div>
  </div>
  <div class="cel">
    <span class="k">Contrato</span>
    <div class="v">${d.prazoMeses}<small> ciclos</small></div>
  </div>
</div>

<div class="regras">
  <span class="rot">O que está sendo acordado</span>
  <ol>${d.regra.map((r) => `<li>${esc(r)}</li>`).join("\n    ")}</ol>
</div>

<div class="bloco">
  <h2>${esc(d.comoFunciona.titulo)}</h2>
  <p class="cap">${esc(d.comoFunciona.nota)}</p>
  <div class="passos">${d.comoFunciona.passos.map(passo).join("")}</div>
  <p class="peso">${esc(d.comoFunciona.argumento)}</p>
</div>

<div class="bloco">
  <h2>${esc(d.catalogo.titulo)}</h2>
  <p class="cap">${esc(d.catalogo.nota)}</p>
  <div class="catalogo">${d.catalogo.pecas.map(pecaCat).join("")}</div>
</div>

<div class="bloco inteiro dentro">
  <h2>${esc(d.dentro.titulo)}</h2>
  <ul>${d.dentro.itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
</div>

<div class="bloco">
  <h2>${esc(d.retrabalho.titulo)}</h2>
  <p class="cap">${esc(d.retrabalho.nota)}</p>
  <table class="retra">
    ${d.retrabalho.linhas
      .map((l) => `<tr><td class="t">${esc(l.tipo)}</td><td class="o">${esc(l.oque)}</td></tr>`)
      .join("")}
  </table>
  <p class="peso">${esc(d.retrabalho.argumento)}</p>
</div>

<div class="bloco">
  <h2>${esc(d.avulsos.titulo)}</h2>
  <p class="cap">${esc(d.avulsos.nota)}</p>
  <table class="fora">${d.avulsos.itens.map(linhaFora).join("")}</table>
</div>

<div class="bloco">
  <h2>${esc(d.fora.titulo)}</h2>
  <p class="cap">${esc(d.fora.nota)}</p>
  <table class="fora">${d.fora.itens.map(linhaFora).join("")}</table>
</div>

<div class="bloco">
  <h2>${esc(d.regrasDoPreco.titulo)}</h2>
  <p class="cap">${esc(d.regrasDoPreco.nota)}</p>
  ${d.regrasDoPreco.itens.map(regraPreco).join("")}
</div>

<div class="bloco">
  <h2>${esc(d.implantacao.titulo)}</h2>
  <p class="cap">${esc(d.implantacao.nota)}</p>
  <table class="etapas">${d.implantacao.etapas.map(etapa).join("")}</table>
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
  <span>Emitido em ${esc(d.emissao)}</span>
</footer>

</body>
</html>`;
}
