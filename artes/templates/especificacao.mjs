/**
 * ESPECIFICAÇÃO TÉCNICA — folha que acompanha os arquivos para a gráfica.
 * A4 (210 × 297 mm), registro núcleo (P&B).
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const linha = ([rotulo, valor]) => `
      <tr><th>${esc(rotulo)}</th><td>${valor}</td></tr>`;

const bloco = (titulo, linhas) => `
    <section class="bloco">
      <h2>${esc(titulo)}</h2>
      <table>${linhas.map(linha).join("")}
      </table>
    </section>`;

export function especificacao({ layout = "centro", pessoas = 0, arquivos = [] } = {}) {
  const cracha = [
    ["Peça", "Crachá de identificação · equipe Desbravando UTV"],
    ["Material", "PVC branco 0,76 mm (padrão CR80)"],
    ["Formato final", "<strong>54 × 86 mm</strong> — vertical (em pé)"],
    ["Arquivo enviado", "60 × 92 mm — já inclui <strong>3 mm de sangria</strong> em cada lado"],
    ["Área segura", "4 mm para dentro da linha de corte"],
    ["Impressão", "4/4 — frente variável (uma por pessoa), verso igual para todos"],
    ["Acabamento", "<strong>fosco</strong> — o fundo é preto sólido e o brilho marca digital"],
    ["Furo", "slot horizontal no topo, centralizado, a 4 mm da borda"],
    ["Quantidade", '<span class="preencher">a definir</span>'],
    ["Layout", layout === "editorial" ? "editorial (foto sangrada no topo)" : "centro (foto contida, texto centralizado)"],
  ];

  const cordao = [
    ["Peça", "Cordão / fita de pescoço"],
    ["Material", "fita de poliéster 20 mm"],
    ["Comprimento", "90 cm de arte (45 cm de alça dobrada)"],
    ["Arquivo enviado", "904 × 24 mm — inclui 2 mm de sangria nas laterais"],
    ["Impressão", "sublimação, mesma arte nos dois lados"],
    ["Arte", "fundo preto, ícone da montanha em cinza repetido a cada 70 mm"],
    ["Ferragem", "mosquetão giratório + terminal metálico"],
    ["Quantidade", '<span class="preencher">a definir</span>'],
  ];

  const cores = [
    ["Preto (fundo)", "#000000 — em CMYK, <strong>K 100</strong>; se a gráfica preferir preto rico: C60 M40 Y40 K100"],
    ["Branco", "#FFFFFF — sem impressão sobre o PVC branco, ou branco de cobertura conforme o processo"],
    ["Cinza do cordão", "#6E6E6E"],
    ["Perfil dos arquivos", "RGB. Se a conversão para CMYK for feita por vocês, manter o preto do fundo em K 100 (não converter para preto composto sem avisar)"],
  ];

  const tecnico = [
    ["Fontes", "Anton e Archivo — <strong>embutidas no PDF</strong> (Type0). Não é preciso instalar nada"],
    ["Imagens", "os retratos entram em preto e branco, 300 dpi no tamanho final"],
    ["Conferência", "o arquivo <em>-CONFERENCIA-guias.pdf</em> mostra a linha de corte (vermelha) e a área segura (azul). <strong>Não imprimir esse</strong>"],
  ];

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Especificação técnica — Crachá e cordão Desbravando UTV</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: 210mm 297mm; margin: 0; }
  .folha {
    width: 210mm; min-height: 297mm; background: var(--preto);
    padding: 20mm 18mm; position: relative;
  }
  .marca { height: 11mm; width: auto; display: block; margin-bottom: 12mm; }
  .sobrelinha { font-size: 3mm; letter-spacing: 1.6mm; margin-bottom: 3mm; }
  h1 { font-family: "Anton"; font-size: 13mm; line-height: 1.06; text-transform: uppercase; letter-spacing: -.2mm; }
  .intro { font-size: 3.4mm; line-height: 1.55; color: var(--texto); max-width: 150mm; margin-top: 5mm; }
  .bloco { margin-top: 9mm; }
  h2 {
    font-size: 3mm; font-weight: 600; letter-spacing: 1.2mm; text-transform: uppercase;
    color: var(--label); padding-bottom: 2.5mm; border-bottom: .4mm solid var(--divisor);
  }
  table { width: 100%; border-collapse: collapse; }
  th, td {
    text-align: left; vertical-align: top; padding: 2.6mm 0;
    border-bottom: .3mm solid rgba(255,255,255,.08); font-size: 3.2mm; line-height: 1.45;
  }
  th { width: 42mm; font-weight: 600; color: rgba(255,255,255,.62); padding-right: 6mm; }
  td { color: var(--texto); }
  td strong { color: var(--branco); }
  .preencher { color: rgba(255,255,255,.34); font-style: italic; }
  .arquivos { margin-top: 3mm; display: grid; gap: 1.6mm; }
  .arquivos li { font-size: 3.1mm; color: var(--texto); display: flex; gap: 3mm; }
  .arquivos li::before { content: ""; }
  .rodape {
    margin-top: 12mm; padding-top: 4mm; border-top: .4mm solid var(--divisor);
    font-size: 2.7mm; letter-spacing: .8mm; text-transform: uppercase; color: rgba(255,255,255,.38);
    display: flex; justify-content: space-between;
  }
</style>
</head>
<body>
  <div class="folha">
    <img class="marca" src="../marca/logo-desbravando.png" alt="Desbravando UTV">
    <p class="sobrelinha">Especificação técnica</p>
    <h1>Crachá e cordão<br>Equipe Desbravando</h1>
    <p class="intro">Arquivos fechados em PDF, com fontes embutidas e sangria aplicada.
    ${pessoas ? `Nesta remessa: <strong>${pessoas} crachá(s)</strong> — as frentes variam por pessoa, o verso é único.` : ""}</p>

    ${bloco("Crachá", cracha)}
    ${bloco("Cordão", cordao)}
    ${bloco("Cores", cores)}
    ${bloco("Técnico", tecnico)}

    <section class="bloco">
      <h2>Arquivos nesta pasta</h2>
      <ul class="lista arquivos">
        ${arquivos.map((a) => `<li><span>${esc(a)}</span></li>`).join("\n        ")}
      </ul>
    </section>

    <div class="rodape"><span>Desbravando UTV</span><span>desbravandoutv.com</span></div>
  </div>
</body>
</html>`;
}

export const meta = { nome: "especificacao", formatoMm: [210, 297] };
