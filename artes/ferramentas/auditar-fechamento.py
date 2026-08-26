"""Audita o PDF do fechamento contra os dados. Sai com código 1 se reprovar.

    python auditar-fechamento.py saida/fechamento.pdf dados/fechamento-2026-08.json

Por que existe: documento de cobrança errado custa credibilidade, e o erro típico não é
de conta — é de texto que envelheceu. Um valor antigo esquecido numa frase, um total que
não bate com a soma das linhas, uma folha em branco no fim. Nada disso aparece olhando a
tela; aparece lendo o PDF.

O que reprova:

  1. **Total declarado ≠ soma dos blocos.** Recalcula do JSON e procura o número no texto.
  2. **Valor no PDF que não existe nos dados.** Todo "R$ n" extraído do PDF tem de ser um
     valor do JSON, uma soma de bloco, ou o total. Valor órfão é texto velho.
  3. **Frase proibida.** Termos do modelo antigo que não podem sobreviver ("reajuste",
     valores de tabelas anteriores).
  4. **Fonte não embutida ou Type3.** Peso que o CSS pede e a fonte não tem faz o Chrome
     fabricar negrito e rasterizar o trecho.
  5. **Folha em branco ou quase.** 297 mm de página arredonda para 842,4 pt e empurra o
     rodapé para uma folha extra — o defeito clássico deste pipeline.
"""

import io
import json
import re
import sys
from pathlib import Path

import fitz

PROIBIDAS = [
    "reajuste",
    "menos simples",
    "R$ 570",
    "R$ 615",
    "R$ 600",
    "20 simples",
    "preparação vetorial para gráfica",
]


def _glifos_da_fonte(doc, nome: str) -> str:
    """Quais caracteres estão desenhados com esta fonte — para o erro dizer o culpado."""
    achados = []
    for pagina in doc:
        for b in pagina.get_text("rawdict")["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    if s["font"] in nome or nome.endswith(s["font"]):
                        for c in s["chars"]:
                            t = f"{c['c']!r} (U+{ord(c['c']):04X})"
                            if t not in achados:
                                achados.append(t)
    return ", ".join(achados[:6])


def valores_esperados(d: dict) -> set[int]:
    """Todo número em reais que pode aparecer legitimamente no documento."""
    v = set()
    base = [i["valor"] for i in d["baseFixa"]["itens"]]
    pecas = [p["valor"] for p in d["pecas"]]
    ajustes = [i["valor"] for i in d["ajustes"]["itens"]]
    projetos = [i["valor"] for i in d["projetos"]["itens"]]
    v |= set(base) | set(pecas) | set(ajustes) | set(projetos)
    v.add(d["modulo"]["valor"])
    v.add(d["ajustes"]["valorUnitario"])
    for i in d["projetos"]["itens"]:
        if i.get("total"):
            v.add(i["total"])
    # os subtotais e o total, que o template calcula
    v.add(sum(base))
    v.add(sum(pecas))
    v.add(sum(ajustes))
    v.add(sum(projetos))
    v.add(
        sum(base) + sum(pecas) + sum(ajustes) + sum(projetos) + d["modulo"]["valor"]
    )
    v.add(0)  # "R$ 0" das linhas sem cobrança
    # valores citados dentro do texto das regras (ex.: a taxa de R$ 15 do contrato)
    for r in d["regra"]:
        for n in re.findall(r"R\$\s*([\d.]+)", r):
            v.add(int(n.replace(".", "")))
    return v


def main() -> None:
    pdf = Path(sys.argv[1])
    dados = json.load(io.open(sys.argv[2], encoding="utf-8"))
    doc = fitz.open(pdf)
    texto = "\n".join(p.get_text() for p in doc)
    plano = texto.replace(" ", " ")

    falhas: list[str] = []
    avisos: list[str] = []

    # ---------- 1 · total ----------
    esperado = valores_esperados(dados)
    base = sum(i["valor"] for i in dados["baseFixa"]["itens"])
    pecas = sum(p["valor"] for p in dados["pecas"])
    ajustes = sum(i["valor"] for i in dados["ajustes"]["itens"])
    projetos = sum(i["valor"] for i in dados["projetos"]["itens"])
    total = base + pecas + ajustes + projetos + dados["modulo"]["valor"]

    fmt = f"R$ {total:,}".replace(",", ".")
    if fmt not in plano:
        falhas.append(f"o total calculado ({fmt}) não aparece no PDF")

    # ---------- 2 · valor órfão ----------
    achados = {int(n.replace(".", "")) for n in re.findall(r"R\$\s*([\d.]+)", plano)}
    orfaos = sorted(achados - esperado)
    if orfaos:
        falhas.append(
            "valor no PDF que não existe nos dados (texto velho?): "
            + ", ".join(f"R$ {o}" for o in orfaos)
        )

    # ---------- 3 · frase proibida ----------
    for p in PROIBIDAS:
        if p.lower() in plano.lower():
            falhas.append(f'frase do modelo antigo sobreviveu: "{p}"')

    # ---------- 4 · fontes: lista BRANCA ----------
    # Lista negra não serve: a primeira versão deste auditor procurava
    # Segoe/Arial/Times/Courier e deixou passar Consolas, embutida só para a seta
    # "→" (U+2192), que está fora do subset latino. Só estas três podem aparecer.
    PERMITIDAS = ("SpaceGrotesk", "PlusJakartaSans", "JetBrainsMono")
    for i, pagina in enumerate(doc, 1):
        for f in pagina.get_fonts():
            tipo, nome = f[2], f[3]
            familia = nome.split("+")[-1]
            if tipo == "Type3":
                falhas.append(f"pág. {i}: {nome} saiu como Type3 (negrito fabricado)")
            if not familia.startswith(PERMITIDAS):
                fora = _glifos_da_fonte(doc, nome)
                falhas.append(
                    f"pág. {i}: fonte estranha {familia} embutida"
                    + (f" para {fora}" if fora else "")
                    + " — glifo fora do subset das fontes RYZE"
                )

    # ---------- 5 · folha vazia e medida ----------
    for i, pagina in enumerate(doc, 1):
        l = pagina.rect.width / 72 * 25.4
        a = pagina.rect.height / 72 * 25.4
        if abs(l - 210) > 0.5 or abs(a - 296) > 0.5:
            falhas.append(f"pág. {i}: {l:.1f} × {a:.1f} mm (esperado 210 × 296)")
        if len(pagina.get_text().strip()) < 120:
            falhas.append(f"pág. {i}: praticamente vazia — conteúdo transbordou")

    # ---------- conferências que valem aviso, não reprovação ----------
    n_artes = sum(len(p["artes"]) for p in dados["pecas"])
    if f"{n_artes} artes" not in plano:
        avisos.append(f'o documento não diz "{n_artes} artes" em nenhum lugar')
    for p in dados["pecas"]:
        if p["nome"].split("—")[0].strip()[:18] not in plano:
            avisos.append(f'peça ausente do PDF: {p["nome"]}')

    # ---------- veredito ----------
    print(f"auditoria do fechamento · {doc.page_count} página(s) · total R$ {total}")
    print(
        f"  blocos: base {base} · peças {pecas} ({n_artes} artes) · ajustes {ajustes} "
        f"· módulo {dados['modulo']['valor']} · projetos {projetos}"
    )
    for a in avisos:
        print(f"  aviso: {a}")
    if falhas:
        for f in falhas:
            print(f"  REPROVADO: {f}")
        raise SystemExit(1)
    print("  aprovado: total confere, nenhum valor órfão, nenhuma fonte fabricada")


if __name__ == "__main__":
    main()
