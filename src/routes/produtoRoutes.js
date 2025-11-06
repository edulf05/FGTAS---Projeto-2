const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");

router.get("/", produtoController.listar);
router.get("/:id", produtoController.buscarPorId);
router.post("/", produtoController.inserir);
router.put("/:id", produtoController.atualizar);
router.patch("/:id", produtoController.atualizarParcial);
router.delete("/:id", produtoController.excluir);

module.exports = router;
