/**
 * FECHAMENTO DO MÊS — documento RYZE de pré-aprovação.
 *
 * A4 de 210 × 296 mm (não 297: 297 arredonda para 842,4 pt e empurra o rodapé para
 * uma folha em branco). Identidade RYZE — quem fala aqui é a RYZE com o cliente,
 * não a marca do cliente.
 *
 * REGRA DE OURO: nenhum total vem do JSON. Tudo que é soma é calculado aqui, e o
 * `auditar-fechamento.py` confere o PDF contra os dados depois. Número escrito à
 * mão em documento de cobrança é como erro entra sem ninguém ver.
 *
 * Pesos disponíveis em marca/ryze/fontes-ryze.css — respeitar, senão o Chrome
 * fabrica negrito sintético e o trecho sai como Type3:
 *   Space Grotesk 700 · Plus Jakarta Sans 400/600/700 · JetBrains Mono 400/500
 */

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const real = (n) => `R$ ${Number(n).toLocaleString("pt-BR")}`;
const soma = (lista, campo = "valor") => lista.reduce((s, i) => s + (i[campo] ?? 0), 0);

export function fechamento(d) {
  /* ---------- tudo que é número sai daqui, nunca do JSON ---------- */
  const totalBase = soma(d.baseFixa.itens);
  const totalArtes = soma(d.pecas);
  const nArtes = d.pecas.reduce((s, p) => s + p.artes.length, 0);
  const totalAjustes = soma(d.ajustes.itens);
  const totalProjetos = soma(d.projetos.itens);
  const totalModulo = d.modulo.valor;
  /* Bloco opcional: escopo novo pedido em cima de um sistema já entregue. Entra separado
     dos formulários de propósito — campo novo com tipo novo no módulo não é "mais um
     formulário", e somar os dois numa linha faria a conta não fechar na cara de quem lê. */
  const totalEscopo = d.escopo?.valor ?? 0;
  const total = totalBase + totalArtes + totalAjustes + totalModulo + totalEscopo + totalProjetos;
  const acompanhados =
    d.pecas.reduce((s, p) => s + (p.acompanha?.length ?? 0), 0) +
    (d.descartado?.itens?.length ?? 0);

  const linha = (nome, nota, valor) => `
      <tr>
        <td class="n">${esc(nome)}${nota ? `<i>${esc(nota)}</i>` : ""}</td>
        <td class="v">${real(valor)}</td>
      </tr>`;

  const peca = (p, i) => `
    <section class="peca">
      <header>
        <span class="num">${String(i + 1).padStart(2, "0")}</span>
        <div class="cab">
          <h3>${esc(p.nome)}</h3>
          <p class="oque">${esc(p.oque)}</p>
        </div>
        <div class="preco">
          <b>${real(p.valor)}</b>
          <span>${p.artes.length} ${p.artes.length === 1 ? "arte" : "artes"}</span>
        </div>
      </header>
      <p class="spec">${esc(p.spec)}</p>
      <ul class="artes">
        ${p.artes.map((a) => `<li>${esc(a)}</li>`).join("\n        ")}
      </ul>
      ${p.destaque ? `<p class="destaque">${esc(p.destaque)}</p>` : ""}
      <p class="arg">${esc(p.argumento)}</p>
      ${
        p.acompanha?.length
          ? `<div class="acomp"><span class="rot">Entregue sem cobrança</span>
        <ul>${p.acompanha.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>`
          : ""
      }
    </section>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Fechamento do mês — ${esc(d.cliente)} · ${esc(d.competencia)}</title>
<link rel="stylesheet" href="../marca/ryze/fontes-ryze.css">
<style>
  :root{
    --gold:#FFB700; --black:#0D0D0D; --ink:#16181d; --ink70:#55596b;
    --ink45:#8b8fa3; --line:#e4e6ee; --soft:#f7f8fb;
  }
  *{ margin:0; padding:0; box-sizing:border-box }
  @page{ size:210mm 296mm; margin:0 }
  body{
    font-family:"Plus Jakarta Sans",sans-serif; font-weight:400; color:var(--ink);
    background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  h1,h2,h3,h4{ font-family:"Space Grotesk",sans-serif; font-weight:700 }
  strong,b{ font-weight:700 }

  /* ---------- capa ---------- */
  .capa{ background:var(--black); color:#fff; padding:14mm 16mm 12mm }
  .topo{ display:flex; align-items:flex-start; justify-content:space-between }
  .marca{ display:flex; align-items:center; gap:3.4mm }
  .marca img{ width:8mm; height:auto; display:block }
  .marca b{ font-family:"Space Grotesk",sans-serif; font-size:5.2mm; letter-spacing:1.1mm }
  .marca span{ display:block; font-size:2.2mm; letter-spacing:.9mm; color:var(--gold);
    text-transform:uppercase; margin-top:.6mm; font-weight:400 }
  .meta{ text-align:right; font-family:"JetBrains Mono",monospace; font-weight:400;
    font-size:2.5mm; line-height:1.75; color:#9aa0b4 }
  .meta em{ color:var(--gold); font-style:normal }
  .selo{ display:inline-block; margin-top:7mm; border:.35mm solid var(--gold);
    color:var(--gold); font-family:"JetBrains Mono",monospace; font-size:2.5mm;
    letter-spacing:.7mm; text-transform:uppercase; padding:1.4mm 3.4mm; border-radius:1mm }
  h1{ font-size:11.5mm; line-height:1.06; margin-top:5mm; color:#fff }
  h1 u{ color:var(--gold); text-decoration:none }
  .sub{ margin-top:4mm; font-size:3.3mm; line-height:1.6; color:#c9cdda; max-width:150mm }

  /* ---------- faixa de total ---------- */
  .faixa{ display:flex; border-bottom:.3mm solid var(--line) }
  .cel{ flex:1; padding:7mm 6mm; border-right:.3mm solid var(--line) }
  .cel:last-child{ border-right:none; background:var(--soft) }
  .cel .k{ font-family:"JetBrains Mono",monospace; font-size:2.3mm; letter-spacing:.8mm;
    text-transform:uppercase; color:var(--ink45) }
  .cel .v{ margin-top:2.4mm; font-family:"Space Grotesk",sans-serif; font-weight:700; font-size:6.6mm }
  .cel .v small{ font-size:3.4mm; color:var(--ink45); font-weight:400;
    font-family:"Plus Jakarta Sans",sans-serif }

  /* ---------- regras ---------- */
  .regras{ padding:9mm 16mm 0 }
  .rot{ display:block; font-family:"JetBrains Mono",monospace; font-size:2.4mm;
    letter-spacing:.9mm; text-transform:uppercase; color:var(--ink45); margin-bottom:3mm }
  .regras ol{ list-style:none; display:grid; gap:2.8mm }
  .regras li{ font-size:3.05mm; line-height:1.58; color:var(--ink70); padding-left:6mm; position:relative }
  .regras li::before{ content:""; position:absolute; left:0; top:1.7mm; width:2.4mm; height:2.4mm;
    background:var(--gold); border-radius:.4mm }

  /* ---------- blocos de tabela ---------- */
  .bloco{ padding:9mm 16mm 0; break-inside:avoid }
  .bloco h2{ font-size:5mm; margin-bottom:1.5mm }
  .bloco .cap{ font-size:2.9mm; color:var(--ink45); margin-bottom:4mm }
  table{ width:100%; border-collapse:collapse }
  td{ padding:2.8mm 0; border-bottom:.25mm solid var(--line); vertical-align:top; font-size:3.05mm }
  td.n{ color:var(--ink) }
  td.n i{ display:block; font-style:normal; font-size:2.6mm; color:var(--ink45); margin-top:.8mm }
  td.v{ text-align:right; white-space:nowrap; font-family:"Space Grotesk",sans-serif;
    font-weight:700; width:26mm }
  tr.tot td{ border-bottom:none; border-top:.5mm solid var(--ink); padding-top:3mm }
  tr.tot td.n{ font-family:"Space Grotesk",sans-serif; font-weight:700 }

  /* ---------- peças ---------- */
  .peca{ padding:6.5mm 0; border-bottom:.25mm solid var(--line); break-inside:avoid }
  .peca:last-child{ border-bottom:none }
  .peca header{ display:flex; gap:4mm; align-items:flex-start }
  .num{ font-family:"JetBrains Mono",monospace; font-weight:500; font-size:2.7mm;
    color:var(--gold); padding-top:1mm; width:6mm; flex:none }
  .cab{ flex:1; min-width:0 }
  .peca h3{ font-size:4.5mm }
  .oque{ font-size:2.9mm; color:var(--ink45); margin-top:.9mm }
  .preco{ text-align:right; flex:none }
  .preco b{ font-family:"Space Grotesk",sans-serif; font-size:5.4mm; display:block }
  .preco span{ font-family:"JetBrains Mono",monospace; font-size:2.4mm; color:var(--ink45) }
  .spec{ font-family:"JetBrains Mono",monospace; font-size:2.5mm; line-height:1.6;
    color:var(--ink70); background:var(--soft); border-left:.7mm solid var(--gold);
    padding:2.2mm 3mm; margin:3.4mm 0 3mm }
  .artes{ list-style:none; display:grid; gap:1.4mm; margin-bottom:3mm }
  .artes li{ font-size:2.95mm; color:var(--ink); padding-left:5mm; position:relative }
  .artes li::before{ content:""; position:absolute; left:.6mm; top:1.5mm; width:1.6mm; height:1.6mm;
    border:.3mm solid var(--ink45); border-radius:50% }
  .destaque{ font-size:2.85mm; color:var(--black); background:#fff5dc;
    border:.25mm solid #f0d79a; border-radius:1mm; padding:2mm 3mm; margin-bottom:3mm }
  .arg{ font-size:3.05mm; line-height:1.62; color:var(--ink70) }
  .acomp{ margin-top:3.4mm; background:var(--soft); border-radius:1.4mm; padding:3mm 3.6mm }
  .acomp .rot{ margin-bottom:2mm }
  .acomp ul{ list-style:none; display:grid; gap:1.2mm }
  .acomp li{ font-size:2.8mm; color:var(--ink70); padding-left:4mm; position:relative }
  .acomp li::before{ content:"—"; position:absolute; left:0; color:var(--ink45) }

  /* ---------- encerramento ---------- */
  .fim{ margin:10mm 16mm 0; background:var(--black); color:#fff; border-radius:2mm; padding:9mm 10mm }
  .fim h2{ color:#fff; font-size:5mm; margin-bottom:3mm }
  .fim p{ font-size:3.05mm; line-height:1.62; color:#c9cdda; max-width:150mm }
  .fim .grande{ margin-top:6mm; display:flex; align-items:baseline; gap:3mm }
  .fim .grande b{ font-family:"Space Grotesk",sans-serif; font-size:11mm; color:var(--gold) }
  .fim .grande span{ font-family:"JetBrains Mono",monospace; font-size:2.6mm;
    letter-spacing:.8mm; text-transform:uppercase; color:#9aa0b4 }
  footer{ margin:8mm 16mm 0; padding-top:4mm; border-top:.25mm solid var(--line);
    display:flex; justify-content:space-between; font-family:"JetBrains Mono",monospace;
    font-size:2.3mm; letter-spacing:.5mm; text-transform:uppercase; color:var(--ink45) }
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
      Competência <em>${esc(d.competencia)}</em><br>
      Emissão <em>${esc(d.emissao)}</em><br>
      Vencimento <em>${esc(d.vencimento)}</em>
    </div>
  </div>
  <span class="selo">${esc(d.carater)}</span>
  <h1>Fechamento<br>do <u>mês</u>.</h1>
  <p class="sub">Tudo que foi entregue no ciclo, peça por peça, com a especificação técnica
    e o valor de cada uma — para você conferir e aprovar antes de virar cobrança.</p>
</div>

<div class="faixa">
  <div class="cel"><span class="k">Peças</span><div class="v">${d.pecas.length}<small> em ${nArtes} artes</small></div></div>
  <div class="cel"><span class="k">Sem cobrança</span><div class="v">${acompanhados}<small> entregas</small></div></div>
  <div class="cel"><span class="k">Total do ciclo</span><div class="v">${real(total)}</div></div>
</div>

<div class="regras">
  <span class="rot">Como este fechamento é contado</span>
  <ol>${d.regra.map((r) => `<li>${esc(r)}</li>`).join("\n    ")}</ol>
</div>

<div class="bloco">
  <h2>${esc(d.baseFixa.titulo)}</h2>
  <table>
    ${d.baseFixa.itens.map((i) => linha(i.nome, i.nota, i.valor)).join("")}
    <tr class="tot"><td class="n">Base mensal</td><td class="v">${real(totalBase)}</td></tr>
  </table>
</div>

<div class="bloco">
  <h2>Peças gráficas</h2>
  <p class="cap">Preço fechado por peça. O número ao lado do valor é quantos arquivos
    finais distintos aquele valor cobre.</p>
  ${d.pecas.map(peca).join("")}
  <table style="margin-top:5mm">
    <tr class="tot"><td class="n">${d.pecas.length} peças · ${nArtes} artes</td><td class="v">${real(totalArtes)}</td></tr>
  </table>
</div>

<div class="bloco">
  <h2>${esc(d.ajustes.titulo)}</h2>
  <p class="cap">${esc(d.ajustes.nota)}</p>
  <table>
    ${d.ajustes.itens.map((i) => linha(i.nome, null, i.valor)).join("")}
    <tr class="tot"><td class="n">${d.ajustes.itens.length} rodadas a ${real(d.ajustes.valorUnitario)}</td><td class="v">${real(totalAjustes)}</td></tr>
  </table>
</div>

<div class="bloco">
  <h2>${esc(d.modulo.titulo)}</h2>
  <div class="peca">
    <header>
      <span class="num">01</span>
      <div class="cab"><h3>${esc(d.modulo.nome)}</h3><p class="oque">${esc(d.modulo.oque)}</p></div>
      <div class="preco"><b>${real(totalModulo)}</b><span>uma vez</span></div>
    </header>
    <p class="spec">${esc(d.modulo.spec)}</p>
    <p class="arg">${esc(d.modulo.argumento)}</p>
  </div>
</div>
${
  d.escopo
    ? `
<div class="bloco">
  <h2>${esc(d.escopo.titulo)}</h2>
  <div class="peca">
    <header>
      <span class="num">01</span>
      <div class="cab"><h3>${esc(d.escopo.nome)}</h3><p class="oque">${esc(d.escopo.oque)}</p></div>
      <div class="preco"><b>${real(totalEscopo)}</b><span>uma vez</span></div>
    </header>
    <p class="spec">${esc(d.escopo.spec)}</p>
    <p class="arg">${esc(d.escopo.argumento)}</p>
  </div>
</div>
`
    : ""
}

<div class="bloco">
  <h2>${esc(d.cotaDigital.titulo)}</h2>
  <p class="cap">${esc(d.cotaDigital.nota)}</p>
  <table>
    ${d.cotaDigital.itens
      .map(
        (i) => `<tr><td class="n">${esc(i.nome)}<i>${esc(i.argumento)}</i></td>
        <td class="v" style="color:var(--ink45)">na cota</td></tr>`
      )
      .join("")}
    <tr class="tot"><td class="n">${d.cotaDigital.usados} de ${d.cotaDigital.total} usos</td><td class="v">${real(0)}</td></tr>
  </table>
</div>

<div class="bloco">
  <h2>${esc(d.projetos.titulo)}</h2>
  <p class="cap">Contratados fora da mensalidade, cobrados em parcelas.</p>
  <table>
    ${d.projetos.itens
      .map((i) =>
        linha(
          i.nome,
          `Parcela ${i.parcela} de ${i.de}${i.total ? ` · projeto de ${real(i.total)}` : ""}${i.nota ? ` · ${i.nota}` : ""}`,
          i.valor
        )
      )
      .join("")}
    <tr class="tot"><td class="n">Parcelas do ciclo</td><td class="v">${real(totalProjetos)}</td></tr>
  </table>
</div>

${
  d.descartado?.itens?.length
    ? `<div class="bloco">
  <h2>${esc(d.descartado.titulo)}</h2>
  <table>
    ${d.descartado.itens
      .map(
        (i) => `<tr><td class="n">${esc(i.nome)}<i>${esc(i.argumento)}</i></td>
        <td class="v" style="color:var(--ink45)">${real(0)}</td></tr>`
      )
      .join("")}
  </table>
</div>`
    : ""
}

<div class="fim">
  <h2>Total do ciclo</h2>
  <p>Base mensal ${real(totalBase)} · peças gráficas ${real(totalArtes)} · rodadas extras
    ${real(totalAjustes)} · módulo do sistema ${real(totalModulo)}${
      totalEscopo ? ` · escopo novo ${real(totalEscopo)}` : ""
    } · parcelas de projeto
    ${real(totalProjetos)}. Os ${acompanhados} itens entregues sem cobrança e os
    ${d.cotaDigital.usados} da cota de criação digital não entram nesta conta.</p>
  <div class="grande"><b>${real(total)}</b><span>vence em ${esc(d.vencimento)}</span></div>
</div>

<footer>
  <span>RYZE · ryzecode08@gmail.com</span>
  <span>${esc(d.carater)}</span>
</footer>

</body>
</html>`;
}

export const meta = { nome: "fechamento", formatoMm: [210, 296] };
