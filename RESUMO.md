# RESUMO — Evolução do Estúdio de Briefing (execução autônoma)

Execução das seções **§5.1, §5.2 e §5.3** do documento de estratégia, de forma autônoma.
**§5.4 (v2 integrada) NÃO foi feita** (depende do prompt de extração, que ainda não existe) e a
**identidade visual NÃO foi criada** (é feita em outro lugar). Data: 14/07/2026.

---

## Branch e como revisar

- **Branch:** `feat/modo-reuniao` (criada a partir de `main`; nada commitado na `main`).
- **Commits (incrementais):**
  1. `docs: mapa tecnico (§5.2) …` → `MAPA_TECNICO.md`
  2. `feat(modo-reuniao): view leve de anotação ao vivo (§5.3)` → só `index.html`
  3. `docs: RESUMO da execução autônoma` → este arquivo
- **Revisar o código:** `git diff main..feat/modo-reuniao -- index.html` (106 inserções, 5 deleções —
  aditivo; as 5 deleções são linhas que foram *estendidas*, não removidas).
- **Testar na mão (2 min):**
  1. Abra `index.html`, clique em **“Modo reunião”** (novo 3º botão ao lado de Passo a passo / Ver tudo).
  2. Preencha alguns campos e um bloco **“Briefs de imagem”**. Note: **não há upload de foto** aqui.
  3. Clique **“Salvar rascunho da reunião”** → baixa um `RASCUNHO_*.json`.
  4. Recarregue a página (ou outra máquina), clique **“Abrir rascunho”**, escolha esse JSON →
     abre no **Estúdio completo** (Ver tudo), com os briefs visíveis e os campos de foto de volta.
- **Evidência visual:** `../estudio-briefing-handoff/_revisao/` (3 screenshots: modo reunião, caixa de
  briefs, estúdio guiado).

> **Nota sobre pastas fora do repo:** este repositório é **público** (GitHub `pethrus07/estudio-briefing`).
> Todo material com artes/dados reais do cliente ficou **fora** dele, em
> `~/Downloads/estudio-briefing-handoff/` (ver §5.1). Não versionei nada disso aqui.

---

## §5.1 — Levantamento para a identidade  ✅

Reunido em **`~/Downloads/estudio-briefing-handoff/`** (com um `LEIA-ME.md` explicando tudo):

- **`01_artes_aprovadas/`** — 6 artes representativas, formatos e tipos variados:
  A) deck expedição interna (Serra Catarinense, 16:9); B) deck expedição externa (Wild Coast, 16:9);
  C) proposta de patrocínio / marca (16:9); D) guia de expedição (doc); E) Copa feed (flyer 4:5);
  F) Copa stories (9:16). PDFs foram rasterizados para PNG; as artes de social já eram imagem.
- **`02_marca/`** — `logo-desbravando.png` e `logo-canam.png` **extraídos do base64** (`LOGO_B64`/`CANAM_B64`)
  do `index.html`; `IDENTIDADE_VISUAL_atual.md` (**a string `SPEC_MD` extraída**); logos entregues
  pelo cliente (branco/preto); `pasta-desbravando-PB` (capa P&B com o isótipo).
- **`03_copy_real/`** — `copy-real.md` com amostras de copy real (tom de voz) extraídas das artes em HTML.

## §5.2 — Mapa técnico  ✅

Documentado em **`MAPA_TECNICO.md`** (no repo). Cobre: layout do arquivo, **contrato exato do rascunho
JSON** (`draftData`/`applyDraft`, objetos `Secao`/`Row`/`FotoRec`), `LIB`, `TYPES`, autosave (`LSKEY`) e
`generatePackage` (estrutura do `.zip`). Inclui as conclusões que o prompt de extração (Fase 2) vai precisar.

## §5.3 — Plataforma: Modo Reunião  ✅

Construído por completo em `index.html`:
- **Modo Reunião** = 3ª view (`"reuniao"`), leve, orientada a anotação, alinhada ao schema `LIB`
  (reaproveita `fieldHTML` e os handlers existentes).
- Captura **texto + “briefs de imagem”** (descrições do que caçar), **sem upload de foto**.
- **Saída = rascunho JSON no mesmo formato** que o `applyDraft` já carrega (via `downloadDraft` existente).
- **Round-trip validado** (ver Validação): exporta do modo reunião → carrega no Estúdio completo sem erro.
- **Fluxo de fotos:** no modo reunião, sem upload; anexo de foto permanece só no Estúdio completo.

---

## Decisões que tomei (autônomas) e o porquê

1. **Onde os "briefs de imagem" moram:** em `sec.notas_imagens` (uma string por seção), **não** por foto
   nem por linha. Motivo técnico: o `applyDraft` **preserva chaves extras no nível da seção**, mas
   **reconstrói as `Row`** (descartaria chaves extras de linha) — ver `MAPA_TECNICO.md` §2.5. Nível de
   seção também combina com anotação ao vivo (um campo livre onde o PM lista o que caçar).
2. **Briefs também aparecem no Estúdio completo**, mas **só quando existem** (`sec.notas_imagens` não vazio).
   Assim o operador vê o que caçar na hora de anexar as fotos, e a UI do Estúdio completo fica
   **inalterada** para quem não usa o modo reunião (retrocompat de experiência).
3. **`applyDraft` passou a aceitar `view:"reuniao"`** para que um *refresh no meio da reunião* mantenha o
   modo (autosave/restauração). Já o **carregamento por arquivo** de um rascunho de reunião **força a ida
   para o Estúdio completo** (Ver tudo) — é exatamente o handoff descrito na §3 (revisar e caçar fotos lá).
4. **Não escondi o botão “Baixar pacote (.zip)”** no modo reunião (evita mexer na barra existente); em vez
   disso, o banner do modo reunião traz o CTA certo (**Salvar rascunho da reunião**) e um atalho
   **Abrir no Estúdio completo**.
5. **Fonte das artes = disco local, não o Mini Drive.** O `index.html` do repo tem `DRIVE_ENDPOINT`/`DRIVE_KEY`
   **vazios** (sem acesso ao Drive), e as artes aprovadas já estavam em `~/Downloads` (são as próprias
   entregas). Usei-as diretamente. Detalhe no `LEIA-ME.md` do handoff.
6. **Tom de voz e textos-padrão mantidos como estão.** Não inventei voz nova. Onde escrevi copy nova de UI
   que embute exemplos com sabor de expedição, marquei `// TODO(identidade)`.

## `PADRAO` — descoberta importante

O documento de estratégia cita "os textos em `PADRAO`". **Esse `PADRAO` não existe como constante no código.**
Os "textos-padrão" estão embutidos em **três lugares**: os **placeholders `ph:`** dos campos em `LIB`, os
**títulos** dos presets em `TYPES`, e o **`SPEC_MD`**. É nesses três lugares que o tom de voz deverá ser
trocado quando a identidade nova chegar (documentado em `MAPA_TECNICO.md` §3).

## Pontos marcados com `// TODO(identidade)`

Todos no `index.html`, dentro do bloco do Modo Reunião:
1. **`imgBriefsHTML()`** — o `placeholder` da caixa de briefs traz exemplos com sabor de expedição
   ("cânion do dia 2", "pasta Urubici"). Revisar redação com o tom novo.
2. **`renderMeeting()`** — texto do banner ("Modo reunião · anotação ao vivo" + instruções). É instrução
   operacional; alinhar a redação ao tom novo quando chegar.

> Além desses, o Modo Reunião **herda automaticamente** o tom de voz via os placeholders de `LIB` — ou seja,
> quando a identidade atualizar `LIB`/`SPEC_MD`, o modo reunião acompanha sem novo trabalho.

## Validação (como conferi)

Testes headless com **jsdom** (lógica) e **Chrome** (visual) — todos passaram:
- **Sintaxe/carga:** o script parseia sem erros; as funções novas existem.
- **Modo reunião:** renderiza; **0 `input[type=file]` e 0 drop zones** (sem upload); caixas de briefs presentes.
- **Round-trip:** exporta rascunho (`view:"reuniao"`, `notas_imagens` capturado) → serializa → carrega em
  uma instância **nova** do app sem erro → título e briefs **sobrevivem**; contagem de seções preservada.
- **Handoff:** rascunho de reunião aberto por arquivo cai no **Ver tudo**, com drop zones de foto de volta.
- **Retrocompat:** rascunho legado (`tipo:"expedicao"` → `exp_interna`) carrega; Estúdio completo **sem**
  caixa de briefs quando não há briefs; `view` desconhecida não quebra.
- **Intocado (confirmado no diff):** `generatePackage`, o formato do pacote `.zip`/`briefing.json`, e a
  chave `LSKEY="estudio-briefing-desbravando-v4"`.

---

## O que faltou / bloqueios / próximos passos

- **Card 1:1 puro** não entrou nas artes do §5.1 — não achei uma arte aprovada nesse formato no disco.
- **Manual de marca formal** (paleta/regras de logo) não encontrado no disco; o mais próximo é o
  `IDENTIDADE_VISUAL_atual.md` + a pasta P&B. Fica como item para a Fase 1 pedir ao cliente, se existir.
- **Sem acesso ao Mini Drive** por este repo (chaves vazias) — contornado usando as artes locais.
- **Decisão da §7 (quem monta a arte final: designer humano vs. IA)** continua **em aberto** — não é minha
  para tomar. Registrei uma recomendação (designer humano seguindo a identidade) no `LEIA-ME.md` do handoff.
- **§5.4 (v2 integrada)** propositalmente **não feita** — depende do prompt de extração validado (Fase 2).

## Próximo passo imediato (para o operador)
1. Levar a pasta `estudio-briefing-handoff/` (artes + logos + `IDENTIDADE_VISUAL_atual.md` + copy) ao chat
   de identidade e **responder a §7**.
2. Revisar o Modo Reunião nesta branch; se aprovar, seguir o merge normal.
