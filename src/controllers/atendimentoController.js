const conn = require("../config/knex");
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
      const body = req.body || {};

      // validações mínimas (mantém as suas validações)
      const formasValidas = ['presencial','whatsapp','ligacao','email','redes-sociais','teams','outra'];
      const perfisValidos = ['empregador','trabalhador','outras-agencias','ads','setores-fgtas','mercado-de-trabalho','outra'];

      if (!body.forma_atendimento || !formasValidas.includes(body.forma_atendimento)) {
        return res.status(400).json({ message: "Dados inválidos." });
      }
      if (!body.perfil || !perfisValidos.includes(body.perfil)) {
        return res.status(400).json({ message: "Dados inválidos." });
      }
      if (!body.tipo_atendimento || String(body.tipo_atendimento).trim().length === 0) {
        return res.status(400).json({ message: "Dados inválidos." });
      }

      // se empregador, valida CNPJ (pode reutilizar função existente)
      if (body.perfil === 'empregador') {
        if (!body.cnpj) return res.status(400).json({ message: "Dados inválidos." });
        // supondo que exista validarCNPJ em outro lugar; caso contrário, implemente aqui
      }

      if (body.atendente_matricula === undefined || body.atendente_matricula === null || String(body.atendente_matricula).trim() === '') {
        return res.status(400).json({ message: "Dados inválidos." });
      }
      const atendenteId = parseInt(body.atendente_matricula, 10);
      if (isNaN(atendenteId)) return res.status(400).json({ message: "Dados inválidos." });

      // busca nome do atendente (opcional)
      const Usuario = require("../models/usuarioModel");
      const atendente = await Usuario.buscarPorId(atendenteId);
      if (!atendente) return res.status(400).json({ message: "Dados inválidos." });

      const novoAtendimento = {
        forma_atendimento: body.forma_atendimento,
        perfil: body.perfil,
        nome_empregador: body.nome_empregador || null,
        cnpj: body.cnpj || null,
        telefone_contato: body.telefone_contato || null,
        tipo_atendimento: body.tipo_atendimento,
        atendente_matricula: atendenteId,
        observacoes: body.observacoes || null
      };

      //insere atendimento e relatório numa única transação
      const result = await conn.transaction(async trx => {
        const [insertId] = await trx('atendimentos').insert(novoAtendimento);

        const relatorio = {
          usuario_matricula: atendenteId,
          filtro_atendente: atendente.nome_usuario || null,
          filtro_forma_atendimento: body.forma_atendimento,
          filtro_perfil: body.perfil,
          filtro_tipo_atendimento: body.tipo_atendimento,  // <-- NOVO CAMPO
          atendimento_id: insertId // <-- referencia o atendimento recém-criado
        };

        await trx('relatorios_atendimentos').insert(relatorio);
        return insertId;
      });

      return res.status(201).json({ id: result, message: "Atendimento cadastrado com sucesso!" });
    } catch (err) {
      console.error('Erro ao inserir atendimento:', err);
      return res.status(500).json({ message: 'Erro interno ao criar atendimento.' });
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