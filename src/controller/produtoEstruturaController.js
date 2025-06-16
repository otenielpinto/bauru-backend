import { systemService } from "../services/systemService.js";
import { mpkIntegracaoController } from "./mpkIntegracaoController.js";
import { ProdutoTinyRepository } from "../repository/produtoTinyRepository.js";
import { Tiny, TinyInfo } from "../services/tinyService.js";
import { lib } from "../utils/lib.js";

async function init() {
  await importarProdutoEstrutura();
}

async function importarProdutoEstrutura() {
  let tenants = await mpkIntegracaoController.findAll({});
  if (!tenants || tenants.length === 0) {
    console.log("Nenhum tenant encontrado para importar estrutura de produto.");
    return;
  }

  for (const tenant of tenants) {
    let key = "ImportarProdutoEstruturaDiario " + tenant.id_tenant;
    if ((await systemService.started(tenant.id_tenant, key)) == 1) {
      continue;
    }

    try {
      let produtoTinyRepository = new ProdutoTinyRepository(tenant.id_tenant);
      await produtoTinyRepository.init();
      let rows = await produtoTinyRepository.findAll({});
      for (let row of rows) {
        let response = null;
        try {
          response = await produtoObterEstrutura(tenant, row.id);
        } catch (error) {
          console.error(
            `Erro ao obter estrutura do produto ${row.id} para tenant ${tenant.codigo}:`,
            error
          );
        }

        //fazendo aqui atualizacao para ganhar performance , mas poderia refatorar
        row.sys_estrutura_produto = response ? response : [];
        row.sys_has_estrutura_produto = row.sys_estrutura_produto.length;
        await produtoTinyRepository.update(row.id, {
          sys_estrutura_produto: row.sys_estrutura_produto,
          sys_has_estrutura_produto: row.sys_has_estrutura_produto,
          id_tenant: row.id_tenant,
        });
      }
    } catch (error) {
      console.error(
        `Erro ao importar estrutura de produto para tenant ${tenant.codigo}:`,
        error
      );
    }
  }
}

async function produtoObterEstrutura(tenant, idProduto) {
  const data = [{ key: "id", value: idProduto }];

  let response = null;
  const tiny = new Tiny({ token: tenant.token });
  tiny.setTimeout(1000 * 10);

  for (let t = 1; t < 5; t++) {
    response = await tiny.post("produto.obter.estrutura.php", data);
    if (response?.data?.retorno?.codigo_erro == 20) {
      console.log("A consulta não retornou registros");
      response = null;
      break;
    }

    response = await tiny.tratarRetorno(response, "produto");
    if (tiny.status() == "OK") break;
    response = null;
  }
  return response;
}

async function produtoAtualizarEstrutura(tenant, idProduto) {
  let produtoTinyRepository = new ProdutoTinyRepository(tenant.id_tenant);
  await produtoTinyRepository.init();
  let rows = await produtoTinyRepository.findAll({ id: String(idProduto) });

  for (let row of rows) {
    let response = null;
    try {
      response = await produtoObterEstrutura(tenant, row.id);
    } catch (error) {
      console.error(
        `Erro ao obter estrutura do produto ${row.id} para tenant ${tenant.codigo}:`,
        error
      );
    }

    row.sys_estrutura_produto = response ? response : [];
    row.sys_has_estrutura_produto = row.sys_estrutura_produto.length;
    await produtoTinyRepository.update(row.id, {
      sys_estrutura_produto: row.sys_estrutura_produto,
      sys_has_estrutura_produto: row.sys_has_estrutura_produto,
      id_tenant: row.id_tenant,
    });
  }
}

const ProdutoEstruturaController = {
  init,
  produtoAtualizarEstrutura,
  produtoObterEstrutura,
};

export { ProdutoEstruturaController };
