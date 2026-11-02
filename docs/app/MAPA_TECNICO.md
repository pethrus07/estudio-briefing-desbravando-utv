# Mapa Técnico — Estúdio de Briefing (§5.2)

Documentação do funcionamento interno do `index.html` (arquivo único, offline, sem build).
Foco: o que o **Modo Reunião** e o **prompt de extração** precisam conhecer — em especial o
**contrato do rascunho JSON**, que é a interface entre as fases.

Referências de linha são do `index.html` no momento deste documento (podem deslocar com edições).

---

## 1. Visão geral do arquivo

Tudo num `<style>` + markup + um único `<script>`. Ordem dentro do script:

| Trecho | Linhas (aprox.) | Papel |
|---|---|---|
| Blobs base64 | 364–367 | `ANTON_B64`, `ARCHIVO_B64` (fontes TTF); `LOGO_B64`, `CANAM_B64` (logos PNG) |
| `SPEC_MD` | 368–404 | Guia de identidade visual embutido (vai para `MARCA/IDENTIDADE_VISUAL.md` no pacote) |
| Fontes/logo | 406–410 | Injeta `@font-face` e o logo do cabeçalho a partir dos base64 |
| `POS`, `POSBOX`, `miniHTML` | 412–435 | Posições de foto no slide + miniatura esquemática |
| `LIB` | 438–575 | **Biblioteca de blocos** (schema das seções) |
| `THUMB`, `thumbHTML` | 578–598 | Miniaturas esquemáticas dos blocos (biblioteca) |
| `FORMATOS` | 601–607 | Formatos de saída (16:9, A4, flyer, card, stories) |
| `TYPES`, `TIPO_LEGADO` | 610–666 | **Presets** de tipos de arte (sequência de blocos) |
| Estado | 668–671 | `TIPO, SEQ, SECS, VIEW, CUR, TITLED`, `LSKEY` |
| `newRow`, `newSec`, `loadPreset` | 673–683 | Construção de estado |
| status/validação | 684–725 | `contentOf`, `missingOf`, `statusOf`, `hasContent`, etc. |
| Render de campos/cards | 771–836 | `fieldHTML`, `cardHTML` |
| Render de página | 838–913 | `renderAll`, `renderMeta` |
| Modo de visualização | 915–923 | `setView`, toggles `vg`/`vt` |
| Eventos do formulário | 925–1039 | `input`/`change`/`click`/drag-drop; compressão de foto |
| Tipo/formato/adicionar seção | 1041–1086 | seletor de tipo, formato, biblioteca |
| Prévia esquemática | 1088–1231 | `pvHTML`, `openPreview` |
| **Rascunho + autosave** | 1233–1324 | `draftData`, `downloadDraft`, `applyDraft`, `autosave`, `tryRestore` |
| Mini Drive (opcional) | 1333–1349 | `enviarAoMiniDrive` (só se `DRIVE_ENDPOINT` preenchido) |
| **Geração do pacote** | 1351–1468 | `generatePackage` (monta o `.zip`) |
| Início | 1470–1476 | `renderTypes()` + `tryRestore()` ou preset inicial |

---

## 2. Contrato do rascunho JSON (o mais importante)

### 2.1 Produtor — `draftData()` (linha ~1235)

```js
{
  app: "estudio-briefing-desbravando",   // OBRIGATÓRIO — é a "assinatura" verificada ao abrir
  v: 4,                                   // versão do formato
  nome: "<nome do projeto>",              // string (valor do #nome)
  tipo: "<id de TYPES>",                  // ex.: "exp_interna" | "exp_externa" | "marca" | "flyer" | "card" | "livre"
  formato: "<id de FORMATOS>",            // "apresentacao" | "a4" | "flyer" | "card" | "stories"
  seq: <int>,                             // contador interno de ids de seção
  view: "guiada" | "tudo" | "reuniao",    // modo de visualização (ver §7 — "reuniao" adicionado no Modo Reunião)
  cur: <int>,                             // índice da seção atual (modo guiado)
  secs: [ <Secao>, ... ],                 // as seções (conteúdo)
  salvo_em: "<ISO datetime>"              // carimbo; usado só para exibição na restauração
}
```

### 2.2 Objeto `Secao` (criado por `newSec`, linha ~674)

```js
{
  id: "s1",                    // string única na sessão ("s" + SEQ)
  tipo: "<id de LIB>",         // ex.: "capa","texto_foto","ficha","roteiro","atividade","galeria",
                               //      "cartoes","lista","colunas","numeros","hospedagem",
                               //      "transfer","contato","encerramento","livre"
  titulo: "<string>",          // título editável da seção
  semfoto: false,              // bool — "este slide não terá foto"
  vals: { <campoKey>: "<string>" },       // valores dos campos de texto (chave = LIB[tipo].campos[].k)
  fotos: { <imgKey>: <FotoRec> },         // fotos anexadas (chave = campo t:"img")
  pos: { <imgKey>: "<id de POS>" },       // posição escolhida p/ cada foto ("auto","fundo","topo",...)
  rows: { <repKey>: [ <Row>, ... ] }      // linhas de seções repetíveis (só quando LIB[tipo].rep existe)
  // notas_imagens: "<string>"            // (Modo Reunião) briefs de imagem — ver §7. Chave extra, opcional.
}
```

### 2.3 Objeto `Row` (repetições — `newRow`, linha ~673)

```js
{
  vals:  { <campoKey>: "<string>" },   // chave = LIB[tipo].rep.campos[].k
  fotos: { <imgKey>: <FotoRec> },
  pos:   { <imgKey>: "<id de POS>" }
}
```

### 2.4 Objeto `FotoRec`

```js
{ name: "arquivo.jpg", data: "data:image/jpeg;base64,...." }
// variante "faltando" (autosave que não coube): { name: "...", missing: true }
```

### 2.5 Consumidor — `applyDraft(d)` (linha ~1247) — comportamento tolerante

- `nome` ← `d.nome || ""`.
- `tipo` ← `TIPO_LEGADO[d.tipo] || d.tipo`; se não existir em `TYPES`, cai para `"livre"`.
  (`TIPO_LEGADO = {expedicao:"exp_interna"}` — compat com rascunhos antigos.)
- `formato` ← `d.formato` se existir em `FORMATOS`, senão o formato padrão do tipo.
- `seq` ← `d.seq || 1000`; `TITLED = true`.
- `secs` ← `(d.secs||[]).filter(s => LIB[s.tipo])` — **seções com `tipo` desconhecido são descartadas
  em silêncio**. Cada seção é normalizada: `semfoto` vira bool; `pos/fotos/vals/rows` viram `{}` se ausentes.
  **Chaves extras da seção são preservadas** (o `.map` retorna o próprio objeto `s`) — ex.: `notas_imagens`.
- `rows` são **reconstruídas** como `{vals, fotos, pos}` — **chaves extras dentro de uma `Row` são perdidas**.
  (Por isso os briefs de imagem do Modo Reunião ficam no **nível da seção**, não da linha — ver §7.)
- `view` ← só aplica se for `"tudo"`, `"guiada"` (ou `"reuniao"`, após o Modo Reunião). `cur` é "clampado".

**Conclusões p/ quem gera rascunho (prompt de extração / Modo Reunião):**
1. `app` **precisa** ser exatamente `"estudio-briefing-desbravando"` — senão o carregamento por arquivo rejeita.
2. Só `tipo` válido em `LIB` sobrevive; texto vai em `vals`/`rows[].vals` com as chaves de `LIB`.
3. Não precisa mandar `fotos`/`pos` (defaultam para `{}`). Fotos são anexadas depois, no Estúdio completo.
4. Campos extras a nível de **seção** sobrevivem; a nível de **linha**, não.

---

## 3. `LIB` — biblioteca de blocos (schema das seções)

Cada bloco: `{ nome, desc, layout, campos:[...], rep?:{k, rotulo, campos:[...]} }`.

- **`campos[]`** — campos fixos da seção. Cada campo: `{ k, t, l, ph?, h?, req?, nopos? }`
  - `k` — chave (usada em `vals`/`fotos`/`pos`).
  - `t` — tipo: `"text"` (input), `"area"` (textarea), `"img"` (upload de foto).
  - `l` — label; `ph` — placeholder; `h` — dica (só img); `req:1` — obrigatório; `nopos:1` — sem seletor de posição.
- **`rep`** — quando a seção tem itens repetíveis (ficha, roteiro, galeria, cartões, números).
  `rep.k` é a chave em `rows`; `rep.rotulo` é o nome do item; `rep.campos` segue o mesmo formato de `campos`.

15 blocos: `capa, texto_foto, ficha, roteiro, atividade, galeria, cartoes, lista, colunas, numeros,
hospedagem, transfer, contato, encerramento, livre`.

> **Os "textos-padrão" (o `PADRAO` citado no doc de estratégia) NÃO existem como constante.**
> Eles estão embutidos como **placeholders `ph:`** nos campos de `LIB`, como **títulos** nos presets de
> `TYPES`, e no **`SPEC_MD`**. Ao trocar a identidade, é nesses três lugares que o tom de voz muda.
> (Marcado com `// TODO(identidade)` nos pontos tocados pelo Modo Reunião.)

---

## 4. `TYPES` — presets de tipo de arte

`TYPES[id] = { nome, desc, formato, preset:[ {tipo, titulo, vals?}, ... ] }`.
`loadPreset(id)` zera o estado e cria uma `Secao` por item do `preset` (via `newSec`).
Ids: `exp_interna, exp_externa, marca, flyer, card, livre`. `TIPO_LEGADO` mapeia `expedicao → exp_interna`.

---

## 5. Autosave (`localStorage`)

- Chave: **`LSKEY = "estudio-briefing-desbravando-v4"`** (linha ~670). **Não mudar** (retrocompat).
- `scheduleAutosave()` (debounce 600ms) → `autosave()` grava `JSON.stringify(draftData())`.
- Se estourar a cota (`QuotaExceededError`), `stripPhotos()` remove os `data:` das fotos, marca
  `fotos_removidas:true` e regrava só o texto; avisa o usuário uma vez.
- `tryRestore()` (no boot) lê o `LSKEY`, valida `app` e chama `applyDraft`; oferece "começar do zero".
- `beforeunload` avisa se há conteúdo e o autosave falhou (fotos grandes).

---

## 6. `generatePackage(nome, filled)` — montagem do `.zip` (linha ~1390)

Usa **JSZip** (embutido). Só entram seções com conteúdo (`filled = SECS.filter(contentOf)`).
Estrutura do pacote (contrato de saída — **não alterar**, retrocompat):

```
briefing.json           # conteúdo estruturado (ver abaixo)
RESUMO.txt              # resumo legível
IMAGENS/                # fotos anexadas, nomeadas NN_<campo>.<ext> / NN_<rep>NN_<campo>.<ext>
MARCA/
  logo-desbravando.png  # de LOGO_B64
  logo-canam.png        # de CANAM_B64
  Anton-Regular.ttf     # de ANTON_B64
  Archivo.ttf           # de ARCHIVO_B64
  IDENTIDADE_VISUAL.md  # de SPEC_MD
LEIA-PRIMEIRO_IA.md     # instruções de montagem p/ a IA/equipe
```

`briefing.json`: `{ plataforma, versao:4, nome, tipo:{id,nome}, formato:{id,nome,dimensoes},
gerado_em, secoes:[...], marca:{...} }`. Cada seção: `{ ordem, bloco, bloco_nome, titulo, layout,
respostas:{k:{rotulo,valor}}, imagens:{k:arquivo}, imagens_posicao?, sem_foto?, repeticoes?:{repKey:[...]} }`.

> `generatePackage` só serializa campos declarados em `LIB[tipo].campos`/`rep.campos`. Chaves extras
> da seção (ex.: `notas_imagens`) **não** entram no pacote — os briefs de imagem são um auxílio interno
> de produção (guiam o operador na caça das fotos), não saem para a arte final.

Se `DRIVE_ENDPOINT` estiver preenchido, o `.zip` também sobe pro Mini Drive (`enviarAoMiniDrive`),
com o download local como rede de segurança (*fail-open*). No repositório as chaves ficam vazias.

---

## 7. Integração do Modo Reunião com este contrato (§5.3)

- O Modo Reunião é uma **terceira `view`** (`"reuniao"`), ao lado de `"guiada"` e `"tudo"`.
- Reaproveita `LIB`, `newSec`, `fieldHTML` (campos de texto), os handlers de `input`/`click` e o
  `downloadDraft()` existente — a **saída é o mesmo rascunho JSON** deste documento.
- **Não faz upload de foto.** Em vez disso captura **briefs de imagem** por seção em
  `sec.notas_imagens` (string). Fica no nível de seção justamente porque `applyDraft` preserva
  chaves extras da seção (§2.5) — sobrevive ao round-trip.
- Round-trip: exportar no Modo Reunião → abrir no Estúdio completo → `applyDraft` aceita sem erro;
  o carregamento por arquivo força sair de `"reuniao"` para o Estúdio completo (onde há upload de foto).
