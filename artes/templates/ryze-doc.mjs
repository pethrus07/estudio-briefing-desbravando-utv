/**
 * CROMO DO DOCUMENTO RYZE — a folha A4 que a RYZE manda para o cliente.
 *
 * Quem fala nestes documentos é a RYZE, não a marca do cliente: preto #0D0D0D, dourado
 * #FFB700, Space Grotesk nos títulos, Plus Jakarta no texto, JetBrains Mono nos rótulos.
 *
 * A4 de 210 × 296 mm — NÃO 297. O 297 arredonda para 842,4 pt e empurra o rodapé para uma
 * folha em branco no fim do PDF.
 *
 * Pesos disponíveis em marca/ryze/fontes-ryze.css. Respeitar: usar um peso que não existe faz
 * o Chrome FABRICAR o negrito, e o trecho sai do PDF como Type3 — o auditor reprova.
 *   Space Grotesk 700 · Plus Jakarta Sans 400/600/700 · JetBrains Mono 400/500
 *
 * Extraído do `fechamento.mjs` em 06/10/2026, quando a proposta comercial virou o SEGUNDO
 * documento com esta identidade. Copiado, o CSS divergiria: um documento com a capa nova,
 * outro com a velha, e ninguém saberia qual é a RYZE.
 */

export const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Dinheiro em português, sempre pela mesma função — "R$ 1.075", nunca escrito à mão. */
export const real = (n) => `R$ ${Number(n).toLocaleString("pt-BR")}`;

/** Soma de uma lista de itens por campo. O total nunca vem do JSON. */
export const soma = (lista, campo = "valor") => lista.reduce((s, i) => s + (i[campo] ?? 0), 0);

/** A folha: tokens, página, capa, faixa de números, blocos, tabela e rodapé. */
export function cssRyze() {
  return `  :root{
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
    font-size:2.3mm; letter-spacing:.5mm; text-transform:uppercase; color:var(--ink45) }`;
}
