# Estúdio de Briefing · Desbravando UTV

![status](https://img.shields.io/badge/status-em%20produção-6FCF97)
![tipo](https://img.shields.io/badge/app-HTML%20único%20offline-E34F26)
![backend](https://img.shields.io/badge/backend-nenhum-lightgrey)
![deps](https://img.shields.io/badge/dependências-JSZip-blue)

**Projeto real, em produção — não é demo nem exercício de portfólio.** É usado no dia a dia da **Desbravando UTV**, uma operação de expedições de UTV com atuação nacional que movimenta milhões de reais.

> Ferramenta de briefing usada no atendimento ao cliente: um **único arquivo HTML, client-side e offline**, que transforma um formulário guiado num **pacote estruturado** (`.zip`) pronto pra virar um deck de 14 slides. Sem servidor, sem login, sem build — abre e usa.

---

## 1. Visão Geral e a Dor

Fechar uma expedição exige combinar um monte de coisa com o cliente: destino, datas, o que entra no pacote, fotos de referência, tom da arte. Isso costumava ir solto por WhatsApp e e-mail, e quem ia montar a arte final recebia um amontoado sem padrão — faltando foto, faltando medida, faltando contexto.

**O que está sendo resolvido?**
Padronizar a coleta do briefing num formulário sob medida e cuspir, no fim, um **pacote organizado e previsível** — as imagens separadas, os textos estruturados em JSON, o kit de marca junto e as instruções de montagem — em vez de um monte de anexo solto.

**Por que um HTML único offline?**
Porque roda em qualquer máquina, sem instalar nada e sem internet, e o pacote é montado no próprio navegador. Zero infra pra manter, zero custo, e nada do cliente sai da máquina de quem preenche até a hora de exportar.

---

## 2. Arquitetura e Decisões Técnicas

```
Schema (14 seções)  ──►  Formulário renderizado  ──►  JSZip (no navegador)  ──►  pacote.zip
  definido em JS         textos + fotos arrastadas       monta tudo client-side     IMAGENS/ · expedicao.json
                                                                                    MARCA/ · instruções
```

| Camada | Escolha | Por que escolhi isso? | Alternativa considerada | Nota de impacto |
|---|---|---|---|---|
| **Formato** | Arquivo HTML único, self-contained | Roda offline em qualquer lugar, sem instalar; marca (logos/fontes) embutida como data URI | App com build (Vite) | Portabilidade total, zero setup |
| **Render** | Formulário dirigido por schema | As 14 seções são dados, não markup — o motor lê o conteúdo de forma genérica, o que facilita generalizar depois | Formulário hard-coded | Flexível e fácil de evoluir |
| **Empacotamento** | JSZip no cliente | Monta o `.zip` no navegador; nada sobe pra servidor nenhum na coleta | Backend que zipa | Sem infra, sem custo, privado |
| **Saída** | `expedicao.json` + `IMAGENS/` + `MARCA/` + instruções | Handoff estruturado e legível por máquina, pronto pra IA montar o PDF de 14 slides | PDF direto no cliente | Separa conteúdo de diagramação |
| **Acesso** | Sem login (uso interno 1:1) | Ferramenta de atendimento, não produto multiusuário | Auth/contas | Atrito zero |

O pacote gerado conecta com o [Mini Drive](https://github.com/pethrus07/minidrive-desbravando-utv): quando configurado, o `.zip` sobe pro acervo e o download local continua como rede de segurança (*fail-open*).

---

## 3. Destaque de Engenharia / "The Hard Part"

**Gerar um entregável estruturado inteiro no navegador, sem backend.** O fim do fluxo não é "enviar um formulário" — é montar, client-side, um `.zip` que separa responsabilidades:

- `IMAGENS/` — as fotos arrastadas, já organizadas;
- `expedicao.json` — todo o conteúdo do briefing em formato estruturado (o que a etapa de diagramação realmente consome);
- `MARCA/` — logos, fontes e o guia de identidade visual embutidos, pra arte final sair fiel à marca;
- instruções de montagem dos 14 slides.

O truque é o **motor ser genérico**: o formulário é renderizado a partir de um schema de seções, então o que muda entre um briefing e outro é dado, não código. Separar *conteúdo* (JSON) de *diagramação* (o PDF montado depois) é o que deixa o mesmo motor atender novos tipos de arte sem reescrever a ferramenta.

---

## 4. Como usar

Abra o `index.html` no navegador — não precisa de servidor nem internet. Preencha as seções, arraste as fotos e clique em exportar; o `.zip` é baixado na hora.

> App em produção, personalizado para uma operação real. As chaves de integração com o acervo (`DRIVE_ENDPOINT`/`DRIVE_KEY`) ficam **vazias** neste repositório — são preenchidas só no arquivo em uso, nunca versionadas.

---

## 5. Roadmap

O plano de evolução — sair de "um deck de expedição" para uma ferramenta que
atende vários tipos de arte, online e com slides reordenáveis, mantendo o custo
próximo de zero — está documentado em **[PLANO_EXPANSAO.md](PLANO_EXPANSAO.md)**:
diagnóstico do que existe hoje, decisões fechadas, arquitetura escolhida
(Cloudflare Pages + R2) e custo de operação.
