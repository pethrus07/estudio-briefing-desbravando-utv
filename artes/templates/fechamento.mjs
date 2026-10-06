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

import { esc, real, cssRyze } from "./ryze-doc.mjs";
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
${cssRyze()}
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
