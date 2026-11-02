/**
 * Onde ficam os DADOS do cliente que alimentam as artes.
 *
 * Desde 01/11/2026 eles moram FORA deste repositório: acordo, fechamentos, faturamento,
 * proposta, equipe (nome e cargo), parcerias (telefone) e a tabela de cobrança
 * CONTROLE-DE-ARTES.md são dado comercial e pessoal do cliente, e não entram no git.
 *
 * Ordem de procura:
 *   1. variável de ambiente DESBRAVANDO_DADOS (a pasta que contém `dados/` e o CONTROLE);
 *   2. C:\Users\<você>\Arquivo-projetos\desbravando-dados
 *
 * Estrutura esperada:
 *   <DESBRAVANDO_DADOS>/dados/*.json
 *   <DESBRAVANDO_DADOS>/CONTROLE-DE-ARTES.md
 */
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

export const RAIZ_DADOS = process.env.DESBRAVANDO_DADOS
  ? resolve(process.env.DESBRAVANDO_DADOS)
  : join(homedir(), "Arquivo-projetos", "desbravando-dados");

export const DIR_DADOS = join(RAIZ_DADOS, "dados");
export const CONTROLE_DE_ARTES = join(RAIZ_DADOS, "CONTROLE-DE-ARTES.md");

/** Caminho de um arquivo de dados, com erro claro se a pasta não estiver lá. */
export function arquivoDeDados(nome) {
  if (!existsSync(DIR_DADOS)) {
    throw new Error(
      `pasta de dados não encontrada: ${DIR_DADOS}\n` +
      "Os dados do cliente ficam fora do repositório. Aponte DESBRAVANDO_DADOS para a pasta " +
      "que contém dados/ e CONTROLE-DE-ARTES.md (ver artes/README.md)."
    );
  }
  return join(DIR_DADOS, nome);
}
