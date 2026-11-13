"""Encolhe o PDF que o Chrome gera quando a página tem foto com máscara.

    python artes/ferramentas/comprimir-pdf.py entrada.pdf [saida.pdf] [--largura 2400] [--qualidade 84]

Por que existe: com `mask-image` (a borda esfumaçada das fotos de meia página) o Chrome
rasteriza a foto em PNG, sem perda, na resolução da página ampliada. Medido em 13/11/2026 no
dossiê da Origens: 4 fotos viraram 20 MB de PNG a 4002 px, e o PDF saiu com 27 MB — pesado
para mandar por WhatsApp. (O da Lençóis, 16,5 MB, tem o mesmo problema.)

O que faz: para cada imagem grande, aplica a máscara (smask) SOBRE PRETO — que é o fundo de
todas as páginas do dossiê —, reduz para no máximo --largura px e regrava como JPEG, sem a
máscara. O resultado na tela é o mesmo; o script confere renderizando as páginas antes e
depois e mede a diferença. Diferença visível aborta e mantém o original.

Só serve para páginas de fundo preto. Em peça de fundo claro, compor sobre preto escureceria
a borda da foto.
"""
import argparse
import io
import sys
from pathlib import Path

import fitz
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# diferença média por pixel (0–255) acima disto é visível; JPEG q84 fica perto de 1
LIMITE_MEDIA = 3.0


def render_paginas(doc, zoom=0.75):
    out = []
    for p in doc:
        pix = p.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        out.append(np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)[..., :3].astype(np.int16))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("saida", nargs="?")
    ap.add_argument("--largura", type=int, default=2400)
    ap.add_argument("--qualidade", type=int, default=84)
    a = ap.parse_args()
    ent = Path(a.entrada)
    sai = Path(a.saida) if a.saida else ent
    doc = fitz.open(ent)
    antes = render_paginas(doc)
    tam_antes = ent.stat().st_size

    feitas = set()
    for pagina in doc:
        for im in pagina.get_images(full=True):
            xref, smask = im[0], im[1]
            if xref in feitas:
                continue
            info = doc.extract_image(xref)
            if info["width"] < 1200:  # logos e ícones ficam como estão
                continue
            img = Image.open(io.BytesIO(info["image"])).convert("RGB")
            if smask:
                m = Image.open(io.BytesIO(doc.extract_image(smask)["image"])).convert("L")
                if m.size != img.size:
                    m = m.resize(img.size, Image.LANCZOS)
                img = Image.composite(img, Image.new("RGB", img.size, (0, 0, 0)), m)
            if img.width > a.largura:
                img = img.resize((a.largura, round(img.height * a.largura / img.width)), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=a.qualidade, optimize=True, progressive=True)
            doc.update_stream(xref, buf.getvalue(), compress=False)
            for k, v in (("Filter", "/DCTDecode"), ("Width", str(img.width)), ("Height", str(img.height)),
                         ("ColorSpace", "/DeviceRGB"), ("BitsPerComponent", "8")):
                doc.xref_set_key(xref, k, v)
            for k in ("SMask", "DecodeParms", "Decode"):
                doc.xref_set_key(xref, k, "null")
            feitas.add(xref)
            print(f"  imagem {xref}: {info['width']}×{info['height']} {info['ext']} {round(len(info['image'])/1024)} KB"
                  f" → {img.width}×{img.height} jpeg {round(len(buf.getvalue())/1024)} KB")

    tmp = sai.with_suffix(".tmp.pdf")
    doc.save(tmp, garbage=4, deflate=True)
    doc.close()  # no Windows o arquivo aberto não pode ser substituído
    novo = fitz.open(tmp)
    depois = render_paginas(novo)
    novo.close()
    pior = max(float(np.abs(x - y).mean()) for x, y in zip(antes, depois))
    print(f"diferença visual média por página: pior = {pior:.2f} (limite {LIMITE_MEDIA})")
    if pior > LIMITE_MEDIA or len(antes) != len(depois):
        tmp.unlink()
        sys.exit("✗ mudou o que se vê; mantive o PDF original")
    tmp.replace(sai)
    print(f"✓ {tam_antes/1048576:.1f} MB → {sai.stat().st_size/1048576:.1f} MB  ({sai})")


if __name__ == "__main__":
    main()
