# Assets de marca — Desbravando UTV

## ⚠️ Logo oficial 2026 (11/11/2026)

Para trocar a logo em tudo: `python artes/ferramentas/atualizar-logo.py <logo.png>` (no repo estudio-briefing-desbravando-utv; `--simular` mostra o plano antes). Ele gera PNG e vetor com nomes fixos, confere o vetor contra o PNG, troca a logo do Estúdio, atualiza a pasta de artes do site e os favicons e re-renderiza as contagens.

**Logo oficial 2026 = montanha · filete · #DESBRAVANDOUTV**, do arquivo que o Pedro mandou em 11/11/2026 (`artes/marca/logo-oficial.png (vetor: logo-oficial.svg)`, branca com transparência; original em `logo-oficial-original.png`; só o símbolo em `logo-montanha.png`). A montanha desse arquivo é um desenho NOVO, mais achatado (largura 3,98× a altura) que o vetor antigo (`logo-montanha*.svg` e `logo-lateral.svg`, 2,64×), e a fonte do #DESBRAVANDOUTV também mudou. O lockup com DESBRAVANDO UTV embaixo está aposentado. Vetorizada em 11/11: `logo-montanha*.svg` e `logo-lateral.svg` já são o desenho novo.

Na mesma data, mais cedo, registrei "logo = só a montanha" e troquei os templates para o vetor
antigo da montanha. Foi leitura errada do pedido: a logo é o arquivo acima. O que vem abaixo é histórico.

## logo-lateral.svg — assinatura lateral (26/08/2026)

Arquivo de marca novo, enviado pelo Pedro em 26/08/2026: **o nome fica AO LADO da
montanha**, não embaixo. Composição: montanha · filete vertical · `#DESBRAVANDOUTV`.

Construído em `marca/logo-lateral.svg` a partir do vetor da montanha
(`logo-montanha.svg`) + o texto convertido em **curvas** de Archivo Bold via
`ferramentas/texto-para-svg.py`. Não depende de fonte instalada, serve para impressão
igual à tela, e as proporções (montanha 425 : filete a 100 dela, 540 de altura : texto a
70 do filete, caixa alta 50) foram medidas no arquivo que ele mandou.

**É esta a assinatura das peças novas.** O `logo-desbravando.svg` (nome empilhado sob a
montanha) continua válido onde a peça pede a versão vertical — crachá, adesivo, cordão.
