const Atendimento = require("../models/atendimentoModel");
const Usuario = require("../models/usuarioModel");


module.exports = {
  async listar(req, res, next) {
    try {
      const rows = await Atendimento.listar();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = req.params.id;
      const row = await Atendimento.buscarPorId(id);
      if (!row) return res.status(404).json({ message: "Atendimento não encontrado." });
      res.json(row);
    } catch (err) {
      next(err);
    }
  },

  async inserir(req, res, next) {
    try {
      const body = req.body;

      if (!body.forma_atendimento || !body.perfil || !body.tipo_atendimento) {
        return res.status(400).json({ message: "Campos obrigatórios: forma_atendimento, perfil, tipo_atendimento." });
      }

      // atendente_matricula é obrigatório (coluna NOT NULL). Validar e converter para inteiro.
      if (body.atendente_matricula === undefined || body.atendente_matricula === null || body.atendente_matricula === '') {
        return res.status(400).json({ message: "atendente_matricula é obrigatório." });
      }
      const atendenteId = parseInt(body.atendente_matricula, 10);
      if (isNaN(atendenteId)) return res.status(400).json({ message: "atendente_matricula inválido." });

      // Verificar se o usuário existe
      const atendente = await Usuario.buscarPorId(atendenteId);
      if (!atendente) return res.status(400).json({ message: "Atendente (usuario) não encontrado." });

      const novo = {
        forma_atendimento: body.forma_atendimento,
        perfil: body.perfil,
        nome_empregador: body.nome_empregador || null,
        cnpj: body.cnpj || null,
        telefone_contato: body.telefone_contato || null,
        tipo_atendimento: body.tipo_atendimento,
        atendente_matricula: atendenteId,
        observacoes: body.observacoes || null
      };

      const result = await Atendimento.inserir(novo);
      res.status(201).json({ id: result[0], message: "Atendimento criado com sucesso." });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = req.params.id;
      const dados = req.body;
      const affected = await Atendimento.atualizar(id, dados);
      if (!affected) return res.status(404).json({ message: "Atendimento não encontrado." });
      res.json({ message: "Atendimento atualizado com sucesso." });
    } catch (err) {
      next(err);
    }
  },

  async excluir(req, res, next) {
    try {
      const id = req.params.id;
      const affected = await Atendimento.excluir(id);
      if (!affected) return res.status(404).json({ message: "Atendimento não encontrado." });
      res.json({ message: "Atendimento removido com sucesso." });
    } catch (err) {
      next(err);
    }
  }
};