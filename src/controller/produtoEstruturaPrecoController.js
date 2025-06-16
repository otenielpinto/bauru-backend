import { ProdutoTinyRepository } from "../repository/produtoTinyRepository.js";
import { lib } from "../utils/lib.js";
import { mpkIntegracaoController } from "./mpkIntegracaoController.js";

async function init() {
  await processarEstruturaPreco();
}

const ProdutoEstruturaPrecoController = {
  init,
};

async function processarEstruturaPreco() {
  let precos = new Map();

  let tenants = await mpkIntegracaoController.findAll({});
  for (const tenant of tenants) {
    precos.clear();

    let produtoTinyRepository = new ProdutoTinyRepository(tenant.id_tenant);
    await produtoTinyRepository.init();
    let items = await produtoTinyRepository.findAll({});
    for (let item of items) {
      precos.set(item.codigo, {
        preco: item.preco,
        preco_custo: item.preco_custo,
      });
    }
    items = [];

    let rows = await produtoTinyRepository.findAll({
      sys_has_estrutura_produto: { $gt: 0 },
    });

    for (let row of rows) {
      let estrutura = row?.sys_estrutura_produto || [];
      let sys_total_preco_custo = 0;
      let sys_has_materia_prima_sem_custo = 0;
      for (let e of estrutura) {
        let codigo = e?.item?.codigo || "";
        if (!codigo || codigo === "") {
          console.log("Codigo do produto nao encontrado na estrutura:", e);
          continue;
        }
        let preco = precos.get(codigo);

        if (!preco) {
          console.log("Produto sem preco encontrado na estrutura:", codigo);
          continue;
        }

        let preco_custo = parseFloat(preco?.preco_custo);
        let quantidade = parseFloat(e?.item?.quantidade || 0);
        let totalCusto = lib.round(quantidade * preco_custo);
        if (
          isNaN(preco_custo) ||
          isNaN(totalCusto) ||
          isNaN(quantidade) ||
          quantidade <= 0 ||
          preco_custo <= 0
        ) {
          totalCusto = 0;
          sys_has_materia_prima_sem_custo = 1;
          sys_total_preco_custo = 0;
          break;
        }
        sys_total_preco_custo += totalCusto;
      }

      let hasDiff =
        row.sys_total_preco_custo !== sys_total_preco_custo ||
        row.sys_has_materia_prima_sem_custo !== sys_has_materia_prima_sem_custo;

      if (hasDiff) {
        await produtoTinyRepository.update(row.id, {
          sys_total_preco_custo: sys_total_preco_custo,
          sys_has_materia_prima_sem_custo: sys_has_materia_prima_sem_custo,
        });
        console.log(
          `Atualizado produto ${row.codigo} com custo total: ${sys_total_preco_custo}`
        );
      }
    }
  }
}

export { ProdutoEstruturaPrecoController };
