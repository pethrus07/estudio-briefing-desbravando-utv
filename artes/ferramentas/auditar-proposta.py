"""Audita o PDF da proposta comercial contra os dados. Sai com código 1 se reprovar.

    python auditar-proposta.py saida/proposta-2026-10.pdf dados/proposta-2026-10.json

Irmão do auditar-fechamento.py, com uma diferença de risco: o fechamento erra em dinheiro,
a proposta erra em ARGUMENTO. Um documento de negociação que afirma "o total do mês cai em
duas das opções" e tem uma conta que não fecha não perde um número — perde a conversa, e
não tem segunda chance. Por isso aqui as frases que afirmam alguma coisa também são
conferidas contra a tabela, não só os valores.

O que reprova:

  1. **Valor em reais órfão.** Todo "R$ n" do PDF tem de sair dos dados ou de uma soma que
     o template calcula. Valor órfão é texto velho sobrevivendo de uma versão anterior.
  2. **Hora órfã.** Mesma regra para "n,n h" — o argumento inteiro se apoia nessas horas.
  3. **Número interno vazado.** O piso de hora e a contraproposta do cliente são material de
     preparação; se aparecerem no PDF, o documento vira carta aberta da negociação.
  4. **Afirmação que a tabela não sustenta.** O texto diz que o fixo sobe nas três opções e
     que o total do mês cai em duas; as duas coisas são recalculadas aqui.
  5. **Hora efetiva acima do piso.** Se isso acontecer, a proposta se contradiz: ela existe
     para mostrar que a hora está barata.
  6. **Fonte não embutida ou Type3**, **folha fora de 210 × 296 mm**, **folha vazia** —
     os defeitos clássicos deste pipeline.
"""

import io
import json
import re
import sys
from pathlib import Path

import fitz

# Números que existem só na preparação e NÃO podem chegar ao cliente.
INTERNOS = {
    "R$ 350": "a contraproposta que o cliente fez na reunião",
    "R$ 500": "o piso mensal que o Pedro declarou internamente",
}


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


def textos(no):
    """Toda string do JSON, em qualquer profundidade — é onde moram os valores citados."""
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


def fmt_hora(n: float) -> str:
    return f"{n:.1f}".replace(".", ",") + " h"


def main() -> None:
    pdf = Path(sys.argv[1])
    d = json.load(io.open(sys.argv[2], encoding="utf-8"))
    doc = fitz.open(pdf)
    plano = "\n".join(p.get_text() for p in doc).replace(" ", " ")
    prosa = re.sub(r"\s+", " ", plano)

    falhas: list[str] = []
    avisos: list[str] = []

    # ---------- as contas, refeitas aqui do zero ----------
    c = d["horas"]["ciclos"]
    # mesma derivacao do template: o ciclo versionado da o ritmo, o ritmo reconstroi o outro
    medido = next((x for x in c if x.get("horasArtes")), None)
    if medido is None:
        raise SystemExit("dados sem ciclo medido em arte — nao da para auditar a reconstrucao")
    ritmo = medido["horasArtes"] / medido["artes"]
    for x in c:
        x["reconstruidas"] = x["artes"] * ritmo if x.get("reconstruir") else 0
    apuradas = sum(x["apuradas"] for x in c)
    reconstruidas = sum(x["reconstruidas"] for x in c)
    total_horas = apuradas + reconstruidas
    media_horas = total_horas / len(c)
    faturado = sum(x["faturado"] for x in c)
    media_faturado = faturado / len(c)
    hora_efetiva = faturado / total_horas
    base_hoje = d["planoAtual"]["valorHoje"] + d["planoAtual"]["token"]
    hoje_total = d["comparativo"]["hoje"]["fixo"] + d["comparativo"]["hoje"]["variavel"]

    # ---------- 1 · valores em reais ----------
    esperado: set[int] = {0}
    for t in textos(d):  # tudo que o texto do JSON cita explicitamente
        esperado |= reais(t)
    esperado |= {o["preco"] for o in d["opcoes"]}
    esperado |= {d["planoAtual"]["valorHoje"], d["planoAtual"]["token"], base_hoje}
    esperado |= {d["horas"]["piso"], d["encerramento"]["numero"]}
    esperado |= {x["faturado"] for x in c} | {faturado, round(media_faturado)}
    esperado.add(round(hora_efetiva))
    esperado |= {d["comparativo"]["hoje"]["fixo"], d["comparativo"]["hoje"]["variavel"], hoje_total}
    for l in d["comparativo"]["linhas"]:
        esperado |= {l["fixo"], l["variavel"], l["fixo"] + l["variavel"]}
    for i in d["aParte"]["itens"]:
        if i["saldo"] is not None:
            esperado.add(i["saldo"])

    orfaos = sorted(reais(plano) - esperado)
    if orfaos:
        falhas.append(
            "valor no PDF que não existe nos dados (texto velho?): "
            + ", ".join(f"R$ {o}" for o in orfaos)
        )

    # ---------- 2 · horas ----------
    # O argumento central do documento é o tempo. Hora que aparece no PDF e não sai da
    # tabela é tão grave quanto valor órfão — pior, porque ninguém confere hora somando.
    horas_ok = {fmt_hora(apuradas), fmt_hora(reconstruidas), fmt_hora(total_horas),
                fmt_hora(media_horas), fmt_hora(medido["horasArtes"]),
                fmt_hora(media_horas / (365 / 12 / 7))}
    for x in c:
        horas_ok |= {fmt_hora(x["apuradas"]), fmt_hora(x["apuradas"] + x["reconstruidas"])}
        if x["reconstruidas"]:
            horas_ok.add(fmt_hora(x["reconstruidas"]))
    no_pdf = set(re.findall(r"\d+,\d\s?h", plano))
    orfas = sorted({h.replace(" ", " ") for h in no_pdf} - horas_ok)
    if orfas:
        falhas.append("hora no PDF que não sai da tabela: " + ", ".join(orfas))
    ritmo_txt = f"{ritmo:.2f}".replace(".", ",") + " h por arte"
    if ritmo_txt not in prosa:
        falhas.append(f"o ritmo medido ({ritmo_txt}) nao aparece no PDF — sem ele a reconstrucao das horas fica sem fonte")
    if fmt_hora(total_horas) not in plano:
        falhas.append(f"o total de horas ({fmt_hora(total_horas)}) não aparece no PDF")

    # ---------- 3 · número interno vazado ----------
    for n, oque in INTERNOS.items():
        if n in plano:
            falhas.append(f'número interno vazou para o documento do cliente: {n} — {oque}')

    # ---------- 4 · o que o texto afirma, conferido na tabela ----------
    # O parágrafo que fecha o comparativo é afirmação numérica como qualquer outra, e é
    # o que o cliente lê em vez de somar a coluna. Cada afirmação que já usamos tem aqui o
    # seu verificador.
    #
    # A primeira versão disto era `if <frase> in prosa and not <conta>: reprova` — e isso
    # tem um defeito que custou caro no auditor do fechamento: quando o texto muda, a frase
    # some, o `in` dá falso e a checagem DESAPARECE em silêncio, justo no momento em que o
    # documento mudou e mais precisa ser conferido. Por isso agora é obrigatório que ALGUMA
    # afirmação conhecida esteja presente: texto novo sem verificador reprova.
    linhas = d["comparativo"]["linhas"]
    fixo_hoje = d["comparativo"]["hoje"]["fixo"]
    totais = {l["opcao"]: l["fixo"] + l["variavel"] for l in linhas}
    destaque = next((o for o in d["opcoes"] if o.get("destaque")), None)
    a_la_carte = [l for l in linhas if l["variavel"]]

    def _mesmo_numero():
        """As duas opções com arte chegam ao mesmo total, e na faixa do que já se paga."""
        if destaque is None or len(a_la_carte) != 1:
            return "esperava uma opção em destaque e uma montada item a item"
        montada = a_la_carte[0]["fixo"] + a_la_carte[0]["variavel"]
        if montada != destaque["preco"]:
            return f"montada item a item dá R$ {montada}, mas o pacote completo custa R$ {destaque['preco']}"
        if abs(montada - hoje_total) / hoje_total > 0.05:
            return f"R$ {montada} não está na faixa do que se paga hoje (R$ {hoje_total})"
        return None

    def _caem_duas():
        n = sum(1 for t in totais.values() if t < hoje_total)
        return None if n == 2 else f"o total cai em {n} opções, não em duas"

    def _fixo_sobe():
        n = sum(1 for l in linhas if l["fixo"] > fixo_hoje)
        return None if n == len(linhas) else f"{len(linhas) - n} opção(ões) não sobem o fixo"

    AFIRMACOES = [
        ("dá exatamente o mesmo número do pacote completo", _mesmo_numero),
        ("em duas delas o total do mês cai", _caem_duas),
        ("Nas três opções o valor fixo sobe", _fixo_sobe),
    ]
    usadas = [(t, v) for t, v in AFIRMACOES if t in prosa]
    if not usadas:
        falhas.append(
            "o parágrafo do comparativo não contém nenhuma afirmação com verificador — "
            "mudou o texto sem ensinar a conta ao auditor"
        )
    for trecho, verificar in usadas:
        erro = verificar()
        if erro:
            falhas.append(f'o texto afirma "{trecho}" e a tabela não sustenta: {erro}')

    destaques = [o for o in d["opcoes"] if o.get("destaque")]
    if len(destaques) != 1:
        falhas.append(f"{len(destaques)} opções marcadas como recomendada — tem de ser exatamente 1")
    elif destaques[0]["preco"] != d["encerramento"]["numero"]:
        falhas.append(
            f'o encerramento destaca R$ {d["encerramento"]["numero"]} mas a opção recomendada '
            f'({destaques[0]["nome"]}) custa R$ {destaques[0]["preco"]}'
        )

    # ---------- 5 · a proposta não pode se contradizer ----------
    if hora_efetiva >= d["horas"]["piso"]:
        falhas.append(
            f"hora efetiva R$ {hora_efetiva:.2f} não está abaixo do piso de "
            f"R$ {d['horas']['piso']} — o argumento do documento se inverte"
        )

    # ---------- 6 · fontes, medida e folha vazia ----------
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
        l = pagina.rect.width / 72 * 25.4
        a = pagina.rect.height / 72 * 25.4
        if abs(l - 210) > 0.5 or abs(a - 296) > 0.5:
            falhas.append(f"pág. {i}: {l:.1f} × {a:.1f} mm (esperado 210 × 296)")
        if len(pagina.get_text().strip()) < 120:
            falhas.append(f"pág. {i}: praticamente vazia — conteúdo transbordou")

    # ---------- avisos ----------
    for o in d["opcoes"]:
        if o["nome"] not in plano:
            avisos.append(f'opção ausente do PDF: {o["nome"]}')
    if d["validade"] not in plano:
        avisos.append("a validade da proposta não aparece no PDF")

    # ---------- veredito ----------
    print(f"auditoria da proposta · {doc.page_count} página(s) · {len(d['opcoes'])} opções")
    print(
        f"  horas: {apuradas:.1f} apuradas + {reconstruidas:.1f} reconstruídas = "
        f"{total_horas:.1f} em {len(c)} ciclos ({media_horas:.1f}/mês) · ritmo {ritmo:.2f} h/arte"
    )
    print(
        f"  dinheiro: faturado R$ {faturado} · média R$ {media_faturado:.0f}/mês · "
        f"hora efetiva R$ {hora_efetiva:.2f} contra piso R$ {d['horas']['piso']}"
    )
    print(
        "  opções: " + " · ".join(f"{o['nome']} R$ {o['preco']}" for o in d["opcoes"])
        + f" · hoje R$ {hoje_total}"
    )
    for a in avisos:
        print(f"  aviso: {a}")
    if falhas:
        for f in falhas:
            print(f"  REPROVADO: {f}")
        raise SystemExit(1)
    print("  aprovado: valores e horas conferem, nada interno vazou, nenhuma fonte fabricada")


if __name__ == "__main__":
    main()
