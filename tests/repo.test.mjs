/**
 * Testes rápidos, sem dependência:  npm test
 *
 * 1. o JavaScript do index.html compila (erro de sintaxe deixa a tela em branco);
 * 2. as chaves do Mini Drive estão VAZIAS no repositório (as reais só existem na produção);
 * 3. nenhum dado do cliente voltou para a árvore do git (artes/dados, CONTROLE-DE-ARTES);
 * 4. caminhos.mjs respeita DESBRAVANDO_DADOS e avisa quando a pasta não existe.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(raiz, "index.html"), "utf8");

test("o JavaScript do index.html compila", () => {
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(scripts.length > 0);
  for (const s of scripts) new Function(s);
});

test("as chaves do Mini Drive estão vazias no repositório", () => {
  assert.match(html, /const DRIVE_ENDPOINT="";/);
  assert.match(html, /const DRIVE_KEY="";/);
});

test("nenhum dado do cliente está versionado", () => {
  const arquivos = execFileSync("git", ["ls-files"], { cwd: raiz, encoding: "utf8" }).split("\n");
  const proibidos = arquivos.filter(
    (a) =>
      a.startsWith("artes/dados/") ||
      a.endsWith("CONTROLE-DE-ARTES.md") ||
      a.startsWith("artes/fotos/lencois/") ||
      a.startsWith("artes/fotos/veiculo-oficial/") ||
      a.endsWith(".pyc")
  );
  assert.deepEqual(proibidos, []);
});

test("caminhos.mjs usa DESBRAVANDO_DADOS e avisa quando falta a pasta", async () => {
  process.env.DESBRAVANDO_DADOS = join(raiz, "nao-existe-de-proposito");
  const m = await import(pathToFileURL(join(raiz, "artes", "ferramentas", "caminhos.mjs")).href + "?t=" + Date.now());
  assert.equal(m.DIR_DADOS, join(raiz, "nao-existe-de-proposito", "dados"));
  assert.throws(() => m.arquivoDeDados("equipe.json"), /pasta de dados não encontrada/);
});
