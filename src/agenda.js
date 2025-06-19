import { TMongo } from "./infra/mongoClient.js";
import { lib } from "./utils/lib.js";
import { ProdutoTinyController } from "./controller/produtoTinyController.js";
import { ProdutoEstruturaController } from "./controller/produtoEstruturaController.js";
import { ProdutoEstruturaFilaController } from "./controller/produtoEstruturaFilaController.js";
import { ProdutoEstruturaPrecoController } from "./controller/produtoEstruturaPrecoController.js";
import { ProdutoTinyDetailController } from "./controller/produtoTinyDetailController.js";
import { EmpresaController } from "./controller/empresaController.js";
import nodeSchedule from "node-schedule";

global.processandoNow = 0;

async function task() {
  global.processandoNow = 1;
  //colocar aqui controller;
  await TMongo.close();
  await EmpresaController.init();
  await ProdutoTinyController.init();
  await ProdutoEstruturaController.init();
  await ProdutoEstruturaFilaController.init();
  await ProdutoEstruturaPrecoController.init();
  await ProdutoTinyDetailController.init();

  global.processandoNow = 0;
  console.log(" Job finished - task " + lib.currentDateTimeStr());
  console.log("*".repeat(60));
}

async function init() {
  //Espaço reserva para testes ;
  global.config_debug = 0; // 1 - debug | 0 - producao

  //atualizar a cada 60 minutos todos os produtos do tiny das 08:00 as 18:00

  //  await EmpresaController.init();
  //  await ProdutoTinyController.init();
  //  await ProdutoEstruturaController.init();
  //  await ProdutoEstruturaFilaController.init();
  //  await ProdutoEstruturaPrecoController.init();
  //  await ProdutoTinyDetailController.init();
  //  console.log("Tarefa concluida - agenda " + lib.currentDateTimeStr());

  //  return;

  try {
    let time = process.env.CRON_JOB_TIME || 10; //tempo em minutos
    const job = nodeSchedule.scheduleJob(`*/${time} * * * *`, async () => {
      console.log(" Job start as " + lib.currentDateTimeStr());

      if (global.processandoNow == 1) {
        console.log(
          " Job can't started [processing] " + lib.currentDateTimeStr()
        );
        return;
      }

      try {
        await task();
      } finally {
        global.processandoNow = 0;
      }
    });
  } catch (error) {
    throw new Error(`Can't start agenda! Err: ${error.message}`);
  }
}

export const agenda = { init };
