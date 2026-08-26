"""Prova que um PDF é 100% vetor. Sai com código 1 se não for.

    python auditar-vetor.py arquivo.pdf [outro.pdf ...]

Existe por causa da reclamação da gráfica de 21/08/2026: serrilhado ao dar zoom.
Serrilhado num PDF só tem uma origem — algum elemento é imagem. Então em vez de
confiar no olho, o pacote roda esta auditoria e ABORTA a entrega se ela reprovar.

O que reprova:
  · imagem embutida     — qualquer uma, é a causa direta do serrilhado
  · fonte embutida      — significa texto não convertido em curvas; a gráfica sem a
                          fonte instalada vê substituição, e Type3 é texto virado
                          desenho de baixa qualidade
  · página fora de medida
"""

import sys
from pathlib import Path

import fitz

MEDIDA_MM = (156.0, 156.0)
TOLERANCIA = 0.3


def main() -> None:
    arquivos = [Path(a) for a in sys.argv[1:]]
    if not arquivos:
        raise SystemExit("uso: auditar-vetor.py arquivo.pdf [...]")

    reprovados = []
    for caminho in arquivos:
        doc = fitz.open(caminho)
        problemas = []
        if doc.page_count != 1:
            problemas.append(f"{doc.page_count} páginas (esperado 1)")
        pagina = doc[0]

        imagens = pagina.get_images(full=True)
        if imagens:
            problemas.append(f"{len(imagens)} imagem(ns) embutida(s)")

        fontes = pagina.get_fonts()
        if fontes:
            nomes = ", ".join(f"{f[3]} ({f[2]})" for f in fontes)
            problemas.append(f"{len(fontes)} fonte(s) embutida(s): {nomes}")

        l = pagina.rect.width / 72 * 25.4
        a = pagina.rect.height / 72 * 25.4
        if abs(l - MEDIDA_MM[0]) > TOLERANCIA or abs(a - MEDIDA_MM[1]) > TOLERANCIA:
            problemas.append(f"página {l:.1f}×{a:.1f} mm (esperado {MEDIDA_MM[0]}×{MEDIDA_MM[1]})")

        if problemas:
            reprovados.append((caminho.name, problemas))
        doc.close()

    print(f"auditoria de vetor · {len(arquivos)} arquivo(s)")
    if reprovados:
        for nome, problemas in reprovados:
            print(f"  REPROVADO  {nome}")
            for p in problemas:
                print(f"             · {p}")
        raise SystemExit(1)

    print("  aprovado · 0 imagem, 0 fonte embutida, medida correta em todos")


if __name__ == "__main__":
    main()
