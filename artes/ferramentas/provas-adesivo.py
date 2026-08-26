"""Provas visuais do pacote de adesivos.

    python provas-adesivo.py PASTA_DO_PACOTE [pdf_antigo_para_comparar]

Gera dois PNG dentro da pasta:

  CONFERENCIA-ZOOM.png  o mesmo trecho do logotipo em zoom de 2400 dpi, antes e
                        depois. É a resposta visual à reclamação da gráfica: no
                        antigo a letra tem degrau, no novo não.
  CONTATO.png           os números em miniatura, preto e branco, para o cliente
                        aprovar a série de uma olhada.
"""

import sys
from pathlib import Path

import fitz

K = 72 / 25.4  # mm -> pontos


def recorte(x, y, w, h):
    return fitz.Rect(x * K, y * K, (x + w) * K, (y + h) * K)


def conferencia_zoom(pasta: Path, antigo: Path | None) -> None:
    novo = pasta / "1-PRETO" / "adesivo-preto-01.pdf"
    painel = (1300, 975)
    # Trecho fechado no "DES" do logotipo, onde o degrau do raster aparecia.
    # Recorte por versão: no layout antigo a marca era menor e ficava ~2 mm mais
    # abaixo, então um retângulo único cairia em lugares diferentes das duas e a
    # comparação deixaria de comparar a mesma coisa.
    pares = []
    if antigo and antigo.exists():
        pares.append(("ANTES · logotipo em imagem", antigo, recorte(63.5, 22.5, 12, 9)))
    pares.append(("DEPOIS · logotipo em curvas", novo, recorte(62, 20, 12, 9)))

    saida = fitz.open()
    pg = saida.new_page(width=painel[0] * len(pares) + 30 * (len(pares) + 1), height=painel[1] + 70)
    pg.draw_rect(pg.rect, color=None, fill=(0.42, 0.42, 0.42))
    for i, (rotulo, caminho, area) in enumerate(pares):
        pm = fitz.open(caminho)[0].get_pixmap(clip=area, dpi=2400)
        x = 30 + i * (painel[0] + 30)
        dest = fitz.Rect(x, 50, x + painel[0], 50 + painel[1])
        pg.insert_image(dest, pixmap=pm)
        pg.draw_rect(dest, color=(1, 1, 1), width=1)
        pg.insert_text((x, 36), f"{rotulo} · zoom 2400 dpi", fontsize=20, color=(1, 1, 1))
    pg.get_pixmap(dpi=96).save(pasta / "CONFERENCIA-ZOOM.png")
    print("  CONFERENCIA-ZOOM.png")


def contato(pasta: Path) -> None:
    pretos = sorted((pasta / "1-PRETO").glob("*.pdf"))
    brancos = sorted((pasta / "2-BRANCO").glob("*.pdf"))
    if not pretos:
        return
    colunas = 10
    lado = 150
    folga = 8
    linhas_pretos = -(-len(pretos) // colunas)
    linhas_brancos = -(-len(brancos) // colunas)
    altura = 40 + linhas_pretos * (lado + folga) + 34 + linhas_brancos * (lado + folga) + 20

    saida = fitz.open()
    pg = saida.new_page(width=colunas * (lado + folga) + folga, height=altura)
    pg.draw_rect(pg.rect, color=None, fill=(0.55, 0.55, 0.55))

    def bloco(arquivos, titulo, y0):
        pg.insert_text((folga, y0 - 10), titulo, fontsize=16, color=(1, 1, 1))
        for i, f in enumerate(arquivos):
            lin, col = divmod(i, colunas)
            x = folga + col * (lado + folga)
            y = y0 + lin * (lado + folga)
            pm = fitz.open(f)[0].get_pixmap(dpi=42)
            pg.insert_image(fitz.Rect(x, y, x + lado, y + lado), pixmap=pm)
        return y0 + (-(-len(arquivos) // colunas)) * (lado + folga)

    fim = bloco(pretos, f"PRETO · {len(pretos)} peças", 40)
    if brancos:
        bloco(brancos, f"BRANCO · {len(brancos)} peças", fim + 34)
    pg.get_pixmap(dpi=72).save(pasta / "CONTATO.png")
    print("  CONTATO.png")


def main() -> None:
    pasta = Path(sys.argv[1])
    antigo = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    conferencia_zoom(pasta, antigo)
    contato(pasta)


if __name__ == "__main__":
    main()
