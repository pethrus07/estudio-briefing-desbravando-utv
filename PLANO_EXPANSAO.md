# Plataforma de Briefing — Estudo e Plano de Expansão

*Documento de planejamento · 30/06/2026*

Planejamento da evolução da plataforma de briefing usada hoje no atendimento ao cliente (base atual: "Briefing de Expedição — Desbravando UTV"). Reúne o diagnóstico do que existe, o objetivo da expansão, as decisões fechadas, a arquitetura escolhida, o custo de operação e o plano de construção.

---

## 1. O que a plataforma é hoje

É um **arquivo HTML único, client-side, que roda offline**. Funciona como um formulário de briefing sob medida:

- Define 14 seções fixas (os slides) num schema interno; o formulário é renderizado a partir dele.
- O usuário preenche os textos e arrasta as fotos em cada bloco.
- No final, o JSZip monta um `.zip` no próprio navegador contendo: as fotos em `IMAGENS/`, um `expedicao.json` estruturado, a pasta `MARCA/` (logos, fontes e o guia de identidade visual) e instruções para a IA montar o PDF final de 14 slides.
- O download é local — nada é enviado para fora do navegador.

Ponto importante: o **motor já lê o conteúdo de forma genérica**. O que está "preso" hoje é apenas o conteúdo do schema (específico de uma expedição). Isso facilita a generalização.

---

## 2. Objetivo da expansão

Sair de "um deck de expedição" para uma **ferramenta que atende vários tipos de arte**, mais flexível e online, mantendo o caminho o mais **simples e barato** possível. Em resumo:

- Atender múltiplos tipos de arte, não só os slides atuais.
- Permitir adicionar, remover e reordenar slides.
- Continuar entregando o pacote em `.zip`.
- Ficar **online**, com você e o cliente acessando briefings e entregas num lugar só.

---

## 3. Decisões fechadas

- **Personalizado para um cliente só.** Sem multiusuário, **sem login** e **sem senha**. Os dois acessam tudo.
- **O e-mail não carrega o zip.** Anexos de fotos estouram o limite de e-mail (e o EmailJS free leva no máximo 500 kb). Em vez disso: o zip sobe para um armazenamento e o e-mail leva apenas o **link**.
- **Armazenamento = Cloudflare R2** (e não Supabase): 10 GB grátis, sem taxa de transferência, não expira e **não pausa**. O free do Supabase pausa após 7 dias sem uso — ruim para algo usado esporadicamente.
- **Hospedagem = Cloudflare Pages** (estático, grátis). Como R2 e Pages são da Cloudflare, é **uma conta só**.
- **Aviso por e-mail = EmailJS** (plano free: 200 e-mails/mês — sobra).
- Mantém o **download do zip** como rede de segurança.

---

## 4. Arquitetura e stack

Não há servidor ligado 24h. É uma **página estática + armazenamento serverless** — por isso o custo de operação é quase nulo.

| Camada | Ferramenta | Papel |
|---|---|---|
| Hospedagem da página | Cloudflare Pages | Serve o HTML com URL e HTTPS |
| Armazenamento | Cloudflare R2 | Guarda os zips enviados e as artes entregues |
| Aviso por e-mail | EmailJS | Dispara o link do pacote para você |
| Empacotamento | JSZip (já no projeto) | Monta o `.zip` no navegador |

**Contas necessárias: duas** — Cloudflare (hospeda + guarda) e EmailJS (avisa).

---

## 5. Custo de operação

**R$ 0/mês**, de forma realista e por anos, sendo um cliente só e de baixo volume.

- **Gargalo = armazenamento (10 GB grátis do R2).** A cada projeto pesando ~200–500 MB (fotos em alta + PDF entregue), os 10 GB seguram algo como **20 a 50 projetos**. Passando disso, é centavos por mês (US$ 0,015/GB) ou basta arquivar o que é antigo.
- **Domínio próprio é opcional** (~R$ 40/ano). Sem ele, o subdomínio grátis da Cloudflare funciona.

### Ressalvas honestas
- Planos free **não têm backup nem garantia (SLA)** — mantenha sempre a sua cópia das fotos originais e das artes entregues; não trate o bucket grátis como cópia única de algo insubstituível.
- Os números são de meados de 2026; **provedores mexem em planos free** de tempos em tempos. A stack está sólida agora e provavelmente por anos, mas não é garantia vitalícia.

> **Construir ≠ manter.** As contas free zeram o custo de *operar* (R$ 0/mês). O custo real do projeto é a *construção* (o desenvolvimento descrito abaixo).

---

## 6. Plano de construção

Estimativa: **~5 a 9 dias** de trabalho focado.

1. **Biblioteca de templates** — transformar o schema fixo em vários templates (um por tipo de arte), cada um com seus campos, ativos de marca e instrução de IA, com um seletor de template no topo.
2. **Schema editável em tempo de uso** — adicionar, remover e reordenar slides; seções repetíveis com quantidade configurável (generalizando o que o roteiro de 5 dias já faz hoje).
3. **Empacotamento em zip orientado pelo template ativo** — manter o `.zip`, agora montado conforme o template selecionado.
4. **Envio** — ao gerar, subir o zip para o R2 e disparar o e-mail com o link.
5. **Tela de entregas** — uma lista simples que os dois abrem (lê o bucket do R2): mostra os projetos e o status, e é onde você sobe a arte finalizada. É isso que cobre o "tudo num lugar / controle", sem precisar de painel complexo.
6. **Colocar no ar** — publicar no Cloudflare Pages, criar o bucket R2, ligar o EmailJS.
7. **Autosave** (localStorage) — para não perder um briefing preenchido pela metade.
8. **Travar escopo e entregar.**

---

## 7. Riscos e pontos de atenção

- **Conteúdo por template é trabalho à parte do código.** Cada novo tipo de arte precisa do seu guia de identidade visual e da sua instrução de IA — isso é trabalho de design/conteúdo, não de desenvolvimento.
- **Tamanho do pacote.** Zips com muitas fotos em alta podem pesar; o upload precisa ser robusto para arquivos grandes.
- **Posse das contas.** Definir quem é dono do Cloudflare/EmailJS (cliente ou você) — afeta quem administra e mantém.
- **Escopo fechado.** Esta evolução cobre o que está acima; novos tipos de arte ou mudanças futuras entram como uma nova rodada.

---

## Próximo passo

Evoluir o HTML atual já com a base multi-template e flexível (adicionar/remover slides) e com os ganchos de **upload (R2) + e-mail (EmailJS)** prontos para ligar. É o passo que vale em qualquer cenário e o ponto concreto para tirar o projeto do papel.
