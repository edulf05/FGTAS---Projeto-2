const express = require("express");
const router = express.Router();
const cidadeController = require("../controllers/cidadeController");

router.get("/", cidadeController.listar);
router.get("/:id", cidadeController.buscarPorId);
router.get("/ultima/cadastrada", cidadeController.buscarUltima);

module.exports = router;
