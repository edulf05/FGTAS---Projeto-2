const express = require('express');
const router = express.Router();
const relatorioCtrl = require('../controllers/relatorioController');
const adminAuth = require('../middleware/adminAuth');

router.get('/relatorios', relatorioCtrl.listar);
router.get('/relatorios/:id/csv', relatorioCtrl.csvById);
router.put('/relatorios/:id',adminAuth, relatorioCtrl.atualizar);

module.exports = router;