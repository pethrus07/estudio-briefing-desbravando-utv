"""Audita o PDF do acordo de parceria contra os dados. Sai com código 1 se reprovar.

    python auditar-acordo.py saida/acordo-2026-10.pdf dados/acordo-2026-10.json

Terceiro auditor da família (fechamento, proposta, acordo), e o que corre o risco mais caro.
O fechamento erra em dinheiro e dá para corrigir na fatura seguinte. A proposta erra em
argumento e dá para reapresentar. **O acordo erra em ESCOPO**, e escopo errado só aparece
daqui a dois meses, quando o cliente pede de boa-fé uma coisa que ele leu como incluída e que
não estava — e aí já não há documento para apelar, porque o documento é este.

Por isso as checagens daqui olham a COERÊNCIA do escopo, não só os números:

  1. **Item em dois lugares.** Nada pode estar no "dentro" e no "fora" ao mesmo tempo. É o
     defeito clássico de documento de escopo e o mais difícil de ver lendo.
  2. **Catálogo do tamanho anunciado.** Se o texto diz dez peças, têm de existir dez, e as dez
     têm de aparecer no PDF pelo nome. Peça que some da lista é peça que vira discussão.
  3. **Valor órfão.** Todo "R$ n" do PDF sai dos dados ou é o valor do acordo.
  4. **Número interno ou de rodada anterior vazado.** Os valores da negociação que morreram no
     caminho (790, 800, 350) e os custos internos (280, 60 dólares) não podem aparecer: o
     documento é o acordo, não o histórico da disputa.
  5. **As três regras do preço estão no PDF.** São elas que sustentam o valor; se uma sumir na
     diagramação, o acordo fica sem a contrapartida e vira só desconto.
  6. **Fonte Type3, folha fora de 210 × 296 mm, folha vazia** — os defeitos do pipeline.
"""

import io
import json
import re
import sys
import unicodedata
from pathlib import Path

import fitz

# Números que pertencem a rodadas anteriores ou à cozinha interna. Nenhum pode chegar ao
# documento que fecha o acordo.
PROIBIDOS = {
    "R$ 790": "o valor da proposta anterior, já superada",
    "R$ 800": "o valor citado de cabeça na reunião de 13/10",
    "R$ 350": "a primeira contraproposta do cliente",
    "R$ 280": "custo interno de infraestrutura, não conferido",
    "60 dólares": "custo interno de infraestrutura, não conferido",
}


def normaliza(s: str) -> str:
    """Sem acento, sem caixa, espaço colapsado — para comparar item com item."""
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", re.sub(r"\s+", " ", s)).strip()


def palavras_fortes(s: str) -> set[str]:
    """As palavras que carregam sentido — para achar item repetido entre dentro e fora."""
    vazias = {
        "o", "a", "os", "as", "de", "do", "da", "dos", "das", "e", "em", "no", "na", "nos",
        "nas", "um", "uma", "por", "para", "com", "sem", "que", "ja", "ao", "aos", "mais",
        "cada", "alem", "deste", "desta", "mesmo", "mesma", "vocs", "voces", "nosso", "nossa",
    }
    return {p for p in normaliza(s).split() if len(p) > 3 and p not in vazias}


def textos(no):
    if isinstance(no, str):
        yield no
    elif isinstance(no, dict):
        for v in no.values():
            yield from textos(v)
    elif isinstance(no, list):
        for v in no:
            yield from textos(v)


def reais(texto: str) -> set[int]:
    return {int(n.replace(".", "")) for n in re.findall(r"R\$\s*([\d.]+)", texto)}


def main() -> None:
    pdf = Path(sys.argv[1])
    d = json.load(io.open(sys.argv[2], encoding="utf-8"))
    doc = fitz.open(pdf)
    plano = "\n".join(p.get_text() for p in doc).replace(" ", " ")
    prosa = re.sub(r"\s+", " ", plano)

    falhas: list[str] = []
    avisos: list[str] = []

    # ---------- 1 · item em dois lugares ----------
    # Dois itens que compartilham 2+ palavras fortes estao falando da mesma coisa. Um limiar
    # menor acusaria "peca complexa" contra "peca fora do catalogo", que sao coisas distintas.
    #
    # Mas repetir o item nos dois lados nem sempre e defeito: "duas rodadas inclusas" de um
    # lado e "rodada alem das duas" do outro e exatamente como escopo deve ser escrito -- sao
    # as duas metades de um LIMITE. A primeira versao desta checagem reprovou esse par, e
    # afrouxa-la seria perder a checagem inteira. Entao ela passou a cobrar a condicao que
    # torna o par legitimo: o lado de FORA tem de se marcar como excedente, e o lado de
    # DENTRO tem de dizer QUANTO esta incluso. Excedente precificado sobre quantidade que
    # ninguem declarou e o defeito de escopo mais caro que existe -- e agora ele reprova.
    # "fora d" entra com a preposicao junto, nao como "fora" solto: queremos a FRASE de
    # fronteira ("fora do catalogo", "fora da expedicao"), nao a palavra em qualquer posicao.
    EXCEDENTE = ("adicional", "alem", "excedente", "segunda", "extra", "acima", "fora d")
    LIMITE = ("um ", "uma ", "dois", "duas", "tres", "dez", "por ciclo", "por mes", "por peca")
    for dentro in d["dentro"]["itens"]:
        pd = palavras_fortes(dentro)
        nd = normaliza(dentro)
        for item in d["fora"]["itens"] + d["avulsos"]["itens"]:
            comum = pd & palavras_fortes(item["nome"])
            if len(comum) < 2:
                continue
            nf = normaliza(item["nome"])
            if not any(m in nf for m in EXCEDENTE):
                falhas.append(
                    f'"{item["nome"]}" aparece no DENTRO e no FORA '
                    f'(em comum: {", ".join(sorted(comum))}) — escopo ambíguo'
                )
            elif not any(m in nd + " " for m in LIMITE):
                falhas.append(
                    f'"{item["nome"]}" é cobrado como excedente, mas o item de dentro '
                    f'("{dentro}") não diz quanto está incluso — excedente sem limite declarado'
                )

    # ---------- 2 · catálogo ----------
    pecas = d["catalogo"]["pecas"]
    if len(pecas) != d["catalogoQtd"]:
        falhas.append(f"o catálogo tem {len(pecas)} peças e o documento anuncia {d['catalogoQtd']}")
    for p in pecas:
        if normaliza(p["nome"]) not in normaliza(prosa):
            falhas.append(f'peça do catálogo ausente do PDF: {p["nome"]}')

    # ---------- 2b · o incentivo aponta para o lado certo ----------
    # A tabela de avulsos existe para que o pacote seja o caminho obvio. Se um item isolado
    # sair por menos do que a peca sai dentro do pacote, o documento esta dizendo o contrario
    # do que afirma, e o cliente acha o furo antes de nos. O preco da peca dentro do pacote e
    # o do pacote adicional dividido pelo catalogo -- esse e o valor puro da arte.
    pacote_add = next(
        (i["valor"] for i in d["avulsos"]["itens"] if "adicional no mesmo ciclo" in i["nome"]),
        None,
    )
    if pacote_add is None:
        avisos.append("não achei o pacote adicional — sem ele não dá para conferir o incentivo")
    else:
        por_peca = pacote_add / len(pecas)
        for i in d["avulsos"]["itens"]:
            if i["valor"] is None or "adicional no mesmo ciclo" in i["nome"] or "hora" in normaliza(i["nome"]):
                continue
            if i["valor"] <= por_peca:
                falhas.append(
                    f'"{i["nome"]}" custa R$ {i["valor"]}, menor ou igual aos R$ {por_peca:.0f} '
                    "da peça dentro do pacote — a tabela incentiva o contrário do que o texto diz"
                )

    # ---------- 3 · valor órfão ----------
    esperado: set[int] = {0, d["valor"], d["encerramento"]["numero"], d["horaExcedente"]}
    for t in textos(d):
        esperado |= reais(t)
    for i in d["fora"]["itens"] + d["avulsos"]["itens"]:
        if i["valor"] is not None:
            esperado.add(i["valor"])
    orfaos = sorted(reais(plano) - esperado)
    if orfaos:
        falhas.append(
            "valor no PDF que não existe nos dados: " + ", ".join(f"R$ {o}" for o in orfaos)
        )

    # ---------- 4 · número proibido ----------
    for n, oque in PROIBIDOS.items():
        if n in plano:
            falhas.append(f"número que não podia chegar ao acordo: {n} — {oque}")

    # ---------- 5 · as regras do preço sobreviveram ----------
    for r in d["regrasDoPreco"]["itens"]:
        if normaliza(r["nome"]) not in normaliza(prosa):
            falhas.append(
                f'regra do preço ausente do PDF: "{r["nome"]}" — '
                "sem ela o acordo vira desconto sem contrapartida"
            )

    # ---------- 6 · fontes, medida e folha vazia ----------
    PERMITIDAS = ("SpaceGrotesk", "PlusJakartaSans", "JetBrainsMono")
    for i, pagina in enumerate(doc, 1):
        for f in pagina.get_fonts():
            tipo, nome = f[2], f[3]
            if tipo == "Type3":
                falhas.append(f"pág. {i}: {nome or 'fonte sem nome'} saiu como Type3 (negrito fabricado)")
            elif not nome.split("+")[-1].startswith(PERMITIDAS):
                falhas.append(f"pág. {i}: fonte estranha {nome} embutida")
        l = pagina.rect.width / 72 * 25.4
        a = pagina.rect.height / 72 * 25.4
        if abs(l - 210) > 0.5 or abs(a - 296) > 0.5:
            falhas.append(f"pág. {i}: {l:.1f} × {a:.1f} mm (esperado 210 × 296)")
        if len(pagina.get_text().strip()) < 120:
            falhas.append(f"pág. {i}: praticamente vazia — conteúdo transbordou")

    # ---------- avisos ----------
    if str(d["prazoMeses"]) not in plano or "ciclos" not in plano:
        falhas.append("o prazo de 6 ciclos não aparece no PDF — é cláusula, não detalhe")
    if f'{d["cotaRetrabalho"]} horas' not in prosa:
        falhas.append(f'a cota de {d["cotaRetrabalho"]} horas de retrabalho não aparece no PDF')
    if d["prazoLote"].split(" ")[0] not in plano:
        avisos.append("o prazo do lote não aparece no PDF")
    if d["vigencia"].split(" ")[-1] not in plano:
        avisos.append("a data de vigência não aparece no PDF")

    # ---------- veredito ----------
    print(f"auditoria do acordo · {doc.page_count} página(s) · R$ {d['valor']}/mês")
    print(
        f"  escopo: {len(d['dentro']['itens'])} dentro · {len(d['avulsos']['itens'])} na tabela · "
        f"{len(d['fora']['itens'])} fora · {len(pecas)} peças · cota {d['cotaRetrabalho']} h · "
        f"{d['prazoMeses']} ciclos"
    )
    for a in avisos:
        print(f"  aviso: {a}")
    if falhas:
        for f in falhas:
            print(f"  REPROVADO: {f}")
        raise SystemExit(1)
    print("  aprovado: escopo sem ambiguidade, catálogo completo, nenhum valor órfão ou proibido")


if __name__ == "__main__":
    main()
