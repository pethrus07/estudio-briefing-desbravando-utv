"""Mede a largura de um texto numa das fontes da marca, em unidades de `em`.

    python medir-texto.py Anton-Regular.ttf "PRODUÇÃO"
    -> {"largura_em": 3.5824, "altura_caixa_em": 0.859}

Serve para dimensionar estampa: sabendo a largura em `em`, o font-size que faz o
texto fechar exatamente numa medida física é `medida / largura_em`. Sem isso a
alternativa seria esticar o texto (textLength), que deforma as letras.
"""

import json
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont

FONTES = Path(__file__).resolve().parent.parent / "fontes"


def main() -> None:
    fonte = TTFont(FONTES / sys.argv[1])
    texto = sys.argv[2]

    upem = fonte["head"].unitsPerEm
    cmap = fonte.getBestCmap()
    hmtx = fonte["hmtx"]
    glifos = fonte.getGlyphSet()

    largura = 0
    topo = 0
    for ch in texto:
        nome = cmap.get(ord(ch))
        if nome is None:
            continue
        largura += hmtx[nome][0]
        pen = BoundsPen(glifos)
        glifos[nome].draw(pen)
        if pen.bounds:
            topo = max(topo, pen.bounds[3])

    print(json.dumps({"largura_em": largura / upem, "altura_caixa_em": topo / upem}))


if __name__ == "__main__":
    main()
