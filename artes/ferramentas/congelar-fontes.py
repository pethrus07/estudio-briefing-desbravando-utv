"""Congela o Archivo variável nos pesos estáticos 400 / 600 / 700.

    python artes/ferramentas/congelar-fontes.py

Por que: o Chrome headless embute fonte variável no PDF como Type3 (texto vira
bitmap/desenho, perde seleção e nitidez na gráfica). Só sai de variável quando
TODOS os eixos são fixados — o Archivo tem dois (`wght` e `wdth`); fixar apenas o
peso deixa `fvar`/`gvar` no arquivo e o Type3 volta.
"""

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONTES = Path(__file__).resolve().parent.parent / "fontes"
PESOS = {400: "Regular", 600: "SemiBold", 700: "Bold"}


def main() -> None:
    origem = FONTES / "Archivo.ttf"
    if not origem.exists():
        raise SystemExit(f"não encontrei {origem} — rode antes o extrair-marca.mjs")

    eixos = {a.axisTag: a.defaultValue for a in TTFont(origem)["fvar"].axes}

    for peso, nome in PESOS.items():
        fonte = TTFont(origem)
        instancer.instantiateVariableFont(fonte, {**eixos, "wght": peso}, inplace=True)
        saida = FONTES / f"Archivo-{nome}.ttf"
        fonte.save(saida)
        restou = [t for t in ("fvar", "gvar", "HVAR", "avar") if t in fonte]
        estado = f"AINDA VARIÁVEL: {restou}" if restou else "estática"
        print(f"{saida.name:<26} {saida.stat().st_size / 1024:6.1f} kB  (wght {peso})  {estado}")


if __name__ == "__main__":
    main()
