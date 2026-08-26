"""Converte um logo preto-sobre-branco em logo branco com fundo transparente.

    python logo-para-branco.py entrada.png marca/saida.png

Por que: o arquivo do patrocinador vem preto sobre fundo branco. Sobre peça escura,
`filter: invert()` resolveria a cor mas manteria o retângulo de fundo. Aqui o alpha
vira o inverso da luminância — o traço fica opaco e branco, o papel desaparece.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image


def main() -> None:
    entrada = Path(sys.argv[1])
    saida = Path(sys.argv[2])

    img = Image.open(entrada).convert("RGB")
    a = np.asarray(img).astype(np.float32)

    # luminância perceptual; 0 = traço, 255 = papel
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    alpha = np.clip(255.0 - lum, 0, 255).astype(np.uint8)

    branco = np.full(a.shape, 255, dtype=np.uint8)
    rgba = np.dstack([branco, alpha])

    saida.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode="RGBA").save(saida)

    opacos = int((alpha > 8).sum())
    print(f"{saida}  {img.width}x{img.height}  {opacos} px de traço")


if __name__ == "__main__":
    main()
