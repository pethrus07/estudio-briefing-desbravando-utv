/**
 * MOCKUP 3D — renderiza a camiseta em WebGL (three.js) via Chrome headless.
 *
 *   node artes/ferramentas/mockup-3d.mjs [--w=1400] [--h=1750] [--destino=CAMINHO]
 *
 * Sai em artes/saida (ou no destino): costas, frente e uma 3/4 de apresentação.
 *
 * Flags do Chrome que fazem isso funcionar sem placa de vídeo:
 *   --use-angle=swiftshader --enable-unsafe-swiftshader   WebGL em software
 *   --allow-file-access-from-files                        ler a estampa via file://
 */
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
const pagina = join(artes, "mockup", "camiseta-3d.html");

const arg = (n, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.split("=").slice(1).join("=") : padrao;
};

const W = Number(arg("w", 1400));
const H = Number(arg("h", 1750));
const saida = resolve(arg("destino", join(artes, "saida")));
mkdirSync(saida, { recursive: true });

const CHROME = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].filter(Boolean).find((p) => existsSync(p));
if (!CHROME) throw new Error("Chrome não encontrado");

// as estampas precisam existir: são a textura do render
for (const f of ["camiseta-producao-arte-costas.png", "camiseta-producao-arte-frente.png"]) {
  if (!existsSync(join(artes, "saida", f))) {
    throw new Error(`falta ${f} — rode antes: node artes/ferramentas/render.mjs camiseta`);
  }
}

const VISTAS = [
  { nome: "mockup-camiseta-costas", query: "vista=costas" },
  { nome: "mockup-camiseta-frente", query: "vista=frente" },
  { nome: "mockup-camiseta-3-4", query: "vista=costas&giro=24" },
];

for (const v of VISTAS) {
  const destino = join(saida, `${v.nome}.png`);
  const url = `${pathToFileURL(pagina).href}?${v.query}&w=${W}&h=${H}`;
  const r = spawnSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--allow-file-access-from-files",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--virtual-time-budget=25000",
      `--window-size=${W},${H}`,
      `--screenshot=${destino}`,
      url,
    ],
    { encoding: "utf8" }
  );
  if (!existsSync(destino)) {
    console.error(r.stderr?.split("\n").slice(0, 6).join("\n"));
    throw new Error(`render falhou: ${v.nome}`);
  }
  console.log(`  ${v.nome}.png  ${W}×${H}`);
}

console.log(`\nmockups em ${saida}`);
