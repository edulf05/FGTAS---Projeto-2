const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");

// Rotas principais
router.get("/", pedidoController.listar);
router.get("/:id", pedidoController.buscarPorId);

// Buscar pedidos de um cliente específico
router.get("/cliente/:idCliente", pedidoController.buscarPorCliente);

// CRUD
router.post("/", pedidoController.inserir);
router.put("/:id", pedidoController.atualizar);
router.patch("/:id", pedidoController.atualizarParcial);
router.delete("/:id", pedidoController.excluir);

module.exports = router;
