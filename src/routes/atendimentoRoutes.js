const express = require("express");
const router = express.Router();
const atendimentoController = require("../controllers/atendimentoController");

router.get("/atendimento", atendimentoController.listar);
router.get("/atendimento/:id", atendimentoController.buscarPorId);
router.post("/atendimento", atendimentoController.inserir);
router.put("/atendimento/:id", atendimentoController.atualizar);
router.delete("/atendimento/:id", atendimentoController.excluir);

module.exports = router;