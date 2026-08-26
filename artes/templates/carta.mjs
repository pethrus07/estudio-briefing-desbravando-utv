/**
 * CARTA DE RECEPÇÃO — A5 (148 × 210 mm) + 3 mm de sangria.
 *
 * Quem lê são famílias chegando de viagem, então a peça é de LEITURA, não de impacto:
 * coluna estreita, entrelinha alta, margens largas, título contido. A identidade entra
 * pela tipografia (Anton no título, Archivo no texto) e pelo ícone — não por peso.
 *
 *   tema=claro    tinta preta sobre o papel. Mais fino, e a leitura é melhor
 *   tema=escuro   fundo preto sólido, tinta branca — igual às peças de social
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const L = 148;
const A = 210;
const SANGRIA = 3;

export function carta(dados, opcoes = {}) {
  const tema = opcoes.tema === "escuro" ? "escuro" : "claro";
  const c = dados.carta ?? {};
  const escuro = tema === "escuro";

  const tinta = escuro ? "#FFFFFF" : "#111111";
  const tinta82 = escuro ? "rgba(255,255,255,.86)" : "rgba(17,17,17,.86)";
  const tinta55 = escuro ? "rgba(255,255,255,.6)" : "rgba(17,17,17,.55)";
  const fio = escuro ? "rgba(255,255,255,.28)" : "rgba(17,17,17,.22)";
  const papel = escuro ? "#000000" : "#FFFFFF";
  const icone = escuro ? "../marca/logo-montanha-branco.svg" : "../marca/logo-montanha-preto.svg";

  const sobrelinha = [dados.edicao, dados.publico, dados.local?.replace(/^in /, "")]
    .filter(Boolean)
    .join(" · ");

  return {
    html: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Carta de recepção — ${esc(dados.publico ?? "")} ${esc(dados.ano ?? "")} (${tema})</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${L + SANGRIA * 2}mm ${A + SANGRIA * 2}mm; margin: 0; }
  html, body { margin: 0; padding: 0; background: ${papel}; }

  /* As alturas abaixo fecham a carta em UMA página A5 com este texto. Texto mais
     longo vai empurrar a assinatura para a página 2 — nesse caso, encurtar o texto
     ou subir para A4. */
  .folha {
    position: relative; width: ${L + SANGRIA * 2}mm; height: ${A + SANGRIA * 2}mm;
    background: ${papel}; color: ${tinta};
    padding: ${SANGRIA + 15}mm ${SANGRIA + 19}mm ${SANGRIA + 13}mm;
    display: flex; flex-direction: column;
  }

  .icone-topo { width: 12mm; height: auto; display: block; margin: 0 auto; }
  .sobrelinha {
    margin-top: 5mm; text-align: center;
    font-weight: 600; font-size: 2.4mm; letter-spacing: 1.05mm;
    text-transform: uppercase; color: ${tinta55};
  }

  h1 {
    margin-top: 8.5mm; font-family: "Anton"; font-weight: 400;
    font-size: 9.6mm; line-height: 1.16; text-transform: uppercase;
    letter-spacing: -.1mm; color: ${tinta};
  }
  .fio { width: 15mm; height: .35mm; background: ${tinta}; opacity: .85; margin: 5mm 0 6mm; }

  p {
    font-size: 3.25mm; line-height: 1.62; color: ${tinta82};
    margin: 0 0 3.4mm; max-width: 104mm;
  }
  .destaque {
    margin-top: 5mm; margin-bottom: 5mm;
    font-weight: 700; font-size: 3.45mm; line-height: 1.45; color: ${tinta};
  }
  .fecho { margin-top: 0; }
  .assinatura {
    margin-top: auto; padding-top: 6.5mm; border-top: .3mm solid ${fio};
    font-weight: 600; font-size: 2.9mm; letter-spacing: .85mm;
    text-transform: uppercase; color: ${tinta};
  }
  .periodo {
    display: block; margin-top: 2.2mm; font-weight: 400; font-size: 2.7mm; letter-spacing: .5mm;
    color: ${tinta55}; text-transform: none;
  }
</style>
</head>
<body>
  <div class="folha">
    <img class="icone-topo" src="${icone}" alt="">
    <p class="sobrelinha">${esc(sobrelinha)}</p>

    <h1>${c.titulo ?? "Bem-vindos."}</h1>
    <div class="fio"></div>

    ${(c.paragrafos ?? []).map((t) => `<p>${esc(t)}</p>`).join("\n    ")}

    <p class="destaque">${(c.destaque ?? []).map(esc).join("<br>")}</p>

    <p class="fecho">${esc(c.fecho ?? "")}</p>

    <div class="assinatura">
      ${esc(c.assinatura ?? "Equipe Desbravando")}
      <span class="periodo">${esc(dados.periodo ?? "")}</span>
    </div>
  </div>
</body>
</html>`,
    medidas: { finalMm: [L, A], paginaMm: [L + SANGRIA * 2, A + SANGRIA * 2], sangriaMm: SANGRIA, tema },
  };
}

export const meta = { nome: "carta", finalMm: [L, A], sangriaMm: SANGRIA, temas: ["claro", "escuro"] };
