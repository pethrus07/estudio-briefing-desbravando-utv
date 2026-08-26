"""Amplia um logo PNG para uso em peça grande (bandeira, lona, painel).

    python ampliar-logo.py entrada.png saida.png [fator]

Não é vetorização: é ampliação com tratamento de borda. O logotipo completo do
Desbravando só existe em raster (o SVG do repo é apenas o ícone da montanha), e a
2,5 m de largura o PNG de origem sairia serrilhado.

O truque é trabalhar o canal alfa: LANCZOS amplia, e uma curva de contraste no alfa
recupera a borda dura da letra, mantendo um fio de antisserrilhado para não escadear.
Cor sólida é preservada porque o logo é chapado.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image


def main() -> None:
    entrada = Path(sys.argv[1])
    saida = Path(sys.argv[2])
    fator = int(sys.argv[3]) if len(sys.argv) > 3 else 8

    img = Image.open(entrada).convert("RGBA")
    grande = img.resize((img.width * fator, img.height * fator), Image.LANCZOS)

    a = np.asarray(grande).astype(np.float32) / 255.0
    alfa = a[..., 3]

    # curva de contraste no alfa: borda volta a ser borda, sobra ~1 px de transição
    k = 6.0
    alfa = np.clip((alfa - 0.5) * k + 0.5, 0, 1)

    # cor chapada: onde há tinta, força a cor mais frequente (evita halo cinza)
    tinta = alfa > 0.5
    if tinta.any():
        cor = np.median(a[..., :3][tinta], axis=0)
        a[..., :3] = cor
    a[..., 3] = alfa

    Image.fromarray((a * 255).astype(np.uint8), mode="RGBA").save(saida)
    print(f"{saida.name}  {grande.width}x{grande.height}  ({fator}x)")


if __name__ == "__main__":
    main()
