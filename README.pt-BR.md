# Estúdio de Briefing · Desbravando UTV

Português · [English](README.md)

Duas ferramentas da Desbravando UTV, operadora de expedições off-road de UTV, num repositório:

1. **Estúdio de Briefing** (`index.html`): um arquivo HTML único que funciona offline. Um
   formulário guiado transforma o briefing de uma expedição num `.zip` estruturado (fotos,
   `expedicao.json`, kit da marca, instruções) montado no próprio navegador.
2. **Fábrica de artes** (`artes/`): scripts Node e Python que geram peças de gráfica e de
   rede social (crachá, adesivo, bandeira, cardápio, dossiê da expedição, programação) a partir
   de modelos HTML/CSS, em PDF e PNG, com conferência automática de cada PDF.

## Status

Ativo. O Estúdio está em produção no Cloudflare Pages (`estudio-briefing.pages.dev`). A
fábrica de artes roda na máquina.

O `main` é igual à produção: o assistente do modo reunião (`feat/modo-reuniao`) entrou por
merge em 01/11/2026. A única diferença são as duas chaves do Mini Drive, vazias aqui.

## O problema que resolve

O briefing de cada expedição chegava solto por mensagem e e-mail, e cada arte pedia várias
rodadas de pergunta. O Estúdio coleta o briefing uma vez, numa estrutura fixa. A fábrica de
artes transforma dado estruturado em arquivo final com as fontes e os logos reais da marca, e
reprova o PDF cujo número não bate com o dado.

## Stack

- Estúdio: HTML, CSS e JavaScript num arquivo, JSZip, sem build e sem backend
- Fábrica de artes: Node.js (ES modules), Chrome headless (PDF), PyMuPDF (PNG e conferência do PDF)

## Rodar localmente

- Estúdio: abra o `index.html` no navegador. Não precisa de servidor.
- Fábrica de artes: `npm run artes -- <peça>` (por exemplo `npm run artes -- bandeira`). Ela
  lê os dados do cliente de uma pasta fora do repositório; ver
  [artes/README.md](artes/README.md), seção "Onde ficam os dados".

## Testes

```bash
npm test
```

Confere que o JavaScript do Estúdio compila, que as chaves do Mini Drive estão vazias no
repositório, que nenhum dado do cliente está versionado e que a resolução da pasta de dados
funciona. Cada PDF comercial da fábrica também é auditado pelo próprio script quando é gerado.

## Estrutura de pastas

| Caminho | O que é |
|---|---|
| `index.html` | O Estúdio de Briefing |
| `docs/app/` | Mapa técnico do Estúdio, plano de expansão, notas da revisão de julho |
| `artes/` | Fábrica de artes: `templates/`, `ferramentas/`, marca, fotos com crédito |
| `artes/saida/` | Arquivos gerados (fora do git) |
| `tests/` | Testes automáticos |
| `docs/arquitetura/` | Diagramas |

## Arquitetura

Diagramas em [docs/arquitetura/](docs/arquitetura/). Funcionamento interno do Estúdio em
[docs/app/MAPA_TECNICO.md](docs/app/MAPA_TECNICO.md).

## Decisões e limites conhecidos

- Os dados do cliente (acordo, fechamentos, proposta, nomes da equipe, telefones de parceiros)
  e a tabela de cobrança ficam fora do repositório desde 01/11/2026. O pipeline os acha pela
  variável `DESBRAVANDO_DADOS`.
- O Estúdio de produção é upload direto no Cloudflare Pages, sem ligação com o GitHub. Merge
  não publica.
- Dois produtos dividem este repositório. Separar em dois está proposto, não feito.

## Limpeza do histórico (2026-11)

O histórico foi reescrito em 01/11/2026, antes de o repositório ser aberto. Os dados do
cliente (`artes/dados/`, `artes/CONTROLE-DE-ARTES.md`), as listas de valores internos dos
auditores, as fotos de expedição e os preços por arte saíram de todos os commits. Eles
ficam numa pasta de dados fora do repositório, lida pela variável `DESBRAVANDO_DADOS`.

## Licença

Todos os direitos reservados. Publicado como portfólio; não licenciado para reuso. Veja o arquivo [LICENSE](LICENSE).
