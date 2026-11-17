"""Briefing do Estúdio (tipo "Expedição · Público interno") → JSON do dossiê.

    python artes/ferramentas/briefing-para-dossie.py <briefing.zip | pasta> <slug> [--corrigir "errado=>certo" ...]

Depois:
    node artes/ferramentas/render.mjs dossie --dados=dossie-<slug>.json
    python artes/ferramentas/comprimir-pdf.py artes/saida/dossie-<slug>.pdf

Por que existe: em 13/11/2026 chegaram pelo Estúdio, no mesmo dia, os briefings da Origens e
da Serra da Bocaina. O primeiro foi convertido por um script de uma vez só; o segundo mostrou
que o formato é o mesmo, então a conversão virou ferramenta.

O que faz:
  - lê briefing.json + IMAGENS/ (do zip baixado do Mini Drive ou da pasta já extraída);
  - copia as fotos para <dados>/fotos/<slug>/ (material do cliente, fora do git);
  - escolhe o layout pela ORIENTAÇÃO da foto: vertical na capa ou no "quem somos" vira meia
    página (sangrar 16:9 ampliaria ~2× e cortaria o assunto); o fecho só leva foto se a da
    capa for horizontal;
  - roteiro: a linha com "~ N km" vira o trecho do dia; o resto vira a agenda (com ou sem
    horário); 5 dias ou menos ficam numa página só;
  - corrige SÓ ortografia (o Estúdio promete isso ao cliente: "a equipe revisa a ortografia
    sem mudar as suas frases"). Cada correção aplicada é impressa. Palavra que muda o sentido
    não é corrigida aqui: vira pergunta para o cliente.
"""
import argparse
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

from PIL import Image, ImageOps

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
DADOS = Path(__import__("os").environ.get("DESBRAVANDO_DADOS", r"C:\Users\olive\Arquivo-projetos\desbravando-dados"))

# erros que já apareceram nos briefings e não mudam sentido nenhum
ORTOGRAFIA = [
    ("toda o roteiro", "todo o roteiro"),
    ("Sexta Feira", "Sexta-feira"),
    ("trihas", "trilhas"),
    ("três das de", "três dias de"),
    ("em meio á", "em meio à"),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("briefing")
    ap.add_argument("slug")
    ap.add_argument("--corrigir", action="append", default=[], help='"errado=>certo", pode repetir')
    a = ap.parse_args()

    origem = Path(a.briefing)
    if origem.suffix.lower() == ".zip":
        pasta = origem.with_suffix("")
        with zipfile.ZipFile(origem) as z:
            z.extractall(pasta)
    else:
        pasta = origem
    B = json.loads((pasta / "briefing.json").read_text(encoding="utf-8"))
    tipo = B.get("tipo")
    tipo = tipo.get("id") if isinstance(tipo, dict) else tipo
    if tipo != "exp_interna":
        print(f"⚠ tipo do briefing é {tipo!r}; esta ferramenta foi feita para exp_interna")

    correcoes = ORTOGRAFIA + [tuple(c.split("=>", 1)) for c in a.corrigir]
    usadas = set()

    def limpa(t):
        t = str(t or "")
        for errado, certo in correcoes:
            if errado in t:
                usadas.add((errado, certo))
                t = t.replace(errado, certo)
        t = re.sub(r"[ \t]{2,}", " ", t)
        return "\n".join(l.strip() for l in t.splitlines()).strip()

    secs = B["secoes"]
    por_bloco = {}
    for s in secs:
        por_bloco.setdefault(s["bloco"], []).append(s)

    def r(s, campo):
        return limpa(s["respostas"].get(campo, {}).get("valor", "")) if s else ""

    def rep(s, chave):
        return [{k: limpa(v["valor"]) for k, v in it["respostas"].items()}
                for it in (s or {}).get("repeticoes", {}).get(chave, [])]

    def img(s, campo):
        n = (s or {}).get("imagens", {}).get(campo)
        if isinstance(n, dict):
            n = n.get("arquivo") or n.get("nome")
        if isinstance(n, list):
            n = n[0] if n else None
        return n

    def linhas(t):
        return [l for l in limpa(t).splitlines() if l]

    capa = por_bloco.get("capa", [None])[0]
    tf = por_bloco.get("texto_foto", [])
    quem, exped = (tf + [None, None])[:2]
    ficha = por_bloco.get("ficha", [None])[0]
    rot = por_bloco.get("roteiro", [None])[0]
    cart = por_bloco.get("cartoes", [None])[0]
    listas = por_bloco.get("lista", [])
    estr = next((l for l in listas if "pilota" in l["titulo"].lower()), None)
    padr = next((l for l in listas if l is not estr), None)
    hosp = por_bloco.get("hospedagem", [None])[0]
    cols = por_bloco.get("colunas", [None])[0]
    fim = por_bloco.get("encerramento", [None])[0]

    # ---- fotos: copia e mede a orientação
    dest_fotos = DADOS / "fotos" / a.slug
    dest_fotos.mkdir(parents=True, exist_ok=True)
    imagens = pasta / "IMAGENS"

    def foto(nome, rotulo):
        if not nome:
            return None, None
        src = imagens / nome
        if not src.exists():
            achados = sorted(imagens.glob(Path(nome).stem + ".*"))
            if not achados:
                print(f"⚠ foto {nome} citada no briefing não está no zip")
                return None, None
            src = achados[0]
        shutil.copy2(src, dest_fotos / src.name)
        w, h = ImageOps.exif_transpose(Image.open(src)).size
        return f"fotos/{a.slug}/{src.name}", ("vertical" if h > w else "horizontal")

    # nomes das fotos no zip seguem "NN_campo.ext"; o briefing.json nem sempre cita pelo nome
    def foto_da_secao(s, campo):
        if not s:
            return None, None
        n = img(s, campo)
        if not n:
            achados = sorted(imagens.glob(f"{s['ordem']:02d}_{campo}.*"))
            n = achados[0].name if achados else None
        return foto(n, campo)

    f_capa, o_capa = foto_da_secao(capa, "foto")
    f_quem, o_quem = foto_da_secao(quem, "foto")
    f_exp, _ = foto_da_secao(exped, "foto")
    f_h1, _ = foto_da_secao(hosp, "foto1")
    f_h2, _ = foto_da_secao(hosp, "foto2")

    # ---- roteiro
    roteiro = []
    for i, d in enumerate(rep(rot, "dias"), 1):
        ls = linhas(d.get("desc", ""))
        texto, km, agenda = "", "", []
        for l in ls:
            m = re.match(r"^(.*?)\s*~\s*(\d[\d\s.,-]*\s*km)\s*$", l, re.I)
            if m and not km:
                texto, km = m.group(1).strip(), "~" + re.sub(r"\s+", " ", m.group(2).strip())
            else:
                agenda.append(l)
        data = d.get("data", "")
        mdata = re.match(r"^(\d{2}/\d{2})/\d{4}$", data)
        roteiro.append({"dia": str(i), "titulo": d.get("titulo", ""), "data": mdata.group(1) if mdata else data,
                        "local": d.get("local", ""), "texto": texto, "km": km, "agenda": agenda})
    locais = {d["local"] for d in roteiro if d["local"]}

    dest = r(capa, "dest")
    dur, _, destq = [x.strip() for x in dest.partition(" - ")]
    titulo = r(capa, "titulo")
    titulo = re.sub(r"^expedi[cç][aã]o\s+", "", titulo, flags=re.I)  # a sobrelinha já diz EXPEDIÇÃO

    dados = {
        "_nota": f"Gerado por artes/ferramentas/briefing-para-dossie.py a partir do briefing do Estúdio "
                 f"({B.get('gerado_em', '')}). Não editar à mão: corrigir no briefing e gerar de novo.",
        "_pendencias": [],
        "slug": a.slug,
        "titulo": titulo,
        "subtitulo": r(capa, "sub"),
        "regiao": "",
        "duracao": dur,
        "destaques": destq,
        "capaPilulas": [x.strip() for x in r(capa, "pilulas").split("|") if x.strip()],
        "quemSomos": r(quem, "texto"),
        "quemSomosPilulas": r(quem, "pilulas"),
        "tituloSobre": r(exped, "titulo"),
        "sobreDestino": re.sub(r"\n(?!\n)", "\n\n", r(exped, "texto")),
        "ficha": [{"rotulo": x.get("rotulo", ""), "valor": x.get("valor", "")} for x in rep(ficha, "itens")],
        "roteiroResumo": len(roteiro) <= 5,
        "roteiro": roteiro,
        "roteiroNota": ("Quilometragens aproximadas, podendo ter alterações."
                        + (f" Base: {next(iter(locais))}." if len(locais) == 1 else "")),
        "foraDoVolante": {
            "titulo": r(cart, "titulo"), "texto": r(cart, "texto"), "pilulas": r(cart, "pilulas"),
            "cartoes": [{"etiqueta": c.get("etiqueta", ""), "titulo": c.get("titulo", ""), "texto": c.get("desc", "")}
                        for c in rep(cart, "cartoes")],
        } if cart else None,
        "padrao": linhas(r(padr, "itens")),
        "hospedagens": [{
            "nome": r(hosp, "nome"), "onde": r(hosp, "local"),
            "texto": (r(hosp, "desc").rstrip(".") + ".") if r(hosp, "desc") else "",
            "foto": f_h1, "foco": "center 50%", "foto2": f_h2, "foco2": "center 50%",
        }] if hosp else [],
        "estrutura": {"titulo": r(estr, "titulo"), "texto": r(estr, "texto"),
                      "itens": linhas(r(estr, "itens")), "obs": r(estr, "obs")} if estr else None,
        "incluso": linhas(r(cols, "col1_itens")),
        "naoIncluso": linhas(r(cols, "col2_itens")),
        "contato": r(fim, "contato") or None,
        "fotos": {
            "capa": {"arquivo": f_capa, "descricao": "capa", "foco": "center 50%",
                     **({"layout": "meia"} if o_capa == "vertical" else {})} if f_capa else None,
            "equipe": {"arquivo": f_quem, "descricao": "quem somos", "foco": "center 45%",
                       **({"layout": "meia"} if o_quem == "vertical" else {})} if f_quem else None,
            "expedicao": {"arquivo": f_exp, "descricao": "a expedição", "foco": "center 55%"} if f_exp else None,
            "encerramento": None,
            "fecho": ({"arquivo": f_capa, "descricao": "fecho", "foco": "center 40%"}
                      if f_capa and o_capa == "horizontal" else None),
        },
        "creditos": "",
    }
    if not dados["roteiroResumo"]:
        dados["_pendencias"].append(f"roteiro com {len(roteiro)} dias: uma página por dia, precisa de foto por dia")
    for k in ("foraDoVolante", "estrutura", "contato"):
        if dados[k] is None:
            del dados[k]

    saida = DADOS / "dados" / f"dossie-{a.slug}.json"
    saida.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✓ {saida}")
    print(f"  fotos em {dest_fotos}: capa {o_capa or '—'}, quem somos {o_quem or '—'}"
          f"{' · fecho sem foto (capa vertical)' if o_capa == 'vertical' else ''}")
    for d in roteiro:
        print(f"  dia {d['dia']} {d['titulo']} {d['data']}: trecho {d['texto'] or '—'} {d['km']} · {len(d['agenda'])} linha(s) de agenda")
    print("  ortografia corrigida: " + ("; ".join(f"{e} → {c}" for e, c in sorted(usadas)) or "nada") + "; espaços duplos")


if __name__ == "__main__":
    main()
