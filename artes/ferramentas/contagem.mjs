/**
 * CONTAGEM REGRESSIVA — gera as artes de story (1080 × 1920) de uma expedição.
 *
 *   node artes/ferramentas/contagem.mjs contagem-costa-doce.json
 *   node artes/ferramentas/contagem.mjs contagem-costa-doce.json --destino=C:\pasta
 *
 * O JSON mora na pasta de dados do cliente (ver caminhos.mjs): ele aponta para fotos de
 * expedição, que não entram neste repositório. Sai um PNG por número, em pixel exato
 * (screenshot direto, sem passar por PDF), e o HTML ao lado para conferir.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { contagem, meta } from "../templates/contagem.mjs";
import { acharFoto, arquivoDeDados } from "./caminhos.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");

const args = process.argv.slice(2);
const arquivo = args.find((a) => !a.startsWith("--"));
if (!arquivo) {
  console.error("uso: node artes/ferramentas/contagem.mjs <dados.json> [--destino=pasta]");
  process.exit(1);
}
const destinoArg = args.find((a) => a.startsWith("--destino="));
const destino = destinoArg ? destinoArg.split("=").slice(1).join("=") : join(artes, "saida");

const CHROMES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
];
const chrome = CHROMES.filter(Boolean).find((p) => existsSync(p));
if (!chrome) throw new Error("Chrome não encontrado — defina CHROME");

const dados = JSON.parse(readFileSync(arquivoDeDados(arquivo), "utf8"));
const nome = basename(arquivo, ".json");

const resolverFoto = (c) => {
  const abs = acharFoto(artes, c);
  if (!abs) throw new Error(`foto não encontrada: ${c}`);
  return pathToFileURL(abs).href;
};
dados.patrocinioLogo = pathToFileURL(join(artes, dados.patrocinioLogo)).href;

// O HTML precisa ficar em artes/saida/ para o identidade.css e as fontes resolverem;
// o PNG vai para o destino pedido.
const saidaHtml = join(artes, "saida");
mkdirSync(saidaHtml, { recursive: true });
mkdirSync(destino, { recursive: true });

const [l, a] = meta.px;
for (const { n } of dados.numeros) {
  const html = contagem(dados, n, { resolverFoto });
  const htmlPath = join(saidaHtml, `${nome}-${String(n).padStart(2, "0")}.html`);
  writeFileSync(htmlPath, html, "utf8");
  const png = join(destino, `${nome}-${String(n).padStart(2, "0")}.png`);
  spawnSync(
    chrome,
    [
      "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
      "--force-device-scale-factor=1", "--virtual-time-budget=8000",
      "--allow-file-access-from-files",
      `--window-size=${l},${a}`, `--screenshot=${png}`, pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8" }
  );
  if (!existsSync(png)) throw new Error(`screenshot falhou: ${png}`);
  console.log(`  ${basename(png)}  ${l}×${a}px`);
}
