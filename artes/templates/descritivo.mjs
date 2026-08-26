/**
 * DESCRITIVO DE ARTES — documento que acompanha o fechamento do mês.
 *
 * A4, identidade RYZE (não Desbravando: quem fala aqui é a RYZE com o cliente).
 * É a peça de argumentação: cada arte com o que é, a especificação técnica, a classe
 * de preço e o porquê — mais o que foi entregue sem cobrança.
 *
 * Fontes RYZE embutidas em marca/ryze/fontes-ryze.css (Space Grotesk, Plus Jakarta
 * Sans, JetBrains Mono).
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const real = (n) => `R$ ${Number(n).toLocaleString("pt-BR")}`;

export function descritivo(d) {
  const artes = d.pecas.flatMap((p) => p.itens);
  const totalArtes = artes.reduce((s, i) => s + i.valor, 0);
  const menos = artes.filter((i) => i.classe === "menos simples").length;
  const simples = artes.filter((i) => i.classe === "simples").length;
  const totalAjustes = (d.ajustes?.itens ?? []).reduce((s, i) => s + i.valor, 0);
  const acompanhados = d.pecas.reduce((s, p) => s + (p.acompanha?.length ?? 0), 0);

  const peca = (p, n) => `
  <section class="peca">
    <header>
      <span class="num">${String(n).padStart(2, "0")}</span>
      <div>
        <h3>${esc(p.nome)}</h3>
        <p class="oque">${esc(p.oque)}</p>
      </div>
      <span class="soma">${real(p.itens.reduce((s, i) => s + i.valor, 0))}</span>
    </header>

    <p class="spec">${esc(p.spec)}</p>

    <table class="itens">
      ${p.itens
        .map(
          (i) => `<tr>
        <td class="it">${esc(i.nome)}</td>
        <td class="cl"><span class="tag ${i.classe === "menos simples" ? "t40" : "t20"}">${esc(i.classe)}</span></td>
        <td class="vl">${real(i.valor)}</td>
      </tr>`
        )
        .join("\n      ")}
    </table>

    <p class="arg">${esc(p.argumento)}</p>

    ${
      p.acompanha?.length
        ? `<div class="acomp">
      <span class="rot">Entregue sem cobrança</span>
      <ul>${p.acompanha.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
    </div>`
        : ""
    }
  </section>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Descritivo de artes — ${esc(d.cliente)} · ${esc(d.competencia)}</title>
<link rel="stylesheet" href="../marca/ryze/fontes-ryze.css">
<style>
  :root {
    --gold: #FFB700;
    --black: #0D0D0D;
    --ink: #16181d;
    --ink70: #55596b;
    --ink45: #8b8fa3;
    --line: #e4e6ee;
    --bg-soft: #f7f8fb;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: 210mm 296mm; margin: 0; }

  body {
    font-family: "Plus Jakarta Sans", sans-serif;
    color: var(--ink); background: #fff;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  .folha { width: 210mm; padding: 0 0 14mm; }

  /* ---------- topo ---------- */
  .capa {
    background: var(--black); color: #fff;
    padding: 13mm 16mm 11mm;
  }
  .marca-linha { display: flex; align-items: center; justify-content: space-between; }
  .marca { display: flex; align-items: center; gap: 3.4mm; }
  .marca img { width: 8mm; height: auto; display: block; }
  .marca b {
    font-family: "Space Grotesk", sans-serif; font-weight: 700;
    font-size: 5.2mm; letter-spacing: 1.1mm; color: #fff;
  }
  .marca span {
    display: block; font-size: 2.2mm; letter-spacing: .9mm;
    color: var(--gold); text-transform: uppercase; margin-top: .6mm;
  }
  .meta { text-align: right; font-family: "JetBrains Mono", monospace; font-size: 2.5mm; line-height: 1.7; }
  .meta em { color: var(--gold); font-style: normal; }
  .meta i { color: #9aa0b4; font-style: normal; }

  h1 {
    font-family: "Space Grotesk", sans-serif; font-weight: 700;
    font-size: 12mm; line-height: 1.08; margin-top: 9mm; color: #fff;
  }
  h1 u { color: var(--gold); text-decoration: none; }
  .sub { margin-top: 4mm; font-size: 3.3mm; line-height: 1.6; color: #c9cdda; max-width: 150mm; }

  /* ---------- regras ---------- */
  .regras { padding: 10mm 16mm 0; }
  .rot {
    display: block; font-family: "JetBrains Mono", monospace;
    font-size: 2.4mm; letter-spacing: .9mm; text-transform: uppercase;
    color: var(--ink45); margin-bottom: 3mm;
  }
  .regras ol { list-style: none; display: grid; gap: 2.6mm; }
  .regras li {
    font-size: 3.1mm; line-height: 1.55; color: var(--ink70);
    padding-left: 6mm; position: relative;
  }
  .regras li::before {
    content: ""; position: absolute; left: 0; top: 1.7mm;
    width: 2.4mm; height: 2.4mm; background: var(--gold); border-radius: .4mm;
  }

  /* ---------- peças ---------- */
  .lista { padding: 0 16mm; }
  .peca {
    padding: 7mm 0 6mm; border-bottom: .3mm solid var(--line);
    break-inside: avoid;
  }
  .peca header { display: flex; align-items: flex-start; gap: 4mm; }
  .num {
    font-family: "JetBrains Mono", monospace; font-size: 3mm;
    color: var(--gold); padding-top: 1mm; min-width: 7mm;
  }
  .peca h3 { font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 4.6mm; }
  .oque { margin-top: 1.4mm; font-size: 3.05mm; color: var(--ink70); }
  .soma {
    margin-left: auto; font-family: "Space Grotesk", sans-serif; font-weight: 700;
    font-size: 4.4mm; white-space: nowrap;
  }
  .spec {
    margin: 3.4mm 0 0 11mm; padding: 2.6mm 3.4mm;
    background: var(--bg-soft); border-left: .7mm solid var(--gold);
    font-family: "JetBrains Mono", monospace; font-size: 2.5mm; line-height: 1.6; color: var(--ink70);
  }
  table.itens { width: calc(100% - 11mm); margin: 3.4mm 0 0 11mm; border-collapse: collapse; }
  table.itens td { padding: 1.9mm 0; border-bottom: .2mm dotted var(--line); font-size: 3mm; vertical-align: middle; }
  td.it { color: var(--ink); }
  td.cl { width: 30mm; text-align: right; }
  td.vl { width: 18mm; text-align: right; font-family: "JetBrains Mono", monospace; font-size: 2.9mm; }
  .tag {
    display: inline-block; font-family: "JetBrains Mono", monospace; font-size: 2.1mm;
    letter-spacing: .3mm; text-transform: uppercase; padding: .8mm 2mm; border-radius: 1mm;
  }
  .t20 { background: #eef0f6; color: #5b6076; }
  .t40 { background: rgba(255,183,0,.16); color: #8a6300; }
  .arg { margin: 3.4mm 0 0 11mm; font-size: 3.05mm; line-height: 1.62; color: var(--ink70); }
  .acomp { margin: 3.4mm 0 0 11mm; padding: 3mm 3.6mm; background: var(--bg-soft); border-radius: 1.4mm; }
  .acomp .rot { margin-bottom: 2mm; color: var(--ink45); }
  .acomp ul { list-style: none; display: grid; gap: 1.4mm; }
  .acomp li { font-size: 2.85mm; color: var(--ink70); padding-left: 4mm; position: relative; }
  .acomp li::before { content: "—"; position: absolute; left: 0; color: var(--ink45); }

  /* ---------- blocos extra ---------- */
  .bloco { padding: 7mm 16mm 0; break-inside: avoid; }
  .bloco h2 { font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 5mm; }
  .bloco .nota { margin-top: 3mm; font-size: 2.95mm; line-height: 1.6; color: var(--ink70); }
  .linhas { margin-top: 3.4mm; border-collapse: collapse; width: 100%; }
  .linhas td { padding: 2mm 0; border-bottom: .2mm dotted var(--line); font-size: 3mm; }
  .linhas td:last-child { text-align: right; font-family: "JetBrains Mono", monospace; font-size: 2.9mm; white-space: nowrap; }
  /* peso explícito: o JetBrains Mono do kit não tem bold, e herdar o 700 do h2 faz o
     navegador fabricar negrito — que sai do PDF como Type3, texto virado desenho. */
  .cota-uso {
    display: inline-block; margin-left: 2mm; font-family: "JetBrains Mono", monospace;
    font-weight: 400; font-size: 2.3mm; padding: .7mm 2mm; border-radius: 1mm;
    background: rgba(255,183,0,.16); color: #8a6300;
  }
  .linhas strong { font-family: "Space Grotesk", sans-serif; font-weight: 700; }
  .risco td:first-child { color: var(--ink45); }

  /* ---------- fechamento ---------- */
  .total {
    margin: 9mm 16mm 0; background: var(--black); color: #fff;
    padding: 8mm 9mm; border-radius: 2mm;
  }
  .total .grade { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; }
  .cel .k {
    font-family: "JetBrains Mono", monospace; font-size: 2.2mm; letter-spacing: .7mm;
    text-transform: uppercase; color: #9aa0b4;
  }
  .cel .v { margin-top: 2mm; font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 6.4mm; }
  .cel.destaque .v { color: var(--gold); font-size: 8mm; }
  .total .obs { margin-top: 6mm; padding-top: 4mm; border-top: .3mm solid rgba(255,255,255,.16); font-size: 2.9mm; line-height: 1.6; color: #c9cdda; }

  .rodape {
    margin: 8mm 16mm 0; padding-top: 4mm; border-top: .3mm solid var(--line);
    display: flex; justify-content: space-between;
    font-family: "JetBrains Mono", monospace; font-size: 2.3mm; letter-spacing: .4mm;
    text-transform: uppercase; color: var(--ink45);
  }
</style>
</head>
<body>
<div class="folha">

  <div class="capa">
    <div class="marca-linha">
      <div class="marca">
        <img src="../marca/ryze/ryze-symbol-gold-transparent.svg" alt="">
        <div>
          <b>RYZE</b>
          <span>Descritivo de artes</span>
        </div>
      </div>
      <div class="meta">
        Plano <em>${esc(d.plano)}</em> · ${esc(d.cliente)}<br>
        Competência <em>${esc(d.competencia)}</em><br>
        <i>Emissão ${esc(d.emissao)} · vence ${esc(d.vencimento)}</i>
      </div>
    </div>

    <h1>O que foi produzido<br>e <u>por que custa isso</u></h1>
    <p class="sub">Peça por peça: o que é, a especificação técnica de produção, quantas
    artes gerou e o critério de preço aplicado. Inclui também o que foi entregue sem
    cobrança, para ficar claro o que está e o que não está na conta.</p>
  </div>

  <div class="regras">
    <span class="rot">Como esta conta é formada</span>
    <ol>${(d.regra ?? []).map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
  </div>

  <div class="lista">
    ${d.pecas.map((p, i) => peca(p, i + 1)).join("\n")}
  </div>

  ${
    d.ajustes
      ? `<div class="bloco">
    <h2>${esc(d.ajustes.titulo)}</h2>
    <table class="linhas">
      ${d.ajustes.itens.map((i) => `<tr><td>${esc(i.nome)}</td><td>${real(i.valor)}</td></tr>`).join("\n      ")}
      <tr><td><strong>Subtotal</strong></td><td><strong>${real(totalAjustes)}</strong></td></tr>
    </table>
    <p class="nota">${esc(d.ajustes.nota)}</p>
  </div>`
      : ""
  }

  ${
    d.cotaDigital
      ? `<div class="bloco">
    <h2>${esc(d.cotaDigital.titulo)}<span class="cota-uso">cota ${d.cotaDigital.usados}/${d.cotaDigital.total}</span></h2>
    ${d.cotaDigital.itens
      .map(
        (i) => `<table class="linhas"><tr><td>${esc(i.nome)}</td><td>sem custo</td></tr></table>
    <p class="nota">${esc(i.argumento)}</p>`
      )
      .join("\n    ")}
    <p class="nota">${esc(d.cotaDigital.nota)}</p>
  </div>`
      : ""
  }

  ${
    d.descartado
      ? `<div class="bloco">
    <h2>${esc(d.descartado.titulo)}</h2>
    ${d.descartado.itens
      .map(
        (i) => `<table class="linhas risco"><tr><td>${esc(i.nome)}</td><td>não cobrado</td></tr></table>
    <p class="nota">${esc(i.argumento)}</p>`
      )
      .join("\n    ")}
  </div>`
      : ""
  }

  <div class="total">
    <div class="grade">
      <div class="cel"><div class="k">Artes</div><div class="v">${artes.length}</div></div>
      <div class="cel"><div class="k">${menos} × R$ 40</div><div class="v">${real(menos * 40)}</div></div>
      <div class="cel"><div class="k">${simples} × R$ 20</div><div class="v">${real(simples * 20)}</div></div>
      <div class="cel destaque"><div class="k">Artes + ajustes</div><div class="v">${real(totalArtes + totalAjustes)}</div></div>
    </div>
    <p class="obs">${artes.length} artes em ${d.pecas.length} peças = ${real(totalArtes)}, mais
    ${real(totalAjustes)} de rodadas além das inclusas. ${acompanhados} arquivos derivados e
    1 item de criação digital foram entregues sem cobrança. Este descritivo cobre apenas
    artes e ajustes — mensalidade, token, parcelas de projeto e criação digital fora da
    cota entram no fechamento do ciclo.</p>
  </div>

  <div class="rodape">
    <span>Descritivo de artes · confidencial · ${esc(d.cliente)}</span>
    <span>RYZE · ryzecode08@gmail.com</span>
  </div>

</div>
</body>
</html>`;
}

export const meta = { nome: "descritivo" };
