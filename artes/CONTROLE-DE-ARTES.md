# Controle de artes — Desbravando UTV

Registro do que foi produzido, em quantas versões e quantos ajustes, para efeito de
cobrança. **Esta tabela é atualizada a cada peça nova e a cada ajuste pedido.**

Como conto: **versão** = arquivo final distinto entregue (variante de layout, formato
ou proporção conta separado). **Rodada** = ciclo de ajuste pedido depois de a peça já
ter sido entregue. **Documento técnico** = folha de especificação/mapa que acompanha a
arte, sem ser arte.

Última atualização: **26/08/2026** (fim do dia).

---

## Resumo

**10 peças · 69 versões · 14 rodadas de ajuste.**

| # | Peça | Versões | Rodadas | Status | Onde está |
|---|---|---:|---:|---|---|
| 1 | Crachá da equipe | 3 | 1 | aguarda escolha de layout e retratos | `~/cracha-desbravando-grafica` |
| 2 | Cordão | 1 | 1 | pronto | idem, em `1-PRODUCAO` |
| 3 | Documento do Programa de Parcerias | 1 | 2 | aguarda números, contato e fotos reais | `artes/saida` |
| 4 | Camiseta PRODUÇÃO | 4 | 4 | **pronto para estamparia** | soltos em `~/Downloads` (`CAMISETA-*`) |
| 5 | Cardápio Noite do Queijo, Pizza & Vinho | 4 | 3 | **mesa pronta para gráfica** | soltos em `~/Downloads` (`CARDAPIO-*`) |
| 6 | Bandeiras (5 peças) | 8 | 0 | **pronto**, aguarda 3 definições da gráfica | `~/Downloads/bandeiras-desbravando-250x150` |
| 7 | Carta de recepção (Urubici) | 2 | 0 | **pronto**, escolher clara ou escura | soltos em `~/Downloads` (`CARTA-*`) |
| 8 | Adesivo do UTV | 42 | 2 | **refeito 100% vetor**, série 01–20 nas duas cores | `~/Downloads/DESBRAVANDO-ADESIVOS-UTV-VETOR` |
| 9 | Cartão de identificação do UTV | 1 | 1 | **pronto**, atualizado com o selo novo sem cobrança | `CARTAO-UTV-*` |
| 10 | Chaveiro de fita | 3 | 0 | **pronto**, escolher entre A, B e C | `CHAVEIRO-A/B/C.*` |
| | **Total** | **69** | **14** | | |

Descartado a pedido: **1** — mockup 3D da camiseta (3 renders), reprovado e removido.

## Contagem para cobrança

Os dois números são verdadeiros e medem coisas diferentes — a escolha do critério é sua:

| critério | conta | total |
|---|---|---:|
| **Peças** | cada item de comunicação distinto (a camiseta é uma peça, mesmo com 4 arquivos) | **10** |
| **Arquivos finais entregues** | todo arquivo distinto que saiu daqui, inclusive os 40 do adesivo numerado | **69** |
| **Artes cobradas** | o que entra na fatura, em 9 peças com preço fechado | **22** |
| **Rodadas de ajuste** | ciclos pedidos depois de a peça já ter sido entregue | **14** |

Os 69 arquivos **não** são 69 cobranças: 46 deles saíram do mesmo desenho (a série 01–20
do adesivo em duas cores, provas, versões sem fundo, proporções oficiais). O que se cobra
são as 22 artes da tabela de precificação, em 9 peças = **R$ 520**.

### Rodada de 17/08 — pedido novo do cliente

| peça | versões | o que são |
|---|---:|---|
| Carta de recepção | 2 | clara e escura |
| Adesivo do UTV | 1 | número 01, para aprovar (a série é derivada) |
| Cartão de identificação | 1 | frente + verso no mesmo arquivo |
| Chaveiro de fita | 3 | variantes A, B e C para escolher |
| **Subtotal** | **7** | em **4 peças** |

O cliente pediu "3 artes" e depois somou o chaveiro: **4 peças**. Como duas delas foram
entregues em mais de uma opção (carta em 2 temas, chaveiro em 3 variantes), o número de
arquivos finais é 7. Se a cobrança for por peça, são 4 — mas as opções extras foram
trabalho executado, e é razoável cobrar a escolha múltipla como versão.

### Rodada de 21/08 — reclamação da gráfica + série completa

A gráfica reclamou: **ao dar zoom para imprimir, o adesivo serrilhava**. Auditei os dois
PDFs entregues em 18/08 e a causa era do nosso lado:

| arquivo entregue | o que tinha dentro |
|---|---|
| adesivo preto | logotipo embutido como imagem de 4800×1712 px |
| adesivo branco | logotipo rasterizado a **337×121 px (~30 dpi)** pelo `filter: invert()` do CSS |

Refeito de outra forma: o adesivo agora é **um SVG puro** — disco e anel são `<circle>`,
o logotipo é caminho vetorial (o PNG de 2300×813 foi convertido em curvas pelo
`ferramentas/vetorizar-png.py`) e **todo** o texto é curva de fonte. Auditado arquivo por
arquivo: **0 imagem e 0 fonte embutida nos 40 PDFs**, contra 1 imagem e 4 fontes na versão
antiga. O pacote leva uma prova de zoom em 2400 dpi mostrando o antes e o depois.

| item | versões | o que são |
|---|---:|---|
| Adesivo preto, 100% vetor | 20 | números 01 a 20, PDF + SVG cada |
| Adesivo branco, 100% vetor | 20 | idem |
| **Subtotal** | **40** | numa peça |

**Como cobrar isto — decisão sua, e as duas metades são diferentes:**

1. **A revetorização é correção, não trabalho novo.** O arquivo saiu com defeito daqui;
   a reclamação da gráfica está registrada. Cobrar o conserto é o tipo de item que gera
   atrito se o cliente perguntar. Sugiro **R$ 0**.
2. **A série numerada 01–20 nas duas cores é escopo novo.** Em 18/08 só existia o número
   01 como amostra de aprovação, e eu mesmo escrevi nesta tabela que *"demais números da
   série · acompanha · —"*. Se cobrar agora, é uma mudança de critério — defensável, mas
   precisa ser dita, não aparecer na fatura.

**Decidido em 24/08:** o adesivo passa a ter **preço fechado de R$ 80**, contra R$ 55
antes, e esse valor cobre os dois selos, a revetorização completa e os 40 arquivos da
série 01–20 — cada um gerado e auditado individualmente. A linha separada de "preparação
vetorial para gráfica" deixou de existir: foi absorvida no valor da peça.

Fica registrado, para uso interno, que a reclamação de serrilhado tinha causa do nosso
lado. Se o cliente puxar o assunto, o argumento que se sustenta é o entregável — 40
arquivos vetoriais auditados, um por UTV — e não o conserto.

---

> A base de cobrança consolidada (artes + site + sistemas, com calendário) vive no
> Sinapse: `04-NEGOCIO/desbravando-cobranca.md`. Esta seção é a memória de cálculo das
> artes.

## Ciclo 26/08 → 25/09 — em andamento

| # | entrega | peças | artes | R$ | situação |
|---|---|---:|---:|---:|---|
| 1 | Formulário do almoço na vinícola | — | — | **50** | no ar 25/08 · R$ 50 por formulário, decisão dele em 03/09 |
| 2 | **Programação da expedição** — 5 dias | 5 | 5 | **120** *(confirmado pelo Pedro em 07/09: 40 + 4 × 20)* | entregue 26/08 |
| 3 | **`logo-lateral.svg`** — assinatura lateral em vetor | 1 | — | **40** *(proposto 07/09)* | entregue 26/08 |
| 4 | **Código de conduta** — “A favor do off-road consciente” | 1 | 1 | **40** *(proposto 07/09: constrói o trilho)* | entregue 26/08 |
| 5 | **Carta de drinks** do evento | 1 | 1 | **15** *(proposto 07/09: reaproveita o trilho, taxa padrão)* | entregue 26/08 |
| 6 | **Expedição Origens** — proposta em imagem | 1 | 1 | **50** *(proposto 07/09)* | entregue 02/09 · rodada 1/2 no mesmo dia (v2 do PDF) |
| 7 | **Parcerias · Veículo Oficial** — apresentação de 10 páginas | 10 | 6 | **50** *(decidido pelo Pedro em 07/09)* | entregue 03/09 · 4 fotos reais aplicadas; 3 slots ainda tipográficos |
| 8 | **Formulário de avaliação da expedição** | — | — | **50** | no ar 03/09 · `/avaliacao-expedicao` |
| 9 | **Formulário de cadastro** — Expedição Origens | — | — | **50** | no ar 04/09 · `/cadastro-origens` |
| 10 | **Cadastro · e-mail, valor e forma de pagamento** | — | — | **30** | 09/09 · escopo novo, não rodada |
| 11 | **Cadastro · telefone, camiseta, emergência e e-mail condicional** | — | — | **30** | 09/09 · segunda leva do dia |

**Prévia do ciclo gerada em 07/09** (emissão 08/09): `artes/saida/fechamento-2026-09.pdf` a partir de `dados/fechamento-2026-09.json` — base 195 + peças 315 + formulários 100 + parcelas 300 = **R$ 910** (o cliente ouviu ~980 em 02/09; a apresentação caiu de 120 para 50 por decisão do Pedro em 07/09). Programação a 120 confirmada por ele; logo lateral, conduta, drinks e Origens são proposta minha no critério dele.

---

### 2 · Programação da expedição — 5 peças, 1 arte cada

Uma peça por dia da 3ª Expedição Família, **só no formato de WhatsApp** (1080 × 1920) por
pedido dele em 26/08 — a primeira versão saía em três formatos e ele dispensou os outros
dois. Texto de cada dia recebido por WhatsApp em 26/08.

| dia | peça | conteúdo |
|---|---|---|
| 26/08 | Dia 1 · Chegada | check-in, evento de boas-vindas, o que a noite tem |
| 27/08 | Dia 2 · Primeiro dia de trilha | previsão do dia, rotina da manhã, roteiro, asfalto, almoço, jantar |
| 28/08 | Dia 3 · Vinícola | 6 horários, transfer, Vinícola Thera |
| 29/08 | Dia 4 · Segundo dia de trilha | idem dia 2 + evento de encerramento |
| 30/08 | Dia 5 · Despedida | café, check-out, mensagem de fecho |

**Especificação.** PNG em pixel exato 1080 × 1920. Fundo em P&B: campo de **curvas de
nível** gerado por soma de senos, **uma textura por dia** (fase e relevo deslocados) — as
cinco leem como série sem nenhuma ser igual à outra, e o número do dia é o elemento que
identifica cada uma. Sem foto, por decisão dele. Sem emoji: o 📍 e o 🍷 do texto original
saíram, porque emoji entra colorido e a identidade é P&B estrito — o alfinete virou SVG
desenhado.

**Os dias de trilha exigiram três estruturas que não existiam:** bloco de *previsão*
(saída · distância · chegada como três números), *roteiro* em sequência com o retorno
marcado, e *trechos de asfalto* em letra miúda com o aviso de que quilometragem e horário
são previsão. Mais um campo de escala por dia — o dia 4 tem 6 horários, roteiro e asfalto,
o dia 5 tem 2 horários; sem escala, ou o cheio transbordava ou o leve ficava minúsculo.

**Como eu enquadraria.** O contrato chama post/story de arte padrão (R$ 15). Estas peças
são mais que post: hierarquia de seis a oito blocos, linha do tempo desenhada, e as de
trilha com painel de números e roteiro. Mas a série compartilha um template — do segundo
dia em diante o custo é de conteúdo, não de construção. Sugestão: **primeira peça R$ 40
(construção) + 4 dias a R$ 20 = R$ 120** pelas cinco. Fica no critério que ele já fixou
(preço fechado, com o número de artes explícito) e abaixo do que cinco peças avulsas
dariam.

**Rodadas de ajuste.** Foram várias, e a maioria **não é cobrável**: sobreposição de texto,
espaçamento errado e uso da logo vertical em vez da lateral foram defeitos meus, não
mudança de pedido. Pedido do cliente foram duas — *"esqueça a imagem, faça em P&B"* e
*"use a logo nova, onde o nome é lateral"* —, e as duas estão dentro das 2 rodadas inclusas
por entrega. **Nada a cobrar de rodada extra aqui.**

### 3 · `logo-lateral.svg` — assinatura lateral

Arquivo de marca novo que ele enviou em 26/08: **o nome ao lado da montanha**, não
empilhado embaixo. Montanha · filete · `#DESBRAVANDOUTV`.

Construído como asset vetorial de verdade em `marca/logo-lateral.svg`: montanha do vetor
existente + o texto convertido em **curvas** de Archivo Bold (`texto-para-svg.py`), nas
proporções medidas no arquivo dele. Não depende de fonte instalada e serve para impressão
igual à tela — o `logo-desbravando.svg` vertical continua valendo em crachá, adesivo e
cordão.

**Enquadramento.** O contrato **exclui logotipo e identidade visual** da mensalidade e da
taxa de arte (seção 03) — item de orçamento à parte por definição. Não é criação de
logotipo, porque o desenho é dele; é construção do arquivo vetorial reutilizável.
Precedente do próprio ciclo anterior: a preparação vetorial do adesivo entrou no valor da
peça. Sugestão: **R$ 40**, como peça complexa.

⚠️ **O arquivo original dele não está no disco** — só foi colado na conversa. O asset foi
reconstruído a partir do vetor da montanha + Archivo Bold: fiel na estrutura e nas
proporções, mas se a tipografia do original for outra família o traço da letra não bate.
Pedir o arquivo antes de usar em peça impressa.

### 4 · Código de conduta — “A favor do off-road consciente”

Uma peça, 1080 × 1920, na mesma linguagem da série de programação. **Remontagem de uma peça
que ele já tinha** (a com foto de fundo e o mesmo texto de conduta), na identidade P&B.

**O que exigiu construção nova.** A série de programação é linha do tempo de horários;
esta é regra numerada — seis seções, cada uma com título e lista, uma delas com parágrafo
de explicação e sub-lista (“Lembrando”), mais os dois essenciais no pé. Template próprio
(`templates/manifesto.mjs`), reaproveitando de propósito a malha *número · trilho · corpo*
da agenda: é o que faz a peça ler como parte do conjunto sem repetir o layout.

**Densidade** foi o problema, não o vão: ~27 linhas de texto num quadro de story. Resolvido
mantendo o corpo em 18px (12px caberia, e viraria ~4pt no celular) e cedendo folga entre
seções. Duas correções minhas no caminho: mancha de 26em deixava a metade direita do
quadro vazia, e o filete do bloco “Observação importante” virava uma segunda linha
vertical a 2px do trilho.

**Duas liberdades de texto**, para conferir com ele: o `&` de “Vilarejos & Comunidades”
virou “e” (o ampersand do Anton é largo e briga com a caixa alta espaçada) e os dois
essenciais do pé viraram frase fechada (“Capacete e cinto de segurança, sempre.” /
“Não jogue lixo na trilha. Lixo no lixo.”).

**Como eu enquadraria.** Uma arte, mas não é post: é peça de seis blocos com hierarquia
de três níveis e template próprio, do mesmo tipo de trabalho da primeira peça da série de
programação. Sugestão: **R$ 40**.

### 5 · Carta de drinks do evento

Uma peça, 1080 × 1920, no template do código de conduta — cinco drinks numerados (a
contagem 1–5 é pedido dele) com nome e ingredientes. **Custo de conteúdo, não de
construção:** o template já existia, entrou dado e escala.

O que exigiu trabalho de verdade foi a escala. A mesma peça que aguenta 27 linhas de
conduta com 5 drinks fica com metade do quadro vazia, então o corpo sobe 80% (`escala`
1,80). **1,80 é o teto**, medido: acima disso a lista do Mojito quebra em duas linhas e
sobra “gás” órfão. Drink novo com lista mais longa que a do Mojito exige baixar a escala.

O 🍹 do título saiu — emoji entra colorido e a identidade é P&B estrito.

**Duas melhorias no template**, que valem para o código de conduta também (peça
re-entregue): o trilho virou **espinha contínua** atravessando a lista, porque um trilho
por item virava toco solto ao lado do ponto quando a peça é arejada; e rodapé sem conteúdo
deixou de desenhar um filete solto no pé.

**Como eu enquadraria.** É arte padrão de post (**R$ 15**) — o template é o mesmo da peça
anterior e o trabalho foi de conteúdo e de acerto de escala.

### 6 · Expedição Origens — proposta em imagem

O PDF de proposta da Expedição Origens (23–25/10, Brotas) virado **peça de imagem**, a
pedido dele: “imagem e não pdf”. Uma peça, 1080 × 1920, com o conteúdo integral do
documento — roteiro dos três dias, hospedagem, o que está e o que não está incluso,
segurança, valor e formas de pagamento.

**O trabalho aqui foi de forma, não de texto.** O documento tem seis assuntos de natureza
diferente; em PDF eles viram seis páginas de lista, e num quadro de story esse mesmo
conteúdo pede ~2 400 px de altura. O caminho errado seria encolher a letra até caber. Cada
assunto ganhou a forma que ocupa menos altura sem perder leitura:

| assunto | forma |
|---|---|
| Roteiro | lista numerada (a malha do conjunto), hora e evento em duas colunas |
| Está incluso | checklist em **duas colunas** — 11 itens em 6 linhas |
| Não está incluso | uma linha só, itens separados por bullet |
| Valor | rodapé ancorado, número em Anton: é o fecho da peça |

**Condensação da lista de inclusos, para conferir com ele:** eram 15 linhas com repetição
por dia, viraram 11 sem perder informação — café da manhã de sábado e domingo numa linha
(os dois na pousada), bebidas e gelo das duas trilhas numa linha, jantar na pousada das
duas noites numa linha, hospedagem das duas noites numa linha. E “chopp, drinks, música ao
vivo e jantar”, que aparecia dentro dos dois eventos, saiu para nota — era a mesma frase
duas vezes.

**Rodada 1 de 2 (inclusa), em 02/09.** Ele mandou a **v2 do PDF** e pediu um elemento novo:

| mudança | de onde vem |
|---|---|
| “Expedição masculina” | v2 do PDF |
| **Pacote 1 Dia — R$ 1.450**, com a observação da saída após o café do dia seguinte | v2 do PDF |
| **“Vagas limitadas”** | pedido dele, não está no PDF |

Os dois selos (classificação e chamada) viraram **pílula** em vez de mais uma linha de
texto: o bloco de título já tinha quatro linhas, e pílula lê como etiqueta, não como
continuação da leitura. O “vagas limitadas” é o único elemento **sólido** da peça — numa
identidade P&B, preencher é o acento mais forte que existe, e é onde o olho cai depois do
título. Os dois pacotes ficaram **lado a lado**, porque preço se lê comparando: empilhados,
o segundo pareceria condição do primeiro em vez de alternativa. Escala de 1 para 0,95 para
absorver as três linhas novas sem encostar no topo.

**Como eu enquadraria.** Template novo (`templates/oferta.mjs`) com cinco estruturas que
não existiam: dia de roteiro com trecho e quilometragem, grade de hora × evento, checklist
de duas colunas, linha corrida de exclusões e bloco de preço. Mesmo porte da primeira peça
da série de programação, com trabalho a mais de reorganização de conteúdo. Sugestão:
**R$ 50**.

### 7 · Programa de Parcerias · Veículo Oficial — apresentação de 10 páginas

Adaptação da apresentação de **Apoio Mecânico** para uma proposta de **Veículo Oficial de
Apoio**, conforme o briefing de alteração que ele mandou em 02/09. Não é ajuste da peça
anterior: é **versão nova do documento**, num arquivo de dados próprio
(`dados/parcerias-veiculo-oficial.json`), com o de Apoio Mecânico intacto e ainda
renderizável.

| página | o que mudou |
|---|---|
| 01 capa | selo “Apoio Mecânico” → **Veículo Oficial**; título e assinatura mantidos |
| 02·03·04 | institucionais, sem alteração de texto |
| 05 território | título, promessa, **pergunta** e os 5 itens (Presença · Utilidade · Produto em situação real · Conteúdo · Relacionamento) |
| 06 ganhos | os 6 benefícios substituídos |
| 07 momentos | os três casos passam a **01 No caminho · 02 Na experiência · 03 No conteúdo** |
| **08 nova** | **Como o veículo pode fazer parte** — 8 possibilidades + a ressalva de que são exemplos, não pacote fechado |
| 09 construção | estrutura mantida + faixa **VEÍCULO + EXPERIÊNCIA + CONTEÚDO + ATIVAÇÕES** |
| 10 encerramento | sem alteração |

**Foto por slot — a decisão que definiu esta versão.** Ele baixou e passou as 4 fotos em
03/09; as outras 3 não existem. A primeira versão tratou isso como modo da peça inteira
(tudo tipográfico) e estava **errado**: o certo é a página que tem foto usar a foto e a
página que não tem virar tipográfica — não as sete se rebaixarem à pior. Agora a decisão é
por slot, automática pela presença do arquivo.

O que o template ganhou nas duas rodadas, e vale para qualquer parceiro futuro: **não existe
caixa vazia escrito “foto”** (num documento de proposta lê como rascunho e derruba a
credibilidade de tudo em volta); sem foto a grade de duas colunas colapsa em uma; capa e
encerramento sem foto usam o campo de curvas de nível da identidade; e os casos da página 07
sem foto viram trio editorial com o número grande em Anton.

**As 4 fotos, onde entraram** — mapeadas pelo conteúdo, não pela ordem em que chegaram:

| foto | página |
|---|---|
| Comboio de UTVs na praia, drone (a única horizontal) | 01 capa |
| Comboio subindo a trilha em fila | 07 / 01 No caminho |
| Churrasqueira de roda à noite | 07 / 02 Na experiência |
| UTVs alinhados no alto do morro | 07 / 03 No conteúdo |

Bate com as três sugestões de imagem que o briefing dá para a página 07 (comboio · ponto de
apoio · paisagem forte), e a horizontal é a única que serve de fundo de capa.

**As três da página 07 saem em cor**, a pedido dele em 03/09 — exceção deliberada à regra de
identidade, que manda a peça de marca inteira monocromática. O argumento a favor: naquela
página as fotos SÃO o argumento (“imagine sua marca aqui”), e num documento de dez páginas em
P&B a cor ali vira o pico do documento em vez de virar inconsistência. Capa e demais páginas
seguem dessaturadas de propósito — é o contraste que dá o efeito.

Na mesma linha: **número de audiência vazio não vira travessão** (ou entram os quatro, ou a
página fica só com o texto — meia régua preenchida lê pior que régua nenhuma) e **contato
vazio não imprime “contato a preencher”**: documento que vai para a marca não anuncia o
próprio buraco. As 14 pendências saem no console de quem renderiza, que é quem resolve.

⚠️ **Ainda falta:** 3 fotos — operação (p. 03), **caminhonete em ação (p. 05)** e fim de dia
na trilha (p. 10) —, os 4 números de audiência e o contato. A da página 05 é a única que o
briefing pede **com o veículo**, e é a que mais falta: ali o argumento é “produto em situação
real”. Enquanto não vierem, essas três páginas seguem tipográficas e coerentes — basta
salvar o arquivo com o nome que o JSON indica e re-renderizar.

**Como eu enquadraria.** 10 páginas, 6 alteradas e 1 nova, mais um modo de layout novo no
template. É documento, não arte de post — mesma natureza do que o contrato chama de criação
digital, mas de porte muito maior. Sugestão: **R$ 120**, e a versão com as fotos entra como
rodada inclusa.

### 8 · Formulário de avaliação da expedição

Pedido pelo WhatsApp em 03/09: “no mesmo estilo do cardápio, para os clientes avaliarem a
expedição — nome, nota, comentário”. Três campos, e só esses três: formulário de avaliação
com mais campos é formulário que ninguém termina. No ar em
`cardapio.desbravando-utv.workers.dev/avaliacao-expedicao`, amarrado à Urubici de agosto.

**Teve desenvolvimento, não só configuração.** O tipo de campo `nota` não existia no
módulo — é escala de avaliação (1 a 5, com rótulo nas pontas), diferente do `numero` que já
havia: nota é comparável entre respostas e cabe num toque, número é digitado e aceita 0 a
999. Fica disponível no painel para qualquer formulário futuro.

**Uma correção que este formulário revelou.** O pé da página prometia, em texto fixo no
código: *“usamos estas respostas só para planejar a alimentação da expedição. Nada é
publicado nem repassado para terceiros.”* Correto para o cardápio, errado em qualquer outro
formulário — e num de avaliação é um problema de verdade, porque promete que nada é
publicado justamente onde o cliente vai querer publicar o elogio. A promessa virou dado do
formulário (migração v4.5), com campo no painel, e os dois formulários de cardápio que já
existem mantiveram a promessa original — quem respondeu leu aquele texto.

**Régua:** R$ 50, como os outros dois. Decisão dele em 03/09 — *“já é o terceiro
formulário, são 3 cobranças”*. ⚠️ Mas o primeiro já foi pago no fechamento de 26/08, então
o que entra neste ciclo são **dois** (vinícola + avaliação), R$ 100.

### 9 · Formulário de cadastro — Expedição Origens

Pedido em 04/09: “mesmo estilo do anterior, um formulário pros clientes preencherem para mim
fazer o cadastro de cada um”. No ar em
`cardapio.desbravando-utv.workers.dev/cadastro-origens`, amarrado ao evento **Origens**
(23–25/10) — os três anteriores são da Urubici de agosto.

Os seis dados que ele pediu, com o endereço partido em **dois** campos (rua e número · CEP)
para a planilha do cadastro sair com coluna limpa em vez de texto corrido, e estado civil
como escolha em vez de digitação.

**Teve desenvolvimento.** Dois tipos de campo novos: `cpf`, **validado pelos dígitos
verificadores no servidor** e gravado sempre como `000.000.000-00`, e `cep`. A validação não
é preciosismo — o formulário alimenta cadastro e contrato, e CPF errado só aparece dias
depois, quando o contrato volta e o cliente está esperando. CPF inválido conta como campo não
respondido: o formulário recusa e diz que falta o CPF, em vez de guardar documento quebrado
com aparência de certo. A máscara na tela só formata o que já foi digitado, nunca completa
nem corrige o documento de ninguém. O CEP **não consulta serviço externo** de propósito: a
página tem de abrir com sinal ruim, e endereço vindo de fora chega errado em zona rural.

⚠️ **Primeiro formulário que coleta documento.** O token do CSV deixou de expor preferência
de jantar e passou a expor CPF e RG de todos os clientes. Recomendação registrada no README:
não colar a fórmula em planilha compartilhada com o grupo, e trocar o token no painel quando
o cadastro terminar.

**Rodada 1 de 2 (inclusa), em 08/09.** Ele pediu a opção **piloto ou acompanhante** e o
**nome do piloto** quando for acompanhante. Ele falou “check box”, mas as duas opções se
excluem — virou escolha única. O nome do piloto ficou **condicional de verdade**: aparece e
passa a ser obrigatório só quando marca Acompanhante, e ao voltar para Piloto o campo limpa.
Isso é capacidade nova do módulo (`depende: {campo, valor}`), reaproveitável em qualquer
formulário. Aplicado por UPDATE e não INSERT, porque o formulário já estava no ar com
resposta gravada — recriar mudaria o link e o token.

**Régua:** R$ 50, como os outros. Nada a mais pela rodada de 08/09.

#### 10 · E-mail, valor do pacote e forma de pagamento — 09/09

Pedido dele: e-mail, valor do pacote (R$ 2.300) e forma de pagamento (Pix ou 2× no boleto,
vencimentos 15/09 e 15/10, com a última parcela antes da expedição).

**Não lancei como rodada de ajuste, e a diferença importa.** Rodada é acerto do que já foi
entregue; isto é **escopo novo** — dois campos que não existiam, mais dois tipos de campo
construídos no módulo:

- **`email`**, validado no servidor. O contrato sai por e-mail, então e-mail com typo é
  contrato que nunca chega. A validação é de propósito frouxa: regra apertada recusa e-mail
  válido e trava a reserva de um cliente real, estrago maior que um endereço torto.
- **`informe`**, painel de informação dentro do formulário. Ninguém digita o preço que vai
  pagar, e ele **não vira coluna na planilha** — coluna vazia com título de aviso faz quem lê
  a planilha desconfiar do resto.

Pelo contrato, aliás, esta seria a **rodada 2 de 2 — ainda inclusa**. Ele decidiu cobrar
(*"já é o terceiro ajuste"*), e cobrar está certo, mas o lugar honesto na fatura é *escopo
novo*, não *rodada extra* — a taxa de rodada extra praticada é R$ 5, e isso aqui não é R$ 5
de trabalho. **Sugestão: R$ 30**, pouco mais da metade de um formulário novo.

⚠️ **Duas coisas ficaram em aberto, ditas e não respondidas:** o valor está fixo em R$ 2.300
(existe o Pacote 1 Dia de R$ 1.450 — se o formulário servir os dois, o valor não pode ser
fixo), e **a arte da Origens está circulando com "cartão em até 10× com juros" e "boleto em
até 2×"**, que não é mais a régua. A arte precisa de correção.

🛑 **Incidente meu, no mesmo dia:** publiquei com acento grave dentro de comentário CSS e o
formulário de cadastro respondeu `Error 1101` — fora do ar até o deploy seguinte, ~2 min.
Terceira vez com a mesma armadilha, primeira em produção. Criei trava de deploy que importa o
módulo e renderiza antes de publicar, provada quebrando de propósito. **Não cobrável** — e o
tempo da trava também não.

#### 11 · Telefone, camiseta, emergência e o e-mail condicional — 09/09, segunda leva

Quatro pedidos: **telefone**, **tamanho de camiseta** (P a G4), **nome e telefone de
emergência**, e o e-mail passando a ser exigido **só de quem paga por boleto** (com a frase
do contrato por e-mail removida).

**Tipo `telefone` novo no módulo:** 10 ou 11 dígitos, gravado sempre como `(00) 00000-0000`,
e aceita e descarta o `55` que muita gente cola do WhatsApp. Com dois campos de telefone no
mesmo formulário, formato homogêneo deixou de ser estética — é o que permite discar direto da
planilha sem reler.

**O e-mail condicional obrigou a reordenar o formulário.** A dependência só pode apontar para
pergunta que já veio antes, senão o campo fica invisível para sempre. O bloco de pagamento
subiu e o e-mail virou o último campo. Lê melhor assim — *escolheu boleto, então me dê o
e-mail* — mas a restrição é técnica, não estética.

⚠️ **Consequência de negócio a ter em mente:** quem paga por Pix não deixa e-mail nenhum. O
contato dessa pessoa passa a ser o telefone, que entrou nesta mesma leva; as duas mudanças se
encaixam por acaso, não por desenho.

Conferido no navegador contra a produção: o e-mail aparece e vira obrigatório ao marcar
boleto, limpa ao voltar para Pix, a máscara fecha em `(11) 98765-4321`, zero erro de JS. E
esta foi a primeira alteração publicada **passando pela trava de deploy** criada horas antes.

**Régua: R$ 30**, mesmo enquadramento do item 10 — escopo novo (um tipo de campo a mais,
quatro campos, reordenação), não rodada de ajuste.

### Ferramenta criada no caminho (não cobrável)

`templates/comum.mjs` — o cromo das peças de social (fundo, véu, coluna de três faixas,
marca, bloco de título) e a malha *número · trilho · corpo*, num lugar só. Extraído quando
a terceira peça ia copiar o mesmo CSS pela terceira vez — copiado, ele divergiria e ninguém
saberia qual versão é a certa. O refator foi conferido por **md5 do PNG antes e depois**: as
duas peças já entregues saíram byte a byte idênticas.

`ferramentas/topografia.mjs` — gerador do campo de curvas de nível. O script que fez as
cinco texturas da programação era avulso e se perdeu; a sexta peça precisaria refazer a olho
um fundo que tem que ler como a mesma família. Agora a família é reproduzível por semente.

`ferramentas/medir-arte.mjs` — mede a peça no navegador e acusa colisão de **tinta** (não
de caixa de métrica), texto fora da página e o ritmo entre blocos. Existe porque eu estava
entregando peça com texto sobreposto e descobrindo pelo olho dele. Passa a rodar em toda
peça antes de mostrar.

---

## Precificação — preço fechado por peça

Definido pelo Pedro em **24/08/2026**, item a item. O modelo é **preço fechado por peça**:
cada peça tem um valor único, e a coluna *artes* diz quantos arquivos finais distintos
aquele valor cobre. Isso é diferente de multiplicar arte por arte — e é de propósito:
uma peça entregue em duas ou quatro variações é um problema resolvido uma vez.

Base contratual: a seção 03 do Escopo põe **peça complexa, logotipo e identidade visual
fora da taxa de R$ 15** e manda orçá-las à parte. Nenhum destes valores é reajuste da
taxa de arte padrão — são orçamento de peça que o contrato nunca cobriu.

| # | peça | artes | R$ | o que o valor cobre |
|---|---|---:|---:|---|
| 1 | Crachá da equipe | **2** | **50** | duas diagramações distintas — *centro* e *editorial* — do mesmo crachá, para escolha |
| 2 | Cordão de pescoço | 1 | 25 | fita de 20 × 900 mm com sangria de costura |
| 3 | Camiseta PRODUÇÃO | **2** | **70** | as duas estampas: costas (palavra em curvas + ícone, 8 cm) e frente (ícone, 3 cm) |
| 4 | Cardápio Queijo, Pizza & Vinho | **4** | **60** | os quatro formatos: mesa A5, mesa A4, stories e feed |
| 5 | Bandeiras | 5 | 95 | Desbravando e Can-Am a R$ 25 (marca em vetor a 2,5 m) · Canadá, Brasil e EUA a R$ 15 (bandeira oficial: arquivo e escala, não criação) |
| 6 | Carta de recepção | 2 | 55 | versão clara (texto longo diagramado, R$ 40) e escura (troca de tema, R$ 15) |
| 7 | **Adesivo do UTV** | **2** | **80** | os dois selos, **a revetorização completa e os 40 arquivos da série 01–20 nas duas cores**, cada um gerado e auditado individualmente |
| 8 | Cartão de identificação do UTV | 1 | 30 | frente e verso no mesmo arquivo, furo de 6 mm, verso claro para escrever à caneta |
| 9 | Chaveiro de fita | 3 | 55 | variante A a R$ 25 (adaptação da fita para 25 cm) · B e C a R$ 15 (variação sobre a mesma grade) |
| | **Total** | **22** | **520** | |

**O adesivo é o único que subiu**, de R$ 55 para R$ 80, e o motivo é o volume real de
retrabalho: a peça foi refeita do zero como vetor puro e a série numerada foi gerada e
auditada **arquivo por arquivo** — 40 PDFs e 40 SVGs, cada um conferido para ter 0 imagem
e 0 fonte embutida. A linha separada de "preparação vetorial para gráfica" que existia
antes **foi absorvida aqui** e não aparece mais na fatura.

> Nota interna: a reclamação de serrilhado da gráfica tinha causa do nosso lado (logotipo
> em imagem no PDF preto, e rasterizado a ~30 dpi no branco pelo filtro CSS). O Pedro
> decidiu cobrar os R$ 80 pelo conjunto, ancorando no volume dos 40 arquivos. Se o cliente
> puxar o assunto, o argumento que se sustenta é o entregável — 40 arquivos vetoriais
> auditados, um por UTV —, não o conserto.

*Acompanha, sem cobrança:* prova com marcas de corte, 2 artes sem fundo da camiseta, 3
bandeiras em proporção oficial, mapa de aplicação e ficha de especificação técnica.

### Ajustes além das 2 rodadas inclusas

O contrato dá 2 rodadas por entrega e diz que revisões adicionais são orçadas à parte. O
R$ 5 tem precedente **por escrito**: o fechamento de 23/07 traz "Ajuste na logística
(revisão) + R$ 5". Das 14 rodadas, 3 passaram do limite — camiseta (4) e cardápio (3) —
o que dá **R$ 15**. Fica em R$ 5: mexer nisso por R$ 15 no total não paga o atrito.

### O que ainda não está resolvido

- **Preço de peça complexa precisa de aprovação por escrito ANTES de produzir.** Os
  pedidos vieram por WhatsApp, o que cobre a solicitação — não o preço. O descritivo de 5
  páginas serve de orçamento retroativo; do próximo ciclo em diante, mandar antes.
- ~~Formulário de cardápio.~~ **Decidido em 24/08: R$ 50.** Não é arte nem criação
  digital — é software, e era o único item da fatura sem âncora contratual. Entra como
  linha própria da fatura, fora do bloco de artes.

## Documento de pré-aprovação

O fechamento em PDF com identidade RYZE sai deste mesmo conjunto de dados:
`node ferramentas/render.mjs fechamento` gera 6 páginas A4 e só entrega se o
`auditar-fechamento.py` aprovar. Entregue em
`estudio-briefing-desbravando-utv/artes/saida/fechamento-2026-08.pdf` (a cópia `RYZE-Fechamento-Desbravando-26-07-a-25-08-PRE-APROVACAO.pdf` que ficava em Downloads não existe mais; regenera com `artes/templates/fechamento.mjs` a partir de `artes/dados/fechamento-2026-08.json`).

## Detalhe item a item — as 22 artes

O valor é fechado por peça (tabela acima). Aqui está o que cada arquivo é, com a
especificação tirada do template que o gerou, e o trabalho que ele deu. Serve para
sustentar a conversa se o cliente perguntar "por que isso custa isso".

---

### 1 · Crachá da equipe — 2 artes · **R$ 50 fechado**
Formato: **54 × 86 mm** final, +3 mm de sangria em volta (arquivo 60 × 92 mm), PVC.

**1.1 · layout *centro*.** Frente com foto, nome e cargo; verso no mesmo arquivo. A grade
foi construída do zero e precisa aguentar nome curto e nome longo sem quebrar, porque o
dado muda por pessoa. Texto convertido em curvas — a gráfica não instala fonte.
**1.2 · layout *editorial*.** Segunda diagramação, com a foto e a hierarquia em outra
posição, para escolha. Reaproveita conteúdo, medidas e grade da 1.1.

*São duas artes distintas, não uma com ajuste: são dois desenhos que existem em paralelo,
e a escolha entre eles ainda está aberta.*

### 2 · Cordão de pescoço — 1 arte · **R$ 25**
Formato: fita de **20 × 900 mm** (90 cm), +2 mm de sangria (arquivo 904 × 24 mm).

Ícone em repetição ao longo de 90 cm com espaçamento constante, mais o nome em curvas. A
sangria de 2 mm existe porque a costura da fita come a borda.

### 3 · Camiseta PRODUÇÃO — 2 artes · **R$ 70 fechado**
Saída de cada uma: PDF vetorial em curvas + PNG 300 dpi com fundo transparente.

**3.1 · estampa das costas.** Palavra com **80 mm** de largura, ícone de **30 mm** acima,
5 mm de respiro. Medida física exata, porque 8 cm na nuca é medida que o cliente confere
com régua. Passou por duas rodadas de troca de medida — começou em 3 cm.
**3.2 · estampa da frente.** Ícone de **30 mm** no peito esquerdo. É o mesmo ícone da 3.1,
isolado e reescalado.

*Duas artes distintas: são dois arquivos que a estamparia usa em posições diferentes da
peça, cada um com sua medida.*

### 4 · Cardápio Noite do Queijo, Pizza & Vinho — 4 artes · **R$ 60 fechado**

**4.1 · mesa A5.** 148 × 210 mm + 3 mm de sangria. Layout do zero: foto de banco
dessaturada conforme a identidade, 5 sabores com hierarquia, título, e a frase do chef
acrescentada depois. Três rodadas de ajuste (tirar dados do rodapé, tirar "noite de
queijos", entrar a frase).
**4.2 · mesa A4.** 210 × 297 mm + 3 mm. Reflow da A5: a proporção muda e o corpo do texto
e os respiros são recalculados; o desenho é o mesmo.
**4.3 · stories.** 1080 × 1920 px, PNG em pixel exato, com data, local e o recado.
**4.4 · feed.** 1080 × 1350 px, mesmo conteúdo na proporção do feed.

*Quatro artes distintas: dois formatos de impressão com sangria e dois de rede social em
pixel exato — cada um é um arquivo que vai para um lugar diferente.*

### 5 · Bandeiras — 5 artes · **R$ 95**
Formato de todas: **2500 × 1500 mm** final, +30 mm de sangria por lado (arquivo 2560 ×
1560 mm) — a sangria é larga porque bandeira leva bainha costurada.

**5.1 · Desbravando · R$ 25.** Marca vetorizada centralizada em 2,5 m de pano, preta com
escrita branca, conferindo que nada importante cai na área da bainha.
**5.2 · Can-Am · R$ 25.** Mesma construção, a partir do logo Can-Am em vetor.
**5.3 · Canadá · R$ 15 · 5.4 · Brasil · R$ 15 · 5.5 · Estados Unidos · R$ 15.**
Reprodução de bandeira oficial: cor e geometria são normatizadas, então o trabalho é de
arquivo e escala, não de criação.

### 6 · Carta de recepção (Urubici) — 2 artes · **R$ 55**
Formato: A5, **148 × 210 mm** + 3 mm de sangria.

**6.1 · versão clara · R$ 40.** Texto longo diagramado do zero, com entrelinha e medida de
coluna pensadas para leitura corrida — quem lê é família, não equipe. Precisou ajuste de
entrelinha porque os acentos do Anton colidiam no título.
**6.2 · versão escura · R$ 15.** Mesma diagramação com a paleta invertida, para escolha.

### 7 · Adesivo do UTV — 2 artes · **R$ 80 fechado**
Formato: **Ø 150 mm** final + 3 mm de sangria (arquivo 156 × 156 mm), corte circular.

**7.1 · selo preto.** Construído do zero: marca, edição, público, ano, local e número em
anéis de hierarquia dentro de um círculo — texto em disco é o caso em que a hierarquia
briga com o formato. Uma rodada de ajuste depois: ano dividido em 20/26 e retirada do
período.
**7.2 · selo branco.** Mesma arte com a paleta invertida.

**O que mais está dentro dos R$ 80.** A peça foi **refeita inteira como vetor puro** depois
de a gráfica reclamar de serrilhado ao dar zoom: disco e anel viraram círculos vetoriais,
o logotipo — que só existia em raster — foi convertido em curvas pelo contorno do canal
alfa, e todo o texto virou curva de fonte. E a **série numerada 01–20 nas duas cores foi
gerada e auditada arquivo por arquivo**: 40 PDFs e 40 SVGs, cada um conferido para ter 0
imagem e 0 fonte embutida, mais uma prova de zoom em 2400 dpi comparando antes e depois.

*É o único valor que subiu (era R$ 55) e é onde está o volume real de retrabalho.*

### 8 · Cartão de identificação do UTV — 1 arte · **R$ 30**
Formato: **100 × 70 mm** final + 3 mm de sangria, furo de **6 mm** para pendurar.

Duas faces no mesmo arquivo. O verso é claro **de propósito**: caneta comum não escreve
sobre preto, e o cartão é preenchido à mão durante a expedição. A posição do furo foi
conferida contra o conteúdo, para não perfurar informação.

### 9 · Chaveiro de fita — 3 artes · **R$ 55**
Formato: fita de **20 × 250 mm** (25 cm), +2 mm de sangria.

**9.1 · variante A, só ícone · R$ 25.** Adaptação da fita do cordão para um comprimento
quase 4× menor: o espaçamento da repetição foi recalculado para fechar bem.
**9.2 · variante B, ícone + nome · R$ 15 · 9.3 · variante C, nome + @ · R$ 15.**
Variação de conteúdo sobre a mesma grade da 9.1.

---

**Fechamento: 9 peças · 22 artes · R$ 520.**

## Detalhe por peça (visão de conjunto)

### 1 · Crachá da equipe

| | |
|---|---|
| Formato | PVC 54 × 86 mm, frente e verso, arquivo com 3 mm de sangria |
| Versões (3) | layout *centro* · layout *editorial* · conferência com marcas de corte |
| Arquivos | frentes (6 páginas, uma por pessoa) · verso comum · provas 300 dpi |
| Rodadas (1) | reequilíbrio da grade quando a foto entrou (o cargo saía da área segura) |
| Pendente | escolher o layout · retratos e nomes/cargos reais |

### 2 · Cordão

| | |
|---|---|
| Formato | fita 20 mm × 90 cm · arquivo 904 × 24 mm com 2 mm de sangria |
| Versões (1) | preto com o ícone da montanha em cinza a cada 70 mm |
| Rodadas (1) | cinza clareado para não sumir na sublimação |

### 3 · Documento do Programa de Parcerias (para marcas)

| | |
|---|---|
| Formato | 1920 × 1080, 9 páginas, PDF |
| Versões (1) | território *Apoio Mecânico* |
| Rodadas (2) | entrelinha dos títulos (acentos do Anton batendo) · fotos provisórias aplicadas |
| Reaproveitável | a página 5 é a única que muda por parceiro — **cada novo território é uma versão nova**: gastronomia, bebidas, seguros, fotografia, mobilidade… |
| Pendente | 4 números (seguidores, alcance, visualizações, engajamento) · contato · trocar as 7 fotos provisórias por fotos da operação |

### 4 · Camiseta PRODUÇÃO

| | |
|---|---|
| Estampa atual | costas: **PRODUÇÃO com 80 mm** + ícone de **30 mm** acima · frente: ícone 30 mm no peito esquerdo |
| Versões (4) | costas e frente, cada uma em "visível" (branco sobre preto) e "sem fundo" (produção) |
| Rodadas (4) | mockup 3D · retirada do 3D · versão visível (a arte branca abria em branco) · **inversão das medidas: a palavra passou a 80 mm e o ícone a 30 mm** |
| Pendente | confirmar a grafia "Brisket" não se aplica aqui; confirmar demais cargos — **cada cargo é uma versão nova** (Videomaker, Guia, Mecânico, Operacional, Atendimento) |

### 5 · Cardápio — Noite do Queijo, Pizza & Vinho (13/ago)

| | |
|---|---|
| Versões (4) | social stories 1080×1920 · social feed 1080×1350 · mesa A5 · mesa A4 |
| Diferença | as sociais levam data, local e recado; as de mesa não levam nada disso |
| Rodadas (3) | ancoragem da foto de fundo · retirada das informações + mudança para formato de impressão · **fora o subtítulo e o rodapé de patrocínio, entrou o recado do chef** |
| Pendente | confirmar "Brisket" (veio "Briske") · descrições dos sabores, se a pizzaria mandar · trocar a foto de fundo, hoje de banco livre em CC BY-SA |

### 6 · Bandeiras

| | |
|---|---|
| Formato | 2,50 × 1,50 m · arquivo 2560 × 1560 mm com 30 mm de sangria · vetorial 1:1 |
| Versões (8) | Desbravando · Can-Am · Canadá · Brasil · EUA **+** as três nacionais em proporção oficial |
| Rodadas (0) | — |
| Aguarda a gráfica | quanto de sangria/acabamento · RGB ou CMYK · face única ou dupla (dupla exige arte espelhada nas de marca) |
| Ressalva | as duas de marca usam logo em imagem a ~80 dpi no tamanho final; o logotipo com a escrita não existe em vetor. Com o AI/EPS original, viram vetor puro |

### 7 · Carta de recepção — 3ª Expedição Família (Urubici)

| | |
|---|---|
| Formato | A5 148 × 210 mm + 3 mm de sangria · uma página |
| Versões (2) | **clara** (tinta preta no papel) e **escura** (fundo preto, tinta branca) |
| Texto | do PDF que o cliente enviou, sem reescrever — só diagramado |
| Nota de design | peça de leitura, não de impacto: coluna de 104 mm, entrelinha 1.62, título contido. A clara imprime mais barato e lê melhor |

### 8 · Adesivo do UTV

| | |
|---|---|
| Formato | círculo Ø 150 mm + 3 mm de sangria · P&B, como ele pediu (a referência vinha em azul/verde-limão) |
| Versões (2) | fundo **preto** e fundo **branco**, para escolher |
| Rodadas (1) | 18/08: ano em dois blocos (20/26), fora o período da expedição, e versão em branco |
| Série | `--numeros=01,02,03…` gera o resto num comando, sem cobrança por número |

### 9 · Cartão de identificação do UTV

| | |
|---|---|
| Formato | 100 × 70 mm + 3 mm de sangria · furo de 6 mm marcado no topo |
| Versões (1) | frente (selo da expedição) + verso |
| Rodadas (1) | 18/08: selo atualizado junto com o adesivo (ano dividido, sem período) — sem cobrança |
| Nota de design | **verso claro de propósito**: é preenchido à mão e caneta comum não escreve sobre preto |

### 10 · Chaveiro de fita

| | |
|---|---|
| Formato | fita 20 mm × 25 cm + 2 mm de sangria · sublimação |
| Versões (3) | **A** só o ícone · **B** ícone + DESBRAVANDO UTV · **C** ícone + nome + @desbravando_utv (como o cordão de referência) |
| Pendente | escolher A, B ou C · confirmar o @ do Instagram · confirmar o comprimento (25 cm é chaveiro; o de pescoço tem 90 cm e já existe) |

---

## Documentos técnicos que acompanham (5)

| documento | peça |
|---|---|
| `ESPECIFICACAO-TECNICA.pdf` (2 páginas) | crachá + cordão |
| `MAPA-DE-APLICACAO.pdf` | camiseta |
| `LEIA-ME.txt` | camiseta · cardápio de mesa · bandeiras |

---

## Histórico

| data | o que aconteceu |
|---|---|
| 10/08 | crachá (2 layouts + conferência), cordão e ficha de especificação · documento de parcerias, 9 páginas · pacote da gráfica montado |
| 10/08 | fotos provisórias de banco livre aplicadas no documento de parcerias (7 slots) |
| 11/08 | camiseta PRODUÇÃO: mapa + artes · mockup 3D feito e **reprovado** · artes refeitas em versão visível |
| 11/08 | cardápio: social (stories + feed) · versão de mesa A5 e A4 |
| 11/08 | bandeiras: 5 peças + 3 em proporção oficial, oneshot |
| 11/08 | ajustes: camiseta com medidas invertidas (80/30) · cardápio sem subtítulo, sem rodapé, com recado do chef |
| 11/08 | entrega reorganizada: finais soltos em `~/Downloads`, pacotes completos em `_arquivo-artes-desbravando` |
| 18/08 | ajuste no adesivo: ano em dois blocos (20/26), fora o período da expedição, e versão em fundo branco para comparar. O cartão usa o mesmo selo e foi atualizado junto, sem cobrança |
| 17/08 | pedido novo do cliente: **4 peças da 3ª Expedição Família** (Urubici, 26–30/08) — carta de recepção (2 versões), adesivo do UTV, cartão de identificação e chaveiro de fita (3 variantes). 7 arquivos finais |

## Ativos de marca produzidos no caminho

Não são artes, mas ficam para todas as peças futuras:

- Fontes da marca extraídas e pesos do Archivo congelados (sem isso o PDF sai com texto virado desenho).
- `can-am-branco.png` — logo do patrocinador em branco com transparência, a partir do arquivo preto sobre branco.
- `logo-desbravando-grande.png` e `can-am-branco-grande.png` — versões ampliadas com tratamento de borda, para peça grande.
- SVGs oficiais das bandeiras de Brasil, Canadá e EUA (domínio público).
- Conversor de texto em curvas — arte de estampa que não depende de fonte instalada.
- Sistema de render: um comando por peça, conteúdo em JSON. A próxima versão de qualquer peça sai em minutos.

