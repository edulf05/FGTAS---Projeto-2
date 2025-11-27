const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const adminAuth = require("../middleware/adminAuth");

router.get("/usuario", usuarioController.listar);
router.get("/usuario/:id", usuarioController.buscarPorId);

// criação/edição/exclusão protegidas por adminAuth (envie header x-admin-id)
router.post("/usuario", adminAuth, usuarioController.inserir);
router.put("/usuario/:id", adminAuth, usuarioController.atualizar);
router.delete("/usuario/:id", adminAuth, usuarioController.excluir);

// rota pública de login
router.post('/usuario/login', usuarioController.login);

module.exports = router;