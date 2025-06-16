import { ProdutoEstruturaController } from "./produtoEstruturaController.js";
import { ProdutoEstruturaFilaRepository } from "../repository/produtoEstruturaFilaRepository.js";
import { mpkIntegracaoController } from "./mpkIntegracaoController.js";

async function init() {
  await processarFila();
}

async function processarFila() {
  let tenants = await mpkIntegracaoController.findAll({});
  if (!tenants || tenants.length === 0) {
    console.log("Nenhum tenant encontrado para importar estrutura de produto.");
    return;
  }

  for (const tenant of tenants) {
    let produtoEstruturaFilaRepository = new ProdutoEstruturaFilaRepository();
    await produtoEstruturaFilaRepository.init();
    let rows = await produtoEstruturaFilaRepository.findAll({});
    for (let row of rows) {
      await ProdutoEstruturaController.produtoAtualizarEstrutura(
        tenant,
        row?.id
      );
      let result = await produtoEstruturaFilaRepository.delete(row?.id);
      if (result) {
        console.log("[ OK ] Excluindo da fila " + row.id);
      }
    }
  }
}

const ProdutoEstruturaFilaController = {
  init,
};

export { ProdutoEstruturaFilaController };
