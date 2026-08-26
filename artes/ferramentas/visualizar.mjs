/**
 * Folha de contato — junta tudo o que está em artes/saida numa página só,
 * para revisar as peças lado a lado antes de mandar para a gráfica / para a marca.
 *
 *   node artes/ferramentas/visualizar.mjs [--abrir]
 */
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const saida = join(aqui, "..", "saida");
/* `--so=<prefixo>` limita a folha a uma peça. Sem isso a saída acumulada (100+ PNGs
   de todas as peças já feitas) torna a revisão inútil. */
const so = process.argv.find((a) => a.startsWith("--so="))?.slice(5);
const pngs = existsSync(saida)
  ? readdirSync(saida).filter((f) => f.endsWith(".png") && (!so || f.startsWith(so)))
  : [];

const daPeca = (prefixo) =>
  pngs.filter((f) => f.startsWith(prefixo)).sort((a, b) => a.localeCompare(b, "pt-BR"));

const secoes = [
  {
    titulo: "Crachá · variante centro",
    nota: "54 × 86 mm + 3 mm de sangria · frente e verso · PVC",
    classe: "grade-cracha",
    arquivos: daPeca("cracha-centro-").filter((f) => !f.includes("guias")),
  },
  {
    titulo: "Crachá · variante editorial",
    nota: "mesma medida, foto full-bleed no topo e texto à esquerda",
    classe: "grade-cracha",
    arquivos: daPeca("cracha-editorial-"),
  },
  {
    titulo: "Crachá · conferência de corte",
    nota: "vermelho = linha de corte · azul = área segura (4 mm). Não mandar este para produção.",
    classe: "grade-cracha",
    arquivos: daPeca("cracha-centro-guias-").slice(0, 2),
  },
  {
    titulo: "Cordão",
    nota: "fita 20 mm × 90 cm · ícone da montanha em cinza a cada 70 mm",
    classe: "fita",
    arquivos: daPeca("cordao"),
  },
  {
    titulo: "Documento para as marcas",
    nota: "9 páginas · 1920 × 1080 · a página 5 é a única que muda por parceiro",
    classe: "grade-deck",
    arquivos: daPeca("parcerias-"),
  },
  {
    titulo: "Camiseta da equipe",
    nota: "mapa de aplicação e medidas · estampa branca sobre camiseta preta",
    classe: "grade-deck",
    arquivos: daPeca("camiseta-").filter((f) => f.includes("mapa")),
  },
  {
    titulo: "Camiseta · artes de estampa",
    nota: "arte branca sobre fundo transparente — aqui aparece sobre xadrez; o vazio é a transparência",
    classe: "grade-cracha",
    arquivos: daPeca("camiseta-").filter((f) => f.includes("arte")),
  },
];

const cartao = (arquivo) => `
      <figure class="peca">
        <img src="${arquivo}" alt="${arquivo}" loading="lazy">
        <figcaption>${arquivo}</figcaption>
      </figure>`;

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Artes Desbravando — revisão</title>
<style>
  :root { color-scheme: light; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #ececec; color: #111;
    font: 15px/1.5 -apple-system, "Segoe UI", Roboto, sans-serif;
    padding: 48px 40px 80px;
  }
  header { max-width: 1400px; margin: 0 auto 44px; }
  h1 { font-size: 30px; letter-spacing: -.4px; }
  header p { color: #666; margin-top: 8px; }
  section { max-width: 1400px; margin: 0 auto 56px; }
  h2 { font-size: 19px; letter-spacing: -.2px; }
  .nota { color: #777; font-size: 13.5px; margin: 4px 0 20px; }
  .grade-cracha { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 24px; }
  .grade-deck { display: grid; grid-template-columns: repeat(auto-fill, minmax(430px, 1fr)); gap: 24px; }
  .fita { display: grid; gap: 24px; }
  .peca { background: #fff; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.16); }
  /* Arte de estampa é branca: sobre fundo branco desapareceria. Xadrez cinza mostra
     onde há transparência e deixa o branco visível. */
  .grade-cracha .peca img[src*="arte"] {
    background:
      linear-gradient(45deg, #8a8a8a 25%, transparent 25%, transparent 75%, #8a8a8a 75%) 0 0 / 18px 18px,
      linear-gradient(45deg, #8a8a8a 25%, transparent 25%, transparent 75%, #8a8a8a 75%) 9px 9px / 18px 18px,
      #6f6f6f;
  }
  .peca img { width: 100%; height: auto; display: block; border-radius: 4px; }
  .fita .peca img { border-radius: 2px; }
  figcaption { margin-top: 10px; font-size: 11.5px; color: #999; font-family: ui-monospace, monospace; }
  .detalhe { background: #fff; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.16); }
  .detalhe .zoom {
    height: 130px; border-radius: 2px;
    background: url("cordao.png") left center / 300% auto no-repeat;
  }
  .vazio { color: #999; font-style: italic; }
</style>
</head>
<body>
<header>
  <h1>Artes Desbravando UTV</h1>
  <p>Revisão das peças geradas em <code>artes/saida</code>. Os PDFs de produção estão na mesma pasta.</p>
</header>
${secoes
  .map(
    (s) => `<section>
  <h2>${s.titulo}</h2>
  <p class="nota">${s.nota}</p>
  ${
    s.arquivos.length
      ? `<div class="${s.classe}">${s.arquivos.map(cartao).join("")}
  </div>${
    s.classe === "fita"
      ? `\n  <div class="detalhe" style="margin-top:24px"><div class="zoom"></div><figcaption>detalhe ampliado — primeiro trecho da fita</figcaption></div>`
      : ""
  }`
      : `<p class="vazio">nada gerado ainda — rode <code>node artes/ferramentas/render.mjs tudo</code></p>`
  }
</section>`
  )
  .join("\n")}
</body>
</html>`;

const destino = join(saida, "_revisar.html");
writeFileSync(destino, html, "utf8");
console.log(`folha de contato: ${destino}`);
console.log(`${pngs.length} imagens`);

if (process.argv.includes("--abrir")) {
  /* Nunca `start`: para PNG o Windows entrega ao Paint, e o Pedro pediu
     explicitamente para não abrir arte ali. HTML vai no Chrome; imagem solta vai no
     VS Code, que renderiza na aba. */
  const CHROME = [
    process.env.CHROME,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  ].filter(Boolean).find((c) => existsSync(c));
  const url = pathToFileURL(destino).href;
  if (CHROME) spawn(CHROME, [url], { detached: true, stdio: "ignore" }).unref();
  else console.error(`Chrome não encontrado — abra à mão: ${destino}
(sem recorrer a "start": ele entrega ao programa padrão do Windows, que para imagem é o Paint)`);
}
