"""PDF -> PNG na resolução pedida, e conferência das fontes embutidas.

    python pdf-para-png.py <arquivo.pdf> <dpi> <prefixo> [alpha]

`alpha` preserva a transparência (arte de estampa em branco sobre fundo vazio).

A conferência existe porque o Chrome embute fonte variável como Type3 (texto
vira desenho). Se aparecer Type3 aqui, o PDF não serve para a gráfica.
"""

import sys
from pathlib import Path

import pymupdf


def main() -> None:
    pdf_path = Path(sys.argv[1])
    dpi = int(sys.argv[2])
    prefixo = sys.argv[3]
    alpha = len(sys.argv) > 4 and sys.argv[4] == "alpha"
    saida = pdf_path.parent

    doc = pymupdf.open(pdf_path)
    zoom = dpi / 72

    tipos = set()
    for pagina in doc:
        for fonte in pagina.get_fonts(full=False):
            tipos.add(fonte[2])

    for i, pagina in enumerate(doc, start=1):
        pix = pagina.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=alpha)
        nome = f"{prefixo}.png" if doc.page_count == 1 else f"{prefixo}-{i:02d}.png"
        pix.save(saida / nome)
        print(f"  {nome}  {pix.width}×{pix.height}px")

    ruins = sorted(t for t in tipos if t == "Type3")
    marca = "ATENÇÃO — Type3 (texto virou desenho)" if ruins else "ok"
    print(f"  fontes embutidas: {', '.join(sorted(tipos)) or 'nenhuma'} — {marca}")


if __name__ == "__main__":
    main()
