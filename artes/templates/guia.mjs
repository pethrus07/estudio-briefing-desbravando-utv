/**
 * GUIA DE USO — documento RYZE para o cliente, em A4.
 *
 * Nasceu em 14/10/2026 para o guia do Briefing de Comunicação do Desbravando. É o quarto
 * documento com o cromo RYZE (fechamento, proposta, acordo, guia) e o primeiro que não fala
 * de dinheiro: aqui ninguém aprova nada, a pessoa aprende a usar.
 *
 * Por isso o cromo entra MAIS LEVE. Os outros três abrem com capa preta cheia porque precisam
 * de peso — são documentos de decisão. Um guia que abre assim intimida o que devia convidar,
 * e guia que intimida não é lido: vira anexo que ninguém abre e pergunta que volta no
 * WhatsApp. A marca fica numa tarja fina no topo, e a folha é o conteúdo.
 *
 * A4 de 210 × 296 mm — NÃO 297, que arredonda para 842,4 pt e empurra o rodapé para uma folha
 * em branco no fim do PDF.
 *
 * Pesos disponíveis em marca/ryze/fontes-ryze.css. Respeitar: peso que a fonte não tem faz o
 * Chrome FABRICAR o negrito, e o trecho sai como Type3.
 *   Space Grotesk 700 · Plus Jakarta Sans 400/600/700 · JetBrains Mono 400/500
 */

import { esc } from "./ryze-doc.mjs";

/** Marcação mínima de linha: **negrito**, `código`. Só o que o guia usa. */
const inline = (t) =>
  esc(t)
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

/**
 * Converte o Markdown do guia em HTML. Deliberadamente parcial: cobre `##`, `###`, `>`,
 * tabela, lista e parágrafo — que é tudo que o guia tem. Um conversor completo seria
 * dependência nova para resolver um problema que não existe, e a lista do que ele aceita é
 * a garantia de que ninguém escreve no guia algo que o PDF vai engolir em silêncio.
 */
function corpo(md) {
  const fora = [];
  const linhas = md.split(/\r?\n/);
  let i = 0;

  const paragrafo = (buf) => {
    if (buf.length) fora.push(`<p>${inline(buf.join(" "))}</p>`);
    buf.length = 0;
  };
  const buf = [];

  while (i < linhas.length) {
    const l = linhas[i];

    if (/^\s*$/.test(l)) { paragrafo(buf); i++; continue; }
    if (/^---+\s*$/.test(l)) { paragrafo(buf); fora.push('<hr>'); i++; continue; }

    let m;
    if ((m = l.match(/^###\s+(.*)/))) { paragrafo(buf); fora.push(`<h3>${inline(m[1])}</h3>`); i++; continue; }
    if ((m = l.match(/^##\s+(.*)/)))  { paragrafo(buf); fora.push(`<h2>${inline(m[1])}</h2>`); i++; continue; }
    if ((m = l.match(/^#\s+(.*)/)))   { paragrafo(buf); fora.push(`<h1>${inline(m[1])}</h1>`); i++; continue; }

    if (l.startsWith(">")) {
      paragrafo(buf);
      const bloco = [];
      while (i < linhas.length && linhas[i].startsWith(">")) bloco.push(linhas[i].replace(/^>\s?/, "")), i++;
      fora.push(`<blockquote>${inline(bloco.join(" "))}</blockquote>`);
      continue;
    }

    if (l.trimStart().startsWith("|")) {
      paragrafo(buf);
      const linhasTab = [];
      while (i < linhas.length && linhas[i].trimStart().startsWith("|")) linhasTab.push(linhas[i]), i++;
      const celulas = (s) => s.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      /* A linha de trac,os e separador, nao dado: entra como linha vazia se nao for filtrada. */
      const corpoTab = linhasTab.filter((x) => !/^[\s|:-]+$/.test(x));
      fora.push(
        "<table>" +
          corpoTab.map((r) => `<tr>${celulas(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") +
        "</table>"
      );
      continue;
    }

    if (/^\s*[-•*]\s+/.test(l)) {
      paragrafo(buf);
      const itens = [];
      while (i < linhas.length && /^\s*[-•*]\s+/.test(linhas[i])) itens.push(linhas[i].replace(/^\s*[-•*]\s+/, "")), i++;
      fora.push(`<ul>${itens.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`);
      continue;
    }

    buf.push(l.trim());
    i++;
  }
  paragrafo(buf);
  return fora.join("\n");
}

export function guia(d) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${esc(d.titulo)} — ${esc(d.cliente)}</title>
<link rel="stylesheet" href="../marca/ryze/fontes-ryze.css">
<style>
  :root{ --gold:#FFB700; --black:#0D0D0D; --ink:#16181d; --ink70:#4a4e5e;
         --ink45:#6f7488; --line:#e4e6ee; --soft:#f7f8fb }
  *{ margin:0; padding:0; box-sizing:border-box }
  @page{ size:210mm 296mm; margin:0 }
  body{ font-family:"Plus Jakarta Sans",sans-serif; color:var(--ink); background:#fff;
    -webkit-print-color-adjust:exact; print-color-adjust:exact; padding:0 0 16mm }

  /* Tarja fina em vez de capa preta: guia convida, não impõe. */
  .tarja{ background:var(--black); color:#fff; padding:7mm 16mm; display:flex;
    align-items:center; justify-content:space-between }
  .tarja .marca{ display:flex; align-items:center; gap:3mm }
  .tarja img{ width:6.4mm; height:auto; display:block }
  /* Cor explicita: a regra global de negrito (b) vence a cor HERDADA da tarja, porque
     herança perde para qualquer regra direta. Sem isto a palavra RYZE sai quase preta
     sobre preto — legível na tela do editor, invisível no PDF.
     E sem acento grave aqui dentro: ele fecha o template literal e o CSS vira código.
     Foi exatamente o que aconteceu na primeira tentativa desta correção. */
  .tarja b{ font-family:"Space Grotesk",sans-serif; font-weight:700; font-size:4.2mm;
    letter-spacing:.9mm; color:#fff }
  .tarja span{ font-family:"JetBrains Mono",monospace; font-weight:400; font-size:2.4mm;
    letter-spacing:.7mm; text-transform:uppercase; color:#9aa0b4 }

  .folha{ padding:0 16mm }
  h1{ font-family:"Space Grotesk",sans-serif; font-weight:700; font-size:9mm; line-height:1.1;
    margin:11mm 0 2mm }
  .sub{ font-size:3.3mm; color:var(--ink45); margin-bottom:9mm }
  h2{ font-family:"Space Grotesk",sans-serif; font-weight:700; font-size:5mm;
    margin:9mm 0 3mm; break-after:avoid }
  h3{ font-family:"Space Grotesk",sans-serif; font-weight:700; font-size:3.8mm;
    margin:6mm 0 2mm; break-after:avoid }
  p{ font-size:3.15mm; line-height:1.62; color:var(--ink70); margin-bottom:2.6mm }
  b{ font-weight:700; color:var(--ink) }
  code{ font-family:"JetBrains Mono",monospace; font-weight:400; font-size:2.8mm;
    background:var(--soft); padding:.4mm 1.2mm; border-radius:.8mm }
  hr{ border:none; border-top:.25mm solid var(--line); margin:8mm 0 }

  ul{ list-style:none; display:grid; gap:2.2mm; margin:1mm 0 3mm }
  li{ font-size:3.15mm; line-height:1.55; color:var(--ink70); padding-left:5.5mm; position:relative }
  li::before{ content:""; position:absolute; left:0; top:1.6mm; width:2.2mm; height:2.2mm;
    background:var(--gold); border-radius:.4mm }

  blockquote{ font-family:"JetBrains Mono",monospace; font-weight:400; font-size:2.9mm;
    line-height:1.6; color:var(--ink); background:var(--soft); border-left:.8mm solid var(--gold);
    padding:3.4mm 4mm; margin:3mm 0 4mm; border-radius:0 1.2mm 1.2mm 0; break-inside:avoid }

  table{ width:100%; border-collapse:collapse; margin:2mm 0 4mm; break-inside:avoid }
  td{ font-size:3.05mm; line-height:1.5; color:var(--ink70);
    padding:2.8mm 3mm 2.8mm 0; border-bottom:.25mm solid var(--line); vertical-align:top }
  tr:first-child td{ font-weight:700; color:var(--ink) }

  footer{ margin:12mm 16mm 0; padding-top:4mm; border-top:.25mm solid var(--line);
    display:flex; justify-content:space-between; font-family:"JetBrains Mono",monospace;
    font-size:2.3mm; letter-spacing:.5mm; text-transform:uppercase; color:var(--ink45) }
</style>
</head>
<body>

<div class="tarja">
  <div class="marca">
    <img src="../marca/ryze/ryze-symbol-gold-transparent.svg" alt="">
    <b>RYZE</b>
  </div>
  <span>${esc(d.cliente)}</span>
</div>

<div class="folha">
${corpo(d.markdown)}
</div>

<footer>
  <span>RYZE · ${esc(d.cliente)}</span>
  <span>${esc(d.data)}</span>
</footer>

</body>
</html>`;
}
