"""Troca a logo do Desbravando em TUDO a partir de um único arquivo.

    python artes/ferramentas/atualizar-logo.py <logo.png> [--simular] [--sem-render]

Por que existe: em 11/11/2026 a logo mudou (montanha nova · filete · #DESBRAVANDOUTV) e a
troca à mão espalhou erro: num primeiro momento os templates foram para o vetor ANTIGO da
montanha, que é outro desenho. Com este script a logo tem uma fonte só (o PNG oficial) e
um comando só propaga para todos os lugares, conferindo cada passo.

O que faz, na ordem:
  1. Lê o PNG. Se não tiver transparência, deduz pelo fundo: claro sobre escuro vira
     alfa pela luminância; escuro sobre claro, pelo inverso. Sai sempre BRANCO com alfa.
  2. Acha as partes pela projeção das colunas: montanha (a primeira), filete, texto.
     Se só houver uma parte, o arquivo é só o símbolo.
  3. Grava em artes/marca/, com NOMES FIXOS que os templates já usam:
       logo-oficial-original.png   o arquivo recebido, intacto
       logo-oficial.png / .svg     a logo completa (branca alfa / vetor currentColor)
       logo-lateral.svg            = logo-oficial.svg (nome antigo, mesmo destino)
       logo-montanha.png / .svg    só o símbolo; -branco.svg e -preto.svg derivados
  4. Vetoriza com vetorizar-png.py e CONFERE: rasteriza o vetor de volta em 4× e exige
     que nenhuma diferença com o PNG fique a mais de 1 px da borda. Se ficar, aborta antes
     de gravar qualquer coisa.
  5. Troca a logo embutida no Estúdio (LOGO_B64 do index.html).
  6. Atualiza a pasta de artes do site (DESBRAVANDO_ARTES, fora do git) com backup antes,
     regera os favicons e acerta a proporção da montanha em design/lib/tokens.mjs.
  7. Renderiza de novo todas as contagens (dados/contagem-*.json).
  8. Lista o que ainda aponta para o lockup antigo (logo-desbravando*), para decidir.

O que ele NÃO faz (é ação para fora, pede o OK do Pedro): publicar o Estúdio no
Cloudflare Pages, mandar arte para o cliente, fazer commit.
"""

import argparse
import base64
import io
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

AQUI = Path(__file__).resolve().parent
ARTES = AQUI.parent
REPO = ARTES.parent
MARCA = ARTES / "marca"
ESTUDIO = REPO / "index.html"
SITE_ARTES = Path(os.environ.get(
    "DESBRAVANDO_ARTES", r"C:\Users\olive\Arquivo-projetos\desbravando-recebidos\do-repo"))
SITE_REPO = REPO.parent / "desbravando-site"
DADOS = Path(os.environ.get(
    "DESBRAVANDO_DADOS", r"C:\Users\olive\Arquivo-projetos\desbravando-dados")) / "dados"

# filho Python no Windows escreve em cp1252 e o "·" quebra a leitura: força UTF-8
AMBIENTE = {**os.environ, "PYTHONIOENCODING": "utf-8"}


def passo(t):
    print(f"\n▸ {t}")


# ---------------------------------------------------------------- 1. alfa branco
def para_alfa_branco(src: Image.Image) -> Image.Image:
    im = src.convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    alfa = a[..., 3]
    if alfa.min() < 250:  # já tem transparência: usa o alfa como está
        mascara = alfa
        origem = "transparência do arquivo"
    else:
        lum = a[..., :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
        h, w = lum.shape
        cantos = np.concatenate([lum[:8, :8].ravel(), lum[:8, -8:].ravel(),
                                 lum[-8:, :8].ravel(), lum[-8:, -8:].ravel()])
        fundo = float(np.median(cantos))
        if fundo < 128:
            mascara = np.clip((lum - fundo - 10) * 255.0 / (255 - fundo - 10), 0, 255)
            origem = f"desenho claro sobre fundo escuro (fundo {fundo:.0f})"
        else:
            mascara = np.clip((fundo - 10 - lum) * 255.0 / (fundo - 10), 0, 255)
            origem = f"desenho escuro sobre fundo claro (fundo {fundo:.0f})"
    print(f"  alfa a partir de: {origem}")
    out = np.zeros((*mascara.shape, 4), dtype=np.uint8)
    out[..., :3] = 255
    out[..., 3] = mascara.astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def recorta(im: Image.Image, pad: int = 6) -> Image.Image:
    bb = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bb:
        sys.exit("a imagem não tem desenho nenhum")
    x0, y0, x1, y1 = bb
    return im.crop((max(0, x0 - pad), max(0, y0 - pad),
                    min(im.width, x1 + pad), min(im.height, y1 + pad)))


# ---------------------------------------------------------------- 2. partes
def partes(im: Image.Image):
    a = np.asarray(im.split()[3]) > 128
    cols = a.any(axis=0)
    runs, x = [], 0
    while x < len(cols):
        if cols[x]:
            s = x
            while x < len(cols) and cols[x]:
                x += 1
            runs.append([s, x])
        else:
            x += 1
    juntas = []
    for r in runs:  # buraco menor que 1,5% da largura é dentro da mesma parte
        if juntas and r[0] - juntas[-1][1] < im.width * 0.015:
            juntas[-1][1] = r[1]
        else:
            juntas.append(r)
    return juntas


# ---------------------------------------------------------------- 4. vetor + conferência
def vetoriza(png: Path, svg: Path):
    r = subprocess.run([sys.executable, str(AQUI / "vetorizar-png.py"), str(png), str(svg)],
                       capture_output=True, text=True, encoding="utf-8", env=AMBIENTE)
    if r.returncode:
        sys.exit(f"vetorização falhou: {r.stderr}")
    print("  " + r.stdout.strip())


def conferir_vetor(svg: Path, png: Path, k: int = 4):
    """Rasteriza o path (só M/L/Z, evenodd) em k× e compara com o alfa do PNG ampliado.

    Devolve (sobreposição, pixels divergentes LONGE da borda). O critério que reprova é o
    segundo: diferença a até 1 px da borda é antisserrilhado e não muda o desenho; diferença
    longe dela é forma errada (agulha, buraco faltando, letra perdida). Medido em 11/11/2026:
    em 1× o PIL pinta o contorno inteiro e o vetor parece 4,7% maior (IoU 0,94); em 4× e 8×
    a medida estabiliza (0,970) e 100% da diferença fica na faixa de ±1 px. Por isso a régua
    não é um IoU arbitrado.
    """
    from scipy import ndimage

    texto = svg.read_text(encoding="utf-8")
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', texto).group(1).split()]
    w, h = int(round(vb[2])) * k, int(round(vb[3])) * k
    d = re.search(r' d="([^"]+)"', texto).group(1)
    acum = Image.new("1", (w, h), 0)
    for sub in d.split("Z"):
        nums = re.findall(r"-?\d+(?:\.\d+)?", sub)
        if len(nums) < 6:
            continue
        pts = [(float(x) * k, float(y) * k) for x, y in zip(nums[0::2], nums[1::2])]
        m = Image.new("1", (w, h), 0)
        ImageDraw.Draw(m).polygon(pts, fill=1)
        acum = ImageChops.logical_xor(acum, m)
    alvo = np.asarray(Image.open(png).split()[3].resize((w, h), Image.LANCZOS)) > 128
    feito = np.asarray(acum, dtype=bool)
    dif = alvo ^ feito
    borda = ndimage.binary_dilation(alvo, iterations=k) & ~ndimage.binary_erosion(alvo, iterations=k)
    longe = int((dif & ~borda).sum()) // (k * k)
    return float((alvo & feito).sum() / max(1, (alvo | feito).sum())), longe


def cor_svg(svg_txt: str, cor: str) -> str:
    return svg_txt.replace('fill="currentColor"', f'fill="{cor}"')


# ---------------------------------------------------------------- principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("logo")
    ap.add_argument("--simular", action="store_true", help="mostra o plano e não grava nada")
    ap.add_argument("--sem-render", action="store_true", help="não renderiza as contagens")
    arg = ap.parse_args()

    origem = Path(arg.logo).resolve()
    if not origem.exists():
        sys.exit(f"não achei {origem}")

    tmp = ARTES / "saida" / "_logo-nova"
    tmp.mkdir(parents=True, exist_ok=True)

    passo(f"lendo {origem.name}")
    src = Image.open(origem)
    print(f"  {src.size[0]}×{src.size[1]} {src.mode}")
    completa = recorta(para_alfa_branco(src))
    ps = partes(completa)
    nomes = ["montanha", "filete", "texto"] if len(ps) == 3 else [f"parte {i+1}" for i in range(len(ps))]
    for n, (a, b) in zip(nomes, ps):
        print(f"  {n}: x {a}–{b} ({b - a} px)")
    if len(ps) not in (1, 3):
        print(f"  ⚠ esperava 3 partes (montanha · filete · texto) ou 1 (só o símbolo); achei {len(ps)}."
              " A montanha vai ser a primeira parte. Confira o resultado.")
    a, b = ps[0]
    montanha = recorta(completa.crop((a, 0, b, completa.height)))
    print(f"  logo completa {completa.size} · montanha {montanha.size} "
          f"(proporção {montanha.width / montanha.height:.2f}:1)")

    passo("vetorizando e conferindo")
    completa.save(tmp / "logo-oficial.png")
    montanha.save(tmp / "logo-montanha.png")
    for nome in ("logo-oficial", "logo-montanha"):
        vetoriza(tmp / f"{nome}.png", tmp / f"{nome}.svg")
        iou, longe = conferir_vetor(tmp / f"{nome}.svg", tmp / f"{nome}.png")
        print(f"  {nome}: sobreposição {iou:.4f} · pixels divergentes longe da borda: {longe}")
        if longe > 0:
            sys.exit(f"  ✗ o vetor de {nome} muda o desenho ({longe} px fora da faixa de ±1 px). Nada foi gravado.")

    oficial_svg = (tmp / "logo-oficial.svg").read_text(encoding="utf-8")
    mont_svg = (tmp / "logo-montanha.svg").read_text(encoding="utf-8")
    alvos_marca = {
        "logo-oficial-original.png": None,
        "logo-oficial.png": tmp / "logo-oficial.png",
        "logo-oficial.svg": oficial_svg,
        "logo-lateral.svg": oficial_svg,
        "logo-montanha.png": tmp / "logo-montanha.png",
        "logo-montanha.svg": mont_svg,
        "logo-montanha-branco.svg": cor_svg(mont_svg, "#FFFFFF"),
        "logo-montanha-preto.svg": cor_svg(mont_svg, "#111111"),
    }

    passo(f"artes/marca ({len(alvos_marca)} arquivos)")
    for nome in alvos_marca:
        print(f"  {nome}")

    larg = 600
    estudio_png = completa.resize((larg, round(completa.height * larg / completa.width)), Image.LANCZOS)
    passo(f"Estúdio: LOGO_B64 do index.html ← logo completa {estudio_png.size[0]}×{estudio_png.size[1]}")

    site_marca = SITE_ARTES / "marca"
    passo(f"site: {site_marca} (backup antes) + favicons")
    site_ok = site_marca.exists()
    if not site_ok:
        print("  ⚠ pasta não encontrada, este passo vai ser pulado")

    contagens = sorted(DADOS.glob("contagem-*.json")) if DADOS.exists() else []
    passo(f"render: {len(contagens)} contagem(ns)" + (" (pulado: --sem-render)" if arg.sem_render else ""))
    for c in contagens:
        print(f"  {c.name}")

    if arg.simular:
        print("\n--simular: nada foi gravado. Rode sem a opção para aplicar.")
        return

    # ---- grava: artes/marca
    # rodar de novo com a logo atual (entrada = o próprio original) não copia sobre si mesma
    if origem != (MARCA / "logo-oficial-original.png").resolve():
        shutil.copy2(origem, MARCA / "logo-oficial-original.png")
    for nome, conteudo in alvos_marca.items():
        if conteudo is None:
            continue
        if isinstance(conteudo, Path):
            shutil.copy2(conteudo, MARCA / nome)
        else:
            (MARCA / nome).write_text(conteudo, encoding="utf-8")
    print("\n✓ artes/marca gravado")

    # ---- Estúdio
    buf = io.BytesIO()
    estudio_png.save(buf, "PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    html = ESTUDIO.read_text(encoding="utf-8")
    html, n = re.subn(r'const LOGO_B64="[^"]*"', f'const LOGO_B64="{b64}"', html)
    if n != 1:
        sys.exit("✗ não achei LOGO_B64 no index.html (o Estúdio mudou de forma?)")
    ESTUDIO.write_text(html, encoding="utf-8")
    print("✓ Estúdio: LOGO_B64 trocado (no ar só depois de publicar no Pages)")

    # ---- site
    if site_ok:
        bkp = site_marca / f"_anterior-{datetime.now():%Y%m%d-%H%M}"
        bkp.mkdir()
        for f in site_marca.glob("logo-montanha*"):
            shutil.copy2(f, bkp / f.name)
        g = montanha.resize((1000, round(montanha.height * 1000 / montanha.width)), Image.LANCZOS)
        g.save(site_marca / "logo-montanha.png")
        p300 = montanha.resize((300, round(montanha.height * 300 / montanha.width)), Image.LANCZOS)
        p300.save(site_marca / "logo-montanha-300.png")
        buf = io.BytesIO()
        p300.save(buf, "PNG")
        (site_marca / "logo-montanha.b64").write_text(base64.b64encode(buf.getvalue()).decode(), encoding="utf-8")
        (site_marca / "logo-montanha.svg").write_text(mont_svg, encoding="utf-8")
        (site_marca / "logo-montanha-branco.svg").write_text(cor_svg(mont_svg, "#FFFFFF"), encoding="utf-8")
        (site_marca / "logo-montanha-preto.svg").write_text(cor_svg(mont_svg, "#111111"), encoding="utf-8")
        print(f"✓ site: montanha atualizada (backup em {bkp.name})")
        fav = SITE_REPO / "marca" / "gerar-favicon.py"
        if fav.exists():
            r = subprocess.run([sys.executable, str(fav)], capture_output=True, text=True, encoding="utf-8", env=AMBIENTE)
            print("✓ favicons regerados" if r.returncode == 0 else f"⚠ favicon falhou: {r.stderr.strip()[:300]}")
        tokens = SITE_REPO / "design" / "lib" / "tokens.mjs"
        if tokens.exists():
            tt = tokens.read_text(encoding="utf-8")
            tt, n = re.subn(r"LOGO_MONTANHA_PROPORCAO = [^;]+;",
                            f"LOGO_MONTANHA_PROPORCAO = {p300.width} / {p300.height};"
                            f" // {p300.width / p300.height:.2f}, gerado por atualizar-logo.py", tt)
            if n == 1:
                tokens.write_text(tt, encoding="utf-8")
                print(f"✓ site: LOGO_MONTANHA_PROPORCAO = {p300.width} / {p300.height}")
            else:
                print("  ⚠ não achei LOGO_MONTANHA_PROPORCAO em tokens.mjs")

    # ---- render
    if not arg.sem_render:
        for c in contagens:
            r = subprocess.run(["node", str(AQUI / "contagem.mjs"), c.name],
                               capture_output=True, text=True, encoding="utf-8", cwd=REPO, env=AMBIENTE)
            print(f"✓ render {c.name}" if r.returncode == 0 else f"✗ render {c.name}: {r.stderr.strip()[:300]}")

    # ---- o que sobrou no lockup antigo
    passo("ainda apontam para o lockup antigo (logo-desbravando*)")
    achou = False
    for f in sorted((ARTES / "templates").glob("*.mjs")):
        for i, linha in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if "logo-desbravando" in linha and "/*" not in linha and not linha.strip().startswith(("*", "//")):
                print(f"  {f.name}:{i}")
                achou = True
    if not achou:
        print("  nada")

    print("\nFalta, e é com o Pedro: conferir as peças, rodar a esteira /qa, publicar o Estúdio "
          "no Pages e fazer o commit.")


if __name__ == "__main__":
    main()
