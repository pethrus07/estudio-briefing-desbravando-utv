/**
 * CRACHÁ — Equipe Desbravando
 *
 * Formato: PVC vertical 54 × 86 mm (CR80 em pé) + 3 mm de sangria em cada lado.
 * Página gerada: 60 × 92 mm. Área segura: 4 mm para dentro da linha de corte.
 *
 * Registro: núcleo (P&B estrito). Foto do colaborador entra dessaturada — a peça
 * inteira fica em preto, branco e cinza, como pede a direção de design.
 *
 * Duas variantes de layout, mesmo conteúdo:
 *   centro     — simétrico, foto contida, nome centralizado (leitura rápida a distância)
 *   editorial  — foto full-bleed no topo, texto alinhado à esquerda (mais próximo do deck)
 */

const SANGRIA = 3; // mm
const L = 54; // largura final, mm
const A = 86; // altura final, mm

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** "Ana Beatriz Moraes" -> { primeiro: "Ana", resto: "Beatriz Moraes" } */
function partirNome(nome) {
  const partes = String(nome ?? "").trim().split(/\s+/);
  return { primeiro: partes[0] ?? "", resto: partes.slice(1).join(" ") };
}

/** O primeiro nome ocupa a largura toda; nomes longos encolhem para não quebrar. */
function corpoPrimeiroNome(primeiro) {
  const n = primeiro.length;
  if (n <= 6) return 7.6;
  if (n <= 9) return 6.4;
  if (n <= 12) return 5.2;
  return 4.4;
}

function frente(pessoa, layout) {
  const { primeiro, resto } = partirNome(pessoa.nome);
  const foto = pessoa.foto
    ? `<img class="retrato" src="${esc(pessoa.foto)}" alt="">`
    : `<div class="retrato sem-foto"><span>foto</span></div>`;

  if (layout === "editorial") {
    return `
    <section class="pagina frente editorial">
      <div class="sangria-guia"></div>
      <div class="topo-editorial">
        ${foto}
        <div class="veu"></div>
        <img class="logotipo" src="../marca/logo-desbravando.png" alt="Desbravando UTV">
      </div>
      <div class="baixo-editorial">
        <h1 class="titulo nome-1">${esc(primeiro)}</h1>
        ${resto ? `<h2 class="titulo nome-2">${esc(resto)}</h2>` : ""}
        <hr class="divisor">
        <p class="cargo">${esc(pessoa.cargo)}</p>
      </div>
    </section>`;
  }

  return `
  <section class="pagina frente centro">
    <div class="sangria-guia"></div>
    <img class="logotipo" src="../marca/logo-desbravando.png" alt="Desbravando UTV">
    ${foto}
    <hr class="divisor">
    <h1 class="titulo nome-1" style="font-size:${corpoPrimeiroNome(primeiro)}mm">${esc(primeiro)}</h1>
    ${resto ? `<h2 class="titulo nome-2">${esc(resto)}</h2>` : ""}
    <p class="cargo">${esc(pessoa.cargo)}</p>
  </section>`;
}

function verso(config) {
  return `
  <section class="pagina verso">
    <div class="sangria-guia"></div>
    <img class="marca-dagua" src="../marca/logo-montanha-branco.svg" alt="">
    <div class="verso-conteudo">
      <img class="icone-verso" src="../marca/logo-montanha-branco.svg" alt="">
      <p class="sobrelinha verso-label">Equipe</p>
      ${config.avisoVerso ? `<p class="verso-aviso">${esc(config.avisoVerso)}</p>` : ""}
      ${config.site ? `<p class="verso-site">${esc(config.site)}</p>` : ""}
    </div>
  </section>`;
}

/**
 * opcoes.faces:
 *   "ambas"  (padrão) — frente e verso intercalados, uma pessoa a cada duas páginas
 *   "frente" — só as frentes (o que varia por pessoa)
 *   "verso"  — uma única página, já que o verso é igual para todo mundo
 * A gráfica costuma pedir os dois últimos; o intercalado serve para conferência.
 */
export function cracha({ pessoas = [], config = {} }, opcoes = {}) {
  const layout = opcoes.layout === "editorial" ? "editorial" : "centro";
  const guias = opcoes.guias ? "com-guias" : "";
  const faces = opcoes.faces ?? "ambas";
  const semVerso = faces === "frente" || config.verso === false;
  const paginas =
    faces === "verso"
      ? verso(config)
      : pessoas.map((p) => frente(p, layout) + (semVerso ? "" : verso(config))).join("\n");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Crachá — Equipe Desbravando (${layout})</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${L + SANGRIA * 2}mm ${A + SANGRIA * 2}mm; margin: 0; }

  .pagina {
    position: relative;
    width: ${L + SANGRIA * 2}mm;
    height: ${A + SANGRIA * 2}mm;
    background: var(--preto);
    overflow: hidden;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .pagina:last-child { page-break-after: auto; }

  /* ---- guias de conferência (não vão para a gráfica) ---- */
  .sangria-guia { display: none; }
  .com-guias .sangria-guia {
    display: block; position: absolute;
    left: ${SANGRIA}mm; top: ${SANGRIA}mm; width: ${L}mm; height: ${A}mm;
    outline: 0.2mm solid rgba(255,80,80,.85);
  }
  .com-guias .sangria-guia::after {
    content: ""; position: absolute;
    left: 4mm; top: 4mm; right: 4mm; bottom: 4mm;
    outline: 0.2mm dashed rgba(80,180,255,.85);
  }

  /* ============ VARIANTE CENTRO ============
     As alturas abaixo fecham a coluna dentro dos 86 mm com a foto presente —
     mexer numa exige refazer a conta, senão o cargo sai da área segura. */
  .centro { padding: ${SANGRIA + 7}mm ${SANGRIA + 5}mm ${SANGRIA + 4}mm; }
  .centro .logotipo { width: 18mm; height: auto; display: block; flex: none; }
  .centro .retrato {
    width: 34mm; height: 40mm; margin-top: 4mm; flex: none;
    object-fit: cover; border-radius: 2.5mm; filter: grayscale(1) contrast(1.02);
  }
  .centro .divisor { width: 12mm; height: 0.35mm; background: var(--branco); margin: 4mm 0 2.6mm; opacity: .9; flex: none; }
  .centro .nome-1 { line-height: .84; text-align: center; }
  /* margem folgada: no Anton o acento sobe a 1.1 em, e sobrenomes têm Ô, Ã, É. */
  .centro .nome-2 {
    font-size: 3.4mm; line-height: 1.15; margin-top: 1.4mm;
    text-align: center; color: rgba(255,255,255,.78); letter-spacing: .1mm;
  }
  .centro .cargo {
    margin-top: 2.6mm; font-weight: 600; font-size: 2.35mm;
    letter-spacing: .95mm; text-transform: uppercase; color: var(--label); text-align: center;
  }

  /* ============ VARIANTE EDITORIAL ============ */
  .editorial { padding: 0; align-items: stretch; }
  .topo-editorial { position: relative; height: 55mm; overflow: hidden; }
  .editorial .retrato {
    width: 100%; height: 100%; object-fit: cover; object-position: center 30%;
    filter: grayscale(1) contrast(1.02);
  }
  .veu {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,.55) 78%, #000 100%);
  }
  .editorial .logotipo {
    position: absolute; left: ${SANGRIA + 5}mm; top: ${SANGRIA + 8}mm;
    width: 22mm; height: auto;
  }
  .baixo-editorial { padding: 3mm ${SANGRIA + 5}mm ${SANGRIA + 6}mm; margin-top: -2mm; }
  .editorial .nome-1 { font-size: 7.4mm; line-height: .84; }
  .editorial .nome-2 { font-size: 3.4mm; line-height: 1.15; margin-top: 1.4mm; color: rgba(255,255,255,.78); }
  .editorial .divisor { width: 10mm; height: .35mm; background: var(--branco); margin: 3.2mm 0 2.6mm; opacity: .9; }
  .editorial .cargo {
    font-weight: 600; font-size: 2.35mm; letter-spacing: .95mm;
    text-transform: uppercase; color: var(--label);
  }

  /* Retrato ausente — campo pendente, nunca decoração. */
  .sem-foto {
    background: #0e0e0e; border: .3mm dashed rgba(255,255,255,.22);
    display: flex; align-items: center; justify-content: center;
  }
  .sem-foto span {
    font-weight: 600; font-size: 2.2mm; letter-spacing: 1mm;
    text-transform: uppercase; color: rgba(255,255,255,.4);
  }

  /* ============ VERSO ============ */
  .verso { justify-content: flex-end; padding: ${SANGRIA + 8}mm ${SANGRIA + 6}mm ${SANGRIA + 8}mm; }
  .marca-dagua {
    position: absolute; left: 50%; top: 34%; width: 46mm;
    margin-left: -23mm; margin-top: -9mm; opacity: .07;
  }
  .verso-conteudo { position: relative; text-align: center; width: 100%; }
  .icone-verso { width: 16mm; height: auto; opacity: .9; margin-bottom: 5mm; }
  .verso-label { font-size: 2.2mm; letter-spacing: 1.4mm; }
  .verso-aviso {
    margin-top: 4mm; font-size: 2.15mm; line-height: 1.55;
    color: rgba(255,255,255,.5); max-width: 40mm; margin-left: auto; margin-right: auto;
  }
  .verso-site {
    margin-top: 4.5mm; font-weight: 600; font-size: 2.2mm;
    letter-spacing: .7mm; color: rgba(255,255,255,.72);
  }
</style>
</head>
<body class="${guias}">
${paginas}
</body>
</html>`;
}

export const meta = {
  nome: "cracha",
  formatoMm: [L + SANGRIA * 2, A + SANGRIA * 2],
  finalMm: [L, A],
  sangriaMm: SANGRIA,
};
