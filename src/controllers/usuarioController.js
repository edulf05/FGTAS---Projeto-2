const Usuario = require("../models/usuarioModel");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {

  async login(req, res, next) {
    try {
      const { login, senha } = req.body;
      if (!login || !senha) return res.status(400).json({ message: 'Usuário/email e senha são obrigatórios.' });

      const usuario = await Usuario.buscarPorLogin(login);
      if (!usuario) return res.status(401).json({ message: 'Credenciais inválidas.' });

      const senhaDb = usuario.senha_usuario || usuario.senha || '';
      let match = false;

      if (typeof senhaDb === 'string' && senhaDb.startsWith && senhaDb.startsWith('$2')) {
        match = await bcrypt.compare(senha, senhaDb);
      } else if (typeof senhaDb === 'string' && /^[a-f0-9]{64}$/i.test(senhaDb)) {
        const hash = crypto.createHash('sha256').update(senha).digest('hex');
        match = (hash === senhaDb);
      } else {
        match = senha === senhaDb;
      }

      if (!match) return res.status(401).json({ message: 'Credenciais inválidas.' });

      const responseUsuario = {
        id_usuario: usuario.id_usuario,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        adm_usuario: usuario.adm_usuario,
        ativo: usuario.ativo ? 1 : 0
      };

      res.json({ message: 'Login realizado com sucesso.', usuario: responseUsuario });
    } catch (err) {
      next(err);
    }
  },

  async listar(req, res, next) {
    try {
      const rows = await Usuario.listar();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = req.params.id;
      const row = await Usuario.buscarPorId(id);
      if (!row) return res.status(404).json({ message: "Usuário não encontrado." });
      res.json(row);
    } catch (err) {
      next(err);
    }
  },

  async inserir(req, res, next) {
    try {
      const body = req.body || {};
      if (!body.nome_usuario || !body.email_usuario || !body.senha_usuario) {
        return res.status(400).json({ message: "Campos obrigatórios: nome_usuario, email_usuario, senha_usuario." });
      }

      const existente = await Usuario.buscarPorLogin(body.email_usuario);
      if (existente) return res.status(409).json({ message: "Email ou usuário já cadastrado." });

      const adm = body.adm_usuario ? 1 : 0;
      const ativo = (typeof body.ativo !== 'undefined') ? (body.ativo ? 1 : 0) : 1;

      const novo = {
        nome_usuario: body.nome_usuario,
        email_usuario: body.email_usuario,
        senha_usuario: body.senha_usuario,
        adm_usuario: adm,
        ativo: ativo
      };

      const result = await Usuario.inserir(novo);
      return res.status(201).json({ id: result[0], message: "Usuário criado." });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = req.params.id;
      const body = req.body || {};

      const user = await Usuario.buscarPorId(id);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

      const dados = {};
      if (body.nome_usuario) dados.nome_usuario = body.nome_usuario;
      if (body.email_usuario) dados.email_usuario = body.email_usuario;
      if (body.senha_usuario) dados.senha_usuario = body.senha_usuario;
      if (typeof body.adm_usuario !== 'undefined') dados.adm_usuario = body.adm_usuario ? 1 : 0;
      if (typeof body.ativo !== 'undefined') dados.ativo = body.ativo ? 1 : 0;

      await Usuario.atualizar(id, dados);
      return res.json({ message: "Usuário atualizado." });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  async excluir(req, res, next) {
    try {
      const id = req.params.id;
      const user = await Usuario.buscarPorId(id);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

      await Usuario.excluir(id);
      return res.json({ message: "Usuário removido." });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

};