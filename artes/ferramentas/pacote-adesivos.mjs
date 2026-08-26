/**
 * PACOTE PARA A GRÁFICA — adesivos de identificação dos UTVs, 100% vetor.
 *
 *   node artes/ferramentas/pacote-adesivos.mjs [--ate=20] [--destino=CAMINHO]
 *
 * Padrão do destino: %USERPROFILE%\Downloads\DESBRAVANDO-ADESIVOS-UTV-VETOR
 *
 *   1-PRETO/    adesivo-preto-01..20  (PDF + SVG)
 *   2-BRANCO/   adesivo-branco-01..20 (PDF + SVG)
 *   CONFERENCIA-ZOOM.png   comparação antes/depois em zoom de 2400 dpi
 *   CONTATO.png            os 20 números em miniatura, para aprovação
 *   LEIA-ME.txt
 *
 * Refeito em 21/08/2026: a gráfica reclamou de serrilhado ao dar zoom. A versão
 * anterior era HTML/CSS com o logotipo em PNG. Aqui cada PDF é auditado antes de
 * entrar na pasta — se aparecer uma imagem ou uma fonte embutida, o script aborta.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { adesivoVetor, textosNecessarios, meta } from "../templates/adesivo-vetor.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
const temp = join(artes, "saida");
const PREFIXO = "_pct-adesivo-";

const arg = (nome, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${nome}=`));
  return a ? a.split("=").slice(1).join("=") : padrao;
};

const ate = Number(arg("ate", "20"));
const destino = resolve(
  arg("destino", join(process.env.USERPROFILE ?? ".", "Downloads", "DESBRAVANDO-ADESIVOS-UTV-VETOR"))
);

const CHROME = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].filter(Boolean).find((p) => existsSync(p));
const PYTHON = [
  process.env.PYTHON,
  join(process.env.LOCALAPPDATA ?? "", "Programs/Python/Python314/python.exe"),
].filter(Boolean).find((p) => existsSync(p));
if (!CHROME || !PYTHON) throw new Error("Chrome ou Python não encontrados");

const cache = new Map();
function curvasDe(texto, fonte) {
  const chave = `${fonte}|${texto}`;
  if (!cache.has(chave)) {
    const r = spawnSync(PYTHON, [join(aqui, "texto-para-svg.py"), fonte, texto], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`texto-para-svg falhou em "${texto}": ${r.stderr}`);
    cache.set(chave, JSON.parse(r.stdout));
  }
  return cache.get(chave);
}

function paraPdf(html, nome, pdfPath) {
  const htmlPath = join(temp, `${PREFIXO}${nome}.html`);
  writeFileSync(htmlPath, html, "utf8");
  spawnSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      "--virtual-time-budget=6000",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8" }
  );
  unlinkSync(htmlPath);
  if (!existsSync(pdfPath)) throw new Error(`Chrome não gerou ${nome}.pdf`);
}

/* ------------------------------------------------------------------ gera */

const dados = JSON.parse(readFileSync(join(artes, "dados", "expedicao-urubici-2026.json"), "utf8"));

if (existsSync(destino)) rmSync(destino, { recursive: true, force: true });
const pastas = { preto: join(destino, "1-PRETO"), branco: join(destino, "2-BRANCO") };
for (const p of Object.values(pastas)) mkdirSync(p, { recursive: true });

const gerados = [];
console.log(`Adesivo do UTV · Ø ${meta.diametroMm} mm + ${meta.sangriaMm} mm de sangria · 1 a ${ate} × 2 cores`);

for (let i = 1; i <= ate; i++) {
  const numero = String(i).padStart(2, "0");
  const pedidos = textosNecessarios(dados, numero);
  const curvas = Object.fromEntries(
    Object.entries(pedidos).map(([k, v]) => [k, curvasDe(v.texto, v.fonte)])
  );
  for (const tema of ["preto", "branco"]) {
    const { html, svg } = adesivoVetor(dados, { numero, tema, curvas });
    const nome = `adesivo-${tema}-${numero}`;
    const pdfPath = join(pastas[tema], `${nome}.pdf`);
    writeFileSync(join(pastas[tema], `${nome}.svg`), svg, "utf8");
    paraPdf(html, nome, pdfPath);
    gerados.push(pdfPath);
  }
  process.stdout.write(`  ${numero}`);
}
console.log("");

/* --------------------------------------------------- auditoria + provas */

const auditoria = spawnSync(PYTHON, [join(aqui, "auditar-vetor.py"), ...gerados], { encoding: "utf8" });
process.stdout.write(auditoria.stdout ?? "");
if (auditoria.status !== 0) {
  console.error(auditoria.stderr ?? "");
  rmSync(destino, { recursive: true, force: true });
  throw new Error("auditoria reprovou — pasta descartada, nada foi entregue");
}

const provas = spawnSync(
  PYTHON,
  [join(aqui, "provas-adesivo.py"), destino, join(temp, "adesivo-utv-01.pdf")],
  { encoding: "utf8" }
);
process.stdout.write(provas.stdout ?? "");
if (provas.status !== 0) console.error(provas.stderr ?? "");

const leiaMe = `ADESIVO DE IDENTIFICAÇÃO DOS UTVs — 3ª EXPEDIÇÃO FAMÍLIA 2026 (Urubici SC)
Desbravando UTV · arquivo para gráfica · refeito em 21/08/2026

--------------------------------------------------------------------
O QUE MUDOU
--------------------------------------------------------------------
A versão anterior tinha o logotipo como imagem dentro do PDF — ao dar zoom
para imprimir, a borda das letras aparecia serrilhada. Esta versão não tem
uma única imagem: o arquivo é vetor do começo ao fim.

  · o disco e o anel são círculos vetoriais (não há aproximação por curva)
  · o logotipo é caminho vetorial
  · TODO o texto está convertido em curvas

Consequência prática para a gráfica:
  · não é preciso instalar nenhuma fonte — não existe texto editável
  · pode ampliar o quanto quiser, não existe resolução para estourar
  · não há transparência nem efeito de camada para achatar

Conferido arquivo por arquivo: 0 imagens embutidas, 0 fontes embutidas.

--------------------------------------------------------------------
MEDIDAS
--------------------------------------------------------------------
Diâmetro final (corte):  ${meta.diametroMm} mm
Arquivo:                  ${meta.diametroMm + meta.sangriaMm * 2} × ${meta.diametroMm + meta.sangriaMm * 2} mm  (${meta.sangriaMm} mm de sangria em volta)
Corte:                    circular, no diâmetro de ${meta.diametroMm} mm
Cores:                    2 — preto e branco (sem meio-tom, sem degradê)

O fundo vaza até a borda da página de propósito: é a sangria. O corte é o
círculo de ${meta.diametroMm} mm no centro.

--------------------------------------------------------------------
O QUE TEM NA PASTA
--------------------------------------------------------------------
1-PRETO/    adesivo-preto-01 … adesivo-preto-${String(ate).padStart(2, "0")}    (${ate} peças)
2-BRANCO/   adesivo-branco-01 … adesivo-branco-${String(ate).padStart(2, "0")}   (${ate} peças)

Cada peça vem em dois formatos, com o mesmo desenho:
  .pdf   para impressão (é o arquivo de produção)
  .svg   caso o fluxo da gráfica prefira editar o vetor

Numeração de 1 a ${ate}, um adesivo por UTV.

CONFERENCIA-ZOOM.png   o antes e o depois em zoom de 2400 dpi
CONTATO.png            os ${ate} números em miniatura, para aprovação

--------------------------------------------------------------------
CONTATO
--------------------------------------------------------------------
Dúvida de arquivo ou pedido de outro formato (EPS, AI, PDF/X-1a, CDR):
respondemos no mesmo dia.
`;
writeFileSync(join(destino, "LEIA-ME.txt"), leiaMe, "utf8");

console.log(`\n${gerados.length} arquivos PDF + ${gerados.length} SVG`);
console.log(`pasta: ${destino}`);
