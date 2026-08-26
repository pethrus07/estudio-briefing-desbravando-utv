"""Converte um texto em curvas SVG (path), usando as fontes da marca.

    python texto-para-svg.py Anton-Regular.ttf "PRODUÇÃO"
    -> {"d": "M...", "viewBox": "0 -1071 3847 1071", "largura": 3847, "altura": 1071}

Por que curvas e não <text>: arte de estampa vai para uma estamparia que não tem a
fonte. Texto convertido em path imprime igual em qualquer lugar — é o "converter para
curvas" que toda gráfica pede. As coordenadas saem em milésimos de em, com a linha de
base em y=0 e o eixo Y do SVG (para baixo).
"""

import json
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont

FONTES = Path(__file__).resolve().parent.parent / "fontes"


def main() -> None:
    fonte = TTFont(FONTES / sys.argv[1])
    texto = sys.argv[2]

    upem = fonte["head"].unitsPerEm
    escala = 1000 / upem
    cmap = fonte.getBestCmap()
    hmtx = fonte["hmtx"]
    glifos = fonte.getGlyphSet()

    caneta = SVGPathPen(glifos, ntos=lambda v: f"{v:.1f}")
    x = 0.0
    y_min = 0.0
    y_max = 0.0

    for ch in texto:
        nome = cmap.get(ord(ch))
        if nome is None:
            continue
        # escala uniforme + flip vertical (fonte cresce para cima, SVG para baixo)
        transformada = TransformPen(caneta, Transform(escala, 0, 0, -escala, x, 0))
        glifos[nome].draw(transformada)

        limites = BoundsPen(glifos)
        glifos[nome].draw(limites)
        if limites.bounds:
            y_min = min(y_min, -limites.bounds[3] * escala)
            y_max = max(y_max, -limites.bounds[1] * escala)

        x += hmtx[nome][0] * escala

    altura = y_max - y_min
    print(
        json.dumps(
            {
                "d": caneta.getCommands(),
                "viewBox": f"0 {y_min:.1f} {x:.1f} {altura:.1f}",
                "largura": round(x, 1),
                "altura": round(altura, 1),
            }
        )
    )


if __name__ == "__main__":
    main()
