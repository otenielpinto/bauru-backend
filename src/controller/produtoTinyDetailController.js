import { mpkIntegracaoController } from "../controller/mpkIntegracaoController.js";
import { systemService } from "../services/systemService.js";
import { ProdutoTinyRepository } from "../repository/produtoTinyRepository.js";
import { ProdutoTinyDetailRepository } from "../repository/produtoTinyDetailRepository.js";
import { Tiny, TinyInfo } from "../services/tinyService.js";
import { CategoriaRepository } from "../repository/categoriaRepository.js";
import { MarcaRepository } from "../repository/marcaRepository.js";
import { GradeRepository } from "../repository/gradeRepository.js";
import { lib } from "../utils/lib.js";

async function init() {
  try {
    await processarProdutoTinyDetail();
  } catch (error) {}
}

async function processarProdutoTinyDetail() {
  let tenants = await mpkIntegracaoController.findAll({});

  for (const tenant of tenants) {
    let key = "ProdutoTinyDetailController " + tenant.id_tenant;
    if ((await systemService.started(tenant.id_tenant, key)) == 1) {
      continue;
    }

    let categorias = [];
    let grades = [];
    let marcas = [];

    let marcaRepository = new MarcaRepository();
    let gradeRepository = new GradeRepository();
    let categoriaRepository = new CategoriaRepository();
    await marcaRepository.init();
    await gradeRepository.init();
    await categoriaRepository.init();

    let produtoTinyRepository = new ProdutoTinyRepository(tenant.id_tenant);
    await produtoTinyRepository.init();
    let items = await produtoTinyRepository.findAll({});
    for (let item of items) {
      let produto = await produtoObter(tenant, item?.id);
      await updateProdutoTinyDetail(tenant, produto);
      if (!produto || !produto.id) {
        console.error("Produto inválido:", produto);
        continue;
      }
      let hasDiff =
        item?.categoria !== produto?.categoria ||
        item?.marca !== produto?.marca ||
        item?.grade !== produto?.grade?.Embalagem;

      let grade = produto?.grade?.Embalagem || null;
      let categoriaOriginal = produto?.categoria || null;
      let categoria = lib.removerAcentos(produto?.categoria || null);
      let marca = produto?.marca || null;

      let categoria1 = "";
      let categoria2 = "";
      let categoria3 = "";
      let categoria4 = "";

      if (grade && !grades.includes(grade)) {
        grades.push(grade);
        await gradeRepository.update(grade, {
          id: grade,
          nome: grade,
          id_tenant: tenant.id_tenant,
        });
      }
      if (categoriaOriginal) {
        let partesCategoria = categoria.split(" >> ");
        let nivel = 0;
        for (let parte of partesCategoria) {
          if (!categorias.includes(categoriaOriginal)) {
            await categoriaRepository.update(parte.trim(), {
              id: parte.trim(),
              nome: parte.trim(),
              nivel: nivel,
              id_tenant: tenant.id_tenant,
            });
          }

          if (nivel === 0) {
            categoria1 = parte.trim();
          } else if (nivel === 1) {
            categoria2 = parte.trim();
          } else if (nivel === 2) {
            categoria3 = parte.trim();
          } else if (nivel === 3) {
            categoria4 = parte.trim();
          }

          nivel++;
        }
        categorias.push(categoriaOriginal);
        nivel = 0;
      }

      if (marca && !marcas.includes(marca)) {
        marcas.push(marca);
        await marcaRepository.update(marca, {
          id: marca,
          nome: marca,
          id_tenant: tenant.id_tenant,
        });
      }
      if (hasDiff) {
        await produtoTinyRepository.update(produto.id, {
          categoria: categoriaOriginal,
          marca: marca,
          grade: grade,
          categoria1: categoria1,
          categoria2: categoria2,
          categoria3: categoria3,
          categoria4: categoria4,
          id_tenant: tenant.id_tenant,
        });
      }
    }
  }
}

async function produtoObter(tenant, id) {
  const data = [{ key: "id", value: id }];
  let response = null;
  const tiny = new Tiny({ token: tenant.token });
  tiny.setTimeout(1000 * 10);

  for (let t = 1; t < 5; t++) {
    response = await tiny.post("produto.obter.php", data);
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

async function updateProdutoTinyDetail(tenant, produto) {
  if (!produto || !produto.id || !tenant || !tenant.id_tenant) {
    console.error("Produto ou tenant inválido:", produto, tenant);
    return;
  }
  let produtoTinyDetailRepository = new ProdutoTinyDetailRepository(
    tenant.id_tenant
  );
  await produtoTinyDetailRepository.init();
  let payload = {
    ...produto,
    id_tenant: tenant.id_tenant,
  };
  await produtoTinyDetailRepository.update(produto.id, payload);
}

const ProdutoTinyDetailController = {
  init,
};

export { ProdutoTinyDetailController };
