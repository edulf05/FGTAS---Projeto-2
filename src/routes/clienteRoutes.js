const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

router.get("/", clienteController.listar);
router.get("/:id", clienteController.buscarPorId);
router.post("/", clienteController.inserir);

module.exports = router;
