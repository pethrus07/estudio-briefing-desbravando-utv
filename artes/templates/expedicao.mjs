/**
 * PEÇAS DA EXPEDIÇÃO — adesivo do UTV e cartão de identificação.
 *
 * As duas compartilham o SELO (marca + edição + local + período), por isso vivem no
 * mesmo arquivo: mudar o selo muda as duas de uma vez.
 *
 * Registro: núcleo P&B. A referência do cliente vinha em azul/verde-limão; aqui é
 * preto e branco, como ele pediu.
 *
 *   adesivo()     círculo de 150 mm + 3 mm de sangria, com o número do UTV
 *   cartaoUtv()   100 × 70 mm, frente com o selo e VERSO CLARO para escrever à mão
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SANGRIA = 3; // mm

/** CSS comum das duas peças. `u` é a unidade base de escala (mm por "ponto" de design). */
const baseCss = (u, tinta = "#FFFFFF", tinta82 = "rgba(255,255,255,.86)", inverterMarca = false) => `
  html, body { margin: 0; padding: 0; }
  .marca {
    width: ${28 * u}mm; height: auto; display: block; margin: 0 auto;
    ${inverterMarca ? "filter: invert(1);" : ""}
  }
  /* line-height 1.14: o Í de FAMÍLIA sobe acima da altura de caixa no Anton e batia
     no Ç de EXPEDIÇÃO. Vale para qualquer título acentuado da marca. */
  .edicao {
    font-family: "Anton"; font-weight: 400; text-transform: uppercase;
    line-height: 1.2; letter-spacing: -.02em; color: ${tinta};
  }
  /* o ano acompanha a palavra em dois blocos empilhados (20 / 26), como na referência */
  .linha-2 { display: inline-flex; align-items: center; justify-content: center; }
  .ano {
    font-style: normal; display: inline-flex; flex-direction: column;
    line-height: 1.02; text-align: left;
  }
  .ano b { font-weight: 400; }
  .local { font-weight: 400; color: ${tinta82}; }
  .periodo { font-weight: 700; color: ${tinta}; }
`;

/** Divide "2026" em ["20","26"]. Ano fora do padrão volta inteiro, numa linha só. */
function anoDividido(ano) {
  const s = String(ano ?? "").trim();
  return s.length === 4 ? [s.slice(0, 2), s.slice(2)] : [s];
}

/**
 * Selo: marca, edição, público + ano, local e período. Sem o número do UTV — ele é
 * exclusivo do adesivo.
 */
function selo(d, u) {
  const [a1, a2] = anoDividido(d.ano);
  return `
    <img class="marca" src="../marca/logo-desbravando-grande.png" alt="Desbravando UTV">
    <div class="edicao bloco-edicao">
      <span class="linha-1">${esc(d.edicao)}</span>
      <span class="linha-2">${esc(d.publico)}<i class="ano"><b>${esc(a1)}</b>${a2 ? `<b>${esc(a2)}</b>` : ""}</i></span>
    </div>
    <p class="local">${esc(d.local)}</p>
    ${d.mostrarPeriodo ? `<p class="periodo">${esc(d.periodo)}</p>` : ""}`;
}

/* ------------------------------------------------------------------ adesivo */

export function adesivo(dados, opcoes = {}) {
  const d = dados;
  const diametro = d.adesivo?.diametroMm ?? 150;
  const numero = opcoes.numero ?? d.adesivo?.numero ?? "01";
  const pagina = diametro + SANGRIA * 2;
  const u = diametro / 150; // escala: as medidas abaixo foram desenhadas para 150 mm

  /* O branco não é só inverter cor: a marca vem em PNG branco com transparência, então
     precisa de invert() para virar preta mantendo o recorte. */
  const tema = opcoes.tema === "branco" ? "branco" : "preto";
  const claro = tema === "branco";
  const fundo = claro ? "#FFFFFF" : "#000000";
  const tinta = claro ? "#111111" : "#FFFFFF";
  const tinta82 = claro ? "rgba(17,17,17,.82)" : "rgba(255,255,255,.86)";
  const corAnel = claro ? "rgba(17,17,17,.85)" : "rgba(255,255,255,.9)";

  return {
    html: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Adesivo UTV ${esc(numero)} — ${diametro} mm (${tema})</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${pagina}mm ${pagina}mm; margin: 0; }
  ${baseCss(u, tinta, tinta82, claro)}

  .peca {
    position: relative; width: ${pagina}mm; height: ${pagina}mm;
    background: ${fundo}; overflow: hidden;
  }
  /* o disco é o corte: fora dele é sangria, por isso o fundo preto vaza até a borda */
  .disco {
    position: absolute; left: ${SANGRIA}mm; top: ${SANGRIA}mm;
    width: ${diametro}mm; height: ${diametro}mm; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: ${13 * u}mm ${14 * u}mm;
    text-align: center;
  }
  /* anel interno: na referência era verde-limão; em P&B vira um fio branco */
  .anel {
    position: absolute; left: ${SANGRIA + 4 * u}mm; top: ${SANGRIA + 4 * u}mm;
    width: ${diametro - 8 * u}mm; height: ${diametro - 8 * u}mm;
    border: ${0.7 * u}mm solid ${corAnel}; border-radius: 50%;
  }

  .bloco-edicao { margin-top: ${5 * u}mm; }
  .linha-1 { display: block; font-size: ${13 * u}mm; }
  .linha-2 { font-size: ${19 * u}mm; }
  .ano { margin-left: ${2 * u}mm; }
  .ano b { font-size: ${7.2 * u}mm; letter-spacing: .02em; }
  .local { margin-top: ${2.4 * u}mm; font-size: ${5.4 * u}mm; }
  .periodo { margin-top: ${1.6 * u}mm; font-size: ${6.6 * u}mm; letter-spacing: .01em; }

  .utv {
    margin-top: ${4.4 * u}mm;
    font-weight: 600; font-size: ${5.2 * u}mm; letter-spacing: ${1.6 * u}mm;
    text-transform: uppercase; color: ${tinta82};
  }
  .numero {
    font-family: "Anton"; font-weight: 400; color: ${tinta};
    font-size: ${30 * u}mm; line-height: .92; letter-spacing: -.01em;
    margin-top: ${0.6 * u}mm;
  }
</style>
</head>
<body>
  <div class="peca">
    <div class="disco">
      ${selo(d, u)}
      <p class="utv">UTV</p>
      <p class="numero">${esc(numero)}</p>
    </div>
    <div class="anel"></div>
  </div>
</body>
</html>`,
    medidas: { finalMm: [diametro, diametro], paginaMm: [pagina, pagina], sangriaMm: SANGRIA, numero, tema },
  };
}

/* ------------------------------------------------------------ cartão do UTV */

export function cartaoUtv(dados) {
  const d = dados;
  const L = d.cartao?.larguraMm ?? 100;
  const A = d.cartao?.alturaMm ?? 70;
  const furo = d.cartao?.furoMm ?? 6;
  const u = L / 100;
  const lPagina = L + SANGRIA * 2;
  const aPagina = A + SANGRIA * 2;

  return {
    html: `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Cartão de identificação do UTV — ${L} × ${A} mm</title>
<link rel="stylesheet" href="../identidade.css">
<style>
  @page { size: ${lPagina}mm ${aPagina}mm; margin: 0; }
  ${baseCss(u)}

  .pagina {
    position: relative; width: ${lPagina}mm; height: ${aPagina}mm;
    overflow: hidden; page-break-after: always;
  }
  .pagina:last-child { page-break-after: auto; }
  .frente { background: var(--preto); }
  /* verso claro DE PROPÓSITO: é preenchido à mão, e caneta comum não escreve no preto */
  .verso { background: #ffffff; }

  .area {
    position: absolute; left: ${SANGRIA}mm; top: ${SANGRIA}mm;
    width: ${L}mm; height: ${A}mm;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    /* topo folgado: o furo fica a 4 mm da borda e a marca não pode encostar nele */
    padding: ${13 * u}mm ${8 * u}mm ${6 * u}mm;
    text-align: center;
  }

  /* marca do furo: guia de acabamento, não imprime nada */
  .furo {
    position: absolute; left: 50%; margin-left: -${furo / 2}mm;
    top: ${SANGRIA + 4 * u}mm; width: ${furo}mm; height: ${furo}mm;
    border-radius: 50%; border: .25mm dashed rgba(255,255,255,.55);
  }
  .verso .furo { border-color: rgba(0,0,0,.4); }

  .frente .bloco-edicao { margin-top: ${3 * u}mm; }
  .frente .linha-1 { display: block; font-size: ${7.6 * u}mm; }
  .frente .linha-2 { font-size: ${11.4 * u}mm; }
  .frente .ano { margin-left: ${1.4 * u}mm; }
  .frente .ano b { font-size: ${4.4 * u}mm; letter-spacing: .02em; }
  .frente .marca { width: ${24 * u}mm; }
  .frente .local { margin-top: ${1.8 * u}mm; font-size: ${3.6 * u}mm; }
  .frente .periodo { margin-top: ${1 * u}mm; font-size: ${4.2 * u}mm; }

  /* ---- verso: campos para escrever ---- */
  .verso .area { justify-content: center; padding-top: ${13 * u}mm; }
  .campos { width: 100%; display: grid; gap: ${5.4 * u}mm; }
  .campo { text-align: left; }
  .campo span {
    display: block; font-weight: 600; font-size: ${3.1 * u}mm;
    letter-spacing: ${0.5 * u}mm; text-transform: uppercase; color: #111111;
  }
  .campo i { display: block; margin-top: ${3.4 * u}mm; border-bottom: .3mm solid #111111; }
  .verso-marca {
    position: absolute; left: 50%; bottom: ${SANGRIA + 3.5 * u}mm;
    margin-left: -${9 * u}mm; width: ${18 * u}mm; opacity: .5;
  }
</style>
</head>
<body>
  <section class="pagina frente">
    <div class="area">
      ${selo(d, u)}
    </div>
    <div class="furo"></div>
  </section>

  <section class="pagina verso">
    <div class="area">
      <div class="campos">
        ${(d.cartao?.campos ?? ["Nome", "Nº UTV", "Observação"])
          .map((c) => `<div class="campo"><span>${esc(c)}</span><i></i></div>`)
          .join("\n        ")}
      </div>
    </div>
    <img class="verso-marca" src="../marca/logo-montanha-preto.svg" alt="">
    <div class="furo"></div>
  </section>
</body>
</html>`,
    medidas: { finalMm: [L, A], paginaMm: [lPagina, aPagina], sangriaMm: SANGRIA, furoMm: furo },
  };
}

export const meta = { nome: "expedicao", sangriaMm: SANGRIA };
