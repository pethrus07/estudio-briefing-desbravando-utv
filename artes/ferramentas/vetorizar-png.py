"""Vetoriza um PNG chapado (logo, símbolo) em curvas SVG de verdade.

    python vetorizar-png.py entrada.png saida.svg [suavizacao]

Por que existe: o logotipo com a escrita só existe em raster. Dentro de um PDF isso
vira imagem, e a gráfica vê serrilhado ao dar zoom — foi exatamente a reclamação de
21/08/2026. Aqui o contorno do canal alfa vira `path`, então a arte escala sem limite.

Como funciona:
  1. Lê o canal alfa e sobe a resolução (a borda antisserrilhada carrega a informação
     de subpixel que dá contorno macio).
  2. `find_contours` no nível 0.5 do alfa — marching squares com interpolação, então o
     contorno passa *entre* os pixels, não em degraus.
  3. Douglas-Peucker com tolerância pequena remove pontos redundantes.
  4. Cada contorno vira um subpath fechado; `fill-rule="evenodd"` abre os buracos das
     letras (o O, o D, o A).
"""

import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from skimage.measure import find_contours


def douglas_peucker(pontos: np.ndarray, tol: float) -> np.ndarray:
    """Simplificação clássica, iterativa para não estourar recursão em contorno longo."""
    if len(pontos) < 3:
        return pontos
    manter = np.zeros(len(pontos), dtype=bool)
    manter[0] = manter[-1] = True
    pilha = [(0, len(pontos) - 1)]
    while pilha:
        ini, fim = pilha.pop()
        if fim <= ini + 1:
            continue
        a, b = pontos[ini], pontos[fim]
        seg = b - a
        norma = np.hypot(*seg)
        trecho = pontos[ini + 1 : fim]
        if norma == 0:
            dist = np.hypot(*(trecho - a).T)
        else:
            # produto vetorial 2D na mão: numpy 2.x removeu np.cross para 2 dimensões
            v = trecho - a
            dist = np.abs(seg[0] * v[:, 1] - seg[1] * v[:, 0]) / norma
        i = int(np.argmax(dist))
        if dist[i] > tol:
            corte = ini + 1 + i
            manter[corte] = True
            pilha.append((ini, corte))
            pilha.append((corte, fim))
    return pontos[manter]


def main() -> None:
    entrada = Path(sys.argv[1])
    saida = Path(sys.argv[2])
    tol = float(sys.argv[3]) if len(sys.argv) > 3 else 0.35

    img = Image.open(entrada).convert("RGBA")
    escala = 2
    grande = img.resize((img.width * escala, img.height * escala), Image.LANCZOS)
    alfa = np.asarray(grande).astype(np.float32)[..., 3] / 255.0

    # moldura de zero: contorno que toca a borda da imagem fecha corretamente
    alfa = np.pad(alfa, 1, mode="constant", constant_values=0.0)

    contornos = find_contours(alfa, 0.5)
    if not contornos:
        raise SystemExit("nenhum contorno encontrado — a imagem tem canal alfa?")

    partes = []
    total_pontos = 0
    for c in contornos:
        c = douglas_peucker(c, tol)
        if len(c) < 3:
            continue
        total_pontos += len(c)
        # find_contours devolve (linha, coluna) = (y, x); o SVG quer (x, y)
        pts = [( (x - 1) / escala, (y - 1) / escala ) for y, x in c]
        d = f"M{pts[0][0]:.2f} {pts[0][1]:.2f}"
        d += "".join(f"L{x:.2f} {y:.2f}" for x, y in pts[1:])
        partes.append(d + "Z")

    caminho = "".join(partes)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {img.width} {img.height}" '
        f'role="img" aria-label="{entrada.stem}">\n'
        f'  <path fill="currentColor" fill-rule="evenodd" d="{caminho}"/>\n'
        f"</svg>\n"
    )
    saida.parent.mkdir(parents=True, exist_ok=True)
    io.open(saida, "w", encoding="utf-8").write(svg)

    print(
        f"{saida.name}  {len(partes)} contorno(s) · {total_pontos} pontos · "
        f"{round(len(svg)/1024)} kB · viewBox {img.width}x{img.height}"
    )


if __name__ == "__main__":
    main()
