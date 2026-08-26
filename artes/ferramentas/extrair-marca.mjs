/**
 * Extrai os ativos de marca que hoje viajam embutidos no Estúdio de Briefing
 * (index.html, base64) para arquivos reais em artes/marca e artes/fontes.
 *
 *   node artes/ferramentas/extrair-marca.mjs
 *
 * A identidade é o código: os templates carregam estes arquivos, não cópias soltas.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const artes = join(aqui, "..");
const raiz = join(artes, "..");

const html = readFileSync(join(raiz, "index.html"), "utf8");

const pega = (nome) => {
  const m = html.match(new RegExp(`const ${nome}\\s*=\\s*"([A-Za-z0-9+/=]+)"`));
  if (!m) throw new Error(`constante ${nome} não encontrada em index.html`);
  return Buffer.from(m[1], "base64");
};

mkdirSync(join(artes, "fontes"), { recursive: true });
mkdirSync(join(artes, "marca"), { recursive: true });

const saidas = [
  ["fontes/Anton-Regular.ttf", pega("ANTON_B64")],
  ["fontes/Archivo.ttf", pega("ARCHIVO_B64")],
  ["marca/logo-desbravando.png", pega("LOGO_B64")],
];

for (const [rel, buf] of saidas) {
  writeFileSync(join(artes, rel), buf);
  console.log(`${rel.padEnd(34)} ${(buf.length / 1024).toFixed(1)} kB`);
}

// Ícone da montanha — vetor, vem do repo do site (mesma origem do guia).
const site = join(process.env.USERPROFILE, "Projetos", "desbravando-site", "marca");
for (const svg of ["logo-montanha-branco.svg", "logo-montanha-preto.svg", "logo-montanha.svg"]) {
  const de = join(site, svg);
  if (existsSync(de)) {
    copyFileSync(de, join(artes, "marca", svg));
    console.log(`marca/${svg}`);
  } else {
    console.warn(`! ausente: ${de}`);
  }
}
