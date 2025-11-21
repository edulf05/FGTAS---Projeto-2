const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

router.get("/usuario", usuarioController.listar);
router.get("/usuario/:id", usuarioController.buscarPorId);
router.post('/usuario/login', usuarioController.login);
router.post("/usuario", usuarioController.inserir);
router.put("/usuario/:id", usuarioController.atualizar);
router.delete("/usuario/:id", usuarioController.excluir);

module.exports = router;
