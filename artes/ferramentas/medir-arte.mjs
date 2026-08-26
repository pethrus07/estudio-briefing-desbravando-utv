/**
 * Mede a peça no navegador e acusa problema de layout que não se vê num PNG reduzido:
 * texto sobrepondo texto, elemento estourando a página, folga irregular entre blocos.
 *
 *   node medir-arte.mjs file:///.../peca.html [largura] [altura]
 *
 * Sobreposição: compara o retângulo de cada nó de TEXTO (não os contêineres, que se
 * contêm por natureza) contra todos os outros. Glifo de Anton com line-height < 1
 * transborda a própria caixa, e é assim que "palavra passa por cima de palavra" sem
 * que nenhuma regra de CSS pareça errada.
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const perfil = mkdtempSync(join(tmpdir(), "cdp-"));
const PORTA = 9337;
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`, "about:blank",
], { stdio: "ignore" });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 60; i++) {
  try {
    const r = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
    const p = r.find((a) => a.type === "page");
    if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; }
  } catch {}
  await espera(250);
}
await new Promise((ok, e) => { ws.onopen = ok; ws.onerror = e; });

let id = 0;
const pend = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
};
const cmd = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const aval = async (e) =>
  (await cmd("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;

await cmd("Runtime.enable");
await cmd("Page.enable");
await cmd("Emulation.setDeviceMetricsOverride", {
  width: Number(process.argv[3] ?? 1080), height: Number(process.argv[4] ?? 1920),
  deviceScaleFactor: 1, mobile: false });
await cmd("Page.navigate", { url: process.argv[2] });
await espera(2500);

const bruto = await aval(`JSON.stringify((function(){
  var W = innerWidth, H = innerHeight;
  var cv = document.createElement("canvas").getContext("2d");

  /* Caixa de TINTA, não de métrica. A caixa de métrica do Anton tem 1,505em de
     altura (asc 1,176 + desc 0,329) enquanto a tinta de um dígito ocupa 0,87em —
     comparar métrica acusa colisão onde não há, e é o que me fez perseguir
     fantasma. measureText devolve actualBoundingBox* da string real, já contando
     acento e descendente. */
  function inkDe(no) {
    var el = no.parentElement;
    var cs = getComputedStyle(el);
    var r = document.createRange();
    r.selectNodeContents(no);
    var linhas = Array.prototype.map.call(r.getClientRects(), function(x){ return x; });
    if (!linhas.length) return null;

    cv.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    var m = cv.measureText(no.nodeValue.trim());
    var fAsc = m.fontBoundingBoxAscent, fDesc = m.fontBoundingBoxDescent;
    var iAsc = m.actualBoundingBoxAscent, iDesc = m.actualBoundingBoxDescent;

    /* Uma caixa de tinta por linha visual: o texto pode quebrar em várias. */
    return linhas.map(function(cx){
      var base = cx.top + (cx.height - (fAsc + fDesc)) / 2 + fAsc;
      return {
        texto: no.nodeValue.trim().slice(0, 30),
        classe: el.className || el.tagName.toLowerCase(),
        x: Math.round(cx.left), w: Math.round(cx.width),
        y: Math.round(base - iAsc), h: Math.round(iAsc + iDesc),
      };
    });
  }

  var caixas = [];
  var it = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
  var t;
  while ((t = it.nextNode())) {
    if (!t.nodeValue.trim()) continue;
    var cs = getComputedStyle(t.parentElement);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    var b = inkDe(t);
    if (b) caixas = caixas.concat(b.filter(function(c){ return c.w > 0 && c.h > 0; }));
  }

  var colisoes = [];
  for (var i = 0; i < caixas.length; i++) {
    for (var j = i + 1; j < caixas.length; j++) {
      var a = caixas[i], b2 = caixas[j];
      var dx = Math.min(a.x + a.w, b2.x + b2.w) - Math.max(a.x, b2.x);
      var dy = Math.min(a.y + a.h, b2.y + b2.h) - Math.max(a.y, b2.y);
      if (dx <= 0 || dy <= 0) continue;
      colisoes.push({ a: a.classe + ' "' + a.texto + '"', b: b2.classe + ' "' + b2.texto + '"',
                      dx: dx, dy: dy });
    }
  }

  /* Menor folga vertical entre tintas de blocos diferentes: acusa "quase colado" */
  var ordenadas = caixas.slice().sort(function(p1,p2){ return p1.y - p2.y; });
  var apertados = [];
  for (var k = 0; k < ordenadas.length - 1; k++) {
    var u = ordenadas[k], v = ordenadas[k+1];
    if (u.classe === v.classe) continue;
    var folga = v.y - (u.y + u.h);
    if (folga >= 0 && folga < 12) apertados.push({ de: u.classe, para: v.classe, folga: folga });
  }

  var fora = caixas.filter(function(c){
    return c.x < -1 || c.y < -1 || c.x + c.w > W + 1 || c.y + c.h > H + 1;
  }).map(function(c){ return c.classe + ' "' + c.texto + '"'; });

  var ritmo = [];
  var alvo = document.querySelector(".miolo");
  if (alvo) {
    var filhos = Array.prototype.filter.call(alvo.children, function(f){
      return f.getBoundingClientRect().height > 2; });
    for (var q = 0; q < filhos.length - 1; q++) {
      ritmo.push({ de: filhos[q].className || filhos[q].tagName,
        folga: Math.round(filhos[q+1].getBoundingClientRect().top - filhos[q].getBoundingClientRect().bottom) });
    }
  }

  return { viewport: W + "x" + H, scrollHeight: document.documentElement.scrollHeight,
    primeiroTexto: Math.min.apply(null, caixas.map(function(c){ return c.y; })),
    ultimoTexto: Math.max.apply(null, caixas.map(function(c){ return c.y + c.h; })),
    colisoes: colisoes, apertados: apertados, fora: fora, ritmo: ritmo, caixas: ordenadas };
})())`);

const d = JSON.parse(bruto || "{}");
console.log(`viewport ${d.viewport} · scrollHeight ${d.scrollHeight}`);
console.log(`texto começa em y=${d.primeiroTexto} e termina em y=${d.ultimoTexto}`);
console.log(`\nCOLISÕES: ${d.colisoes.length}`);
for (const c of d.colisoes) console.log(`  ${c.sobra}%  ${c.a}  ×  ${c.b}   (dx ${c.dx} dy ${c.dy})`);
console.log(`\nFORA DA PÁGINA: ${d.fora.length}`);
for (const f of d.fora) console.log(`  ${f}`);
console.log(`\nFOLGA ENTRE BLOCOS DO MIOLO:`);
for (const r of d.ritmo) console.log(`  depois de ${r.de}: ${r.folga}px`);
if (process.argv[5] === "--caixas") {
  console.log(`\nCAIXAS:`);
  for (const c of d.caixas) console.log(`  y${String(c.y).padStart(4)} h${String(c.h).padStart(3)} ${c.classe.padEnd(14)} "${c.texto}"`);
}
ws.close(); chrome.kill(); process.exit(0);
