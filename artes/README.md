# Artes — Desbravando UTV

Peças geradas a partir da identidade **em código**: HTML/CSS nas dimensões exatas, com as
fontes e os logos reais, renderizados para PDF/PNG. É o caminho que o `SPEC_MD` do Estúdio
descreve (`identidade.css` + `templates/` + render), agora existindo de fato.

Fonte da verdade da identidade: `SPEC_MD` em `../index.html`. Registro usado aqui: **núcleo
(P&B estrito)** — preto, branco e cinza; a única cor viria da fotografia, e nas peças de
marca até a foto entra dessaturada.

## O que tem aqui

| Peça | Template | Formato final | Arquivo de conteúdo |
|---|---|---|---|
| Crachá da equipe | `templates/cracha.mjs` | 54 × 86 mm + 3 mm de sangria | `dados/equipe.json` |
| Cordão | `templates/cordao.mjs` | 20 mm × 90 cm + 2 mm de sangria | — |
| Documento para as marcas | `templates/parcerias.mjs` | 1920 × 1080, 9 páginas | `dados/parcerias-*.json` |
| Camiseta da equipe | `templates/camiseta.mjs` | estampa 80 mm (costas) e 30 mm (frente) | `--cargo=` |
| Peça de evento (social) | `templates/evento.mjs` | 1080 × 1920 e 1080 × 1350 | `dados/evento-*.json` |

## Como gerar

```bash
node artes/ferramentas/render.mjs cracha                      # layout centro
node artes/ferramentas/render.mjs cracha --layout=editorial   # variante editorial
node artes/ferramentas/render.mjs cracha --guias              # com linha de corte e área segura
node artes/ferramentas/render.mjs cordao
node artes/ferramentas/render.mjs parcerias
node artes/ferramentas/render.mjs camiseta                    # cargo PRODUÇÃO
node artes/ferramentas/render.mjs camiseta --cargo=videomaker
node artes/ferramentas/render.mjs evento                     # stories + feed
node artes/ferramentas/render.mjs evento --formato=stories
node artes/ferramentas/render.mjs tudo
```

Saída em `artes/saida/`: o `.html` (abre no navegador para conferir), o `.pdf` (o que vai
para a gráfica / para a marca) e os `.png` de visualização.

`--dados=arquivo.json` troca o conteúdo — é assim que se faz outra equipe ou outro
território de parceria sem tocar no template.

### Pacote para a gráfica

```bash
node artes/ferramentas/pacote-grafica.mjs                    # vai para ~/cracha-desbravando-grafica
node artes/ferramentas/pacote-grafica.mjs --layout=editorial
node artes/ferramentas/pacote-grafica.mjs --destino=D:\algum\lugar
```

Monta a pasta pronta para enviar: `1-PRODUCAO/` (frentes, verso comum, cordão),
`2-CONFERENCIA/` (provas em 300 dpi e o PDF com marcas de corte),
`ESPECIFICACAO-TECNICA.pdf` e um `LEIA-ME.txt` que lista o que ainda falta.

### Pacote para a estamparia (camiseta)

```bash
node artes/ferramentas/pacote-camiseta.mjs                    # ~/camiseta-desbravando-producao
node artes/ferramentas/pacote-camiseta.mjs --cargo=GUIA
```

`1-PRODUCAO/` com as artes em PDF vetorial (em curvas) e PNG 300 dpi transparente,
`2-MOCKUP/` com os renders 3D, mais o `MAPA-DE-APLICACAO.pdf` com as duas vistas
cotadas e o `LEIA-ME.txt`.

### Mockup 3D

```bash
node artes/ferramentas/mockup-3d.mjs [--w=1600] [--h=2000] [--destino=CAMINHO]
```

Renderiza a camiseta em WebGL (three.js em `vendor/`, Chrome headless com
SwiftShader — não precisa de placa de vídeo): costas, frente e uma 3/4 de
apresentação. A cena está em `mockup/camiseta-3d.html`; a camiseta é uma superfície
paramétrica e **a mesma função posiciona a estampa**, só deslocada na normal — é o
que faz a arte acompanhar o volume em vez de parecer colada por cima.

Depende das artes de estampa em `saida/` (elas são a textura), então rode
`render.mjs camiseta` antes — ou use o `pacote-camiseta.mjs`, que faz os dois.

### Revisar tudo de uma vez

```bash
node artes/ferramentas/visualizar.mjs --abrir
```

Monta uma folha de contato com todas as peças de `saida/` e abre no navegador.

### Fotos provisórias

```bash
node artes/ferramentas/fotos-provisorias.mjs                 # todos os slots
node artes/ferramentas/fotos-provisorias.mjs --slot=capa     # refaz um só
```

Baixa imagens de licença livre do Wikimedia Commons para os slots do documento de
parcerias, marca `"provisoria": true` no JSON e registra os créditos em
`fotos/CREDITOS.md`. **Não são fotos da operação** — servem só para o documento não
circular vazio e devem sair quando as reais chegarem. Duas armadilhas já tratadas no
script: as APIs cortam rajada (daí o ritmo de ~1 req/s) e o Commons é cheio de acervo
histórico e pintura digitalizada, que entrariam no lugar de fotografia.

### Preparo (só na primeira vez, ou se a identidade mudar)

```bash
node artes/ferramentas/extrair-marca.mjs        # tira fontes e logos do index.html
python artes/ferramentas/congelar-fontes.py     # Archivo variável -> 400/600/700 estáticos
```

O congelamento não é opcional: o Chrome embute fonte variável no PDF como **Type3** (o texto
vira desenho). O Archivo tem dois eixos (`wght` e `wdth`) — os dois precisam ser fixados. O
render confere isso a cada rodada e avisa no terminal.

## Conteúdo pendente

Nada de número, preço, contato ou foto é inventado. Campo vazio aparece marcado na peça e o
render lista o que falta antes de enviar:

```
14 campo(s) a preencher antes de enviar:
  · número · seguidores
  · foto · Caso · resgate do carro em Jericoacoara
  ...
```

Fotos: aponte `"foto"` / `"arquivo"` para o caminho do arquivo (absoluto, ou relativo à
pasta `artes/`). Retrato de crachá: recorte vertical, rosto no terço superior — ele entra
em preto e branco.

## Para a gráfica

**Crachá** — PVC 0,76 mm, 54 × 86 mm (CR80 em pé), arquivo com 3 mm de sangria (60 × 92 mm),
frente e verso (4/4), acabamento **fosco** (fundo preto sólido brilhante marca digital),
furo/slot no topo. O PDF `--guias` mostra a linha de corte (vermelha) e a área segura
(azul, 4 mm) — é só para conferência, não mande esse para produção.

**Cordão** — fita de 20 mm × 90 cm, sublimação, arte igual nos dois lados, fundo preto e o
ícone da montanha em cinza (`#6e6e6e`) repetido a cada 70 mm. Ferragem: mosquetão giratório
e terminal metálico.

**Documento das marcas** — PDF em 1920 × 1080; envia direto ou apresenta em tela. A página 5
é a única que muda por parceiro: duplique o JSON trocando `territorio` (gastronomia,
bebidas, seguros, fotografia…) e rode de novo.
