import { EmpresaRepository } from "../repository/empresaRepository.js";
import { Tiny, TinyInfo } from "../services/tinyService.js";
import { mpkIntegracaoController } from "./mpkIntegracaoController.js";
import { systemService } from "../services/systemService.js";

async function init() {
  await empresaAtualizarDados();
}

async function empresaAtualizarDados() {
  let tenants = await mpkIntegracaoController.findAll({});
  for (let tenant of tenants) {
    let key = "AtualizarEmpresaDados " + tenant.id_tenant;
    if ((await systemService.started(tenant.id_tenant, key)) == 1) {
      continue; // Se já estiver em execução, pula para o próximo tenant
    }

    const tiny = new Tiny({ token: tenant.token });
    tiny.setTimeout(1000 * 10);

    let response = await tiny.post("info.php");
    response = await tiny.tratarRetorno(response, "conta");

    if (tiny.status() === "OK") {
      let empresaRepo = new EmpresaRepository();
      await empresaRepo.init();
      await empresaRepo.update(tenant.id_tenant, {
        ...response,
        id_tenant: tenant.id_tenant,
        updated_at: new Date().toISOString(),
        id: tenant.id_empresa || 1, // ID padrão para empresa
      });
    }
  }
}
const EmpresaController = {
  init,
};

export { EmpresaController };
