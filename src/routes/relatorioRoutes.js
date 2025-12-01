const express = require('express');
const router = express.Router();
const relatorioCtrl = require('../controllers/relatorioController');

router.get('/relatorios', relatorioCtrl.listar);

module.exports = router;