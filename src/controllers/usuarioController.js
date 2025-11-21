const Usuario = require("../models/usuarioModel")
const bcrypt = require('bcrypt');

module.exports = {

  // ...existing code...
  async login(req, res, next) {
    try {
      const { login, senha } = req.body;
      if (!login || !senha) return res.status(400).json({ message: 'Usuário/email e senha são obrigatórios.' });

      const usuario = await Usuario.buscarPorLogin(login);
      if (!usuario) return res.status(401).json({ message: 'Credenciais inválidas.' });

      const senhaDb = usuario.senha_usuario || usuario.senha || '';
      let match = false;

      // bcrypt hash (ex.: $2...)
      if (typeof senhaDb === 'string' && senhaDb.startsWith && senhaDb.startsWith('$2')) {
        match = await bcrypt.compare(senha, senhaDb);
      }
      // SHA-256 hex (64 caracteres hex armazenado pelo trigger SHA2)
      else if (typeof senhaDb === 'string' && /^[a-f0-9]{64}$/i.test(senhaDb)) {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(senha).digest('hex');
        match = (hash === senhaDb);
      }
      // fallback: comparação direta (texto simples)
      else {
        match = senha === senhaDb;
      }

      if (!match) return res.status(401).json({ message: 'Credenciais inválidas.' });

      const responseUsuario = {
        id: usuario.id_usuario || usuario.id,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario || usuario.email
      };

      res.json({ message: 'Login realizado com sucesso.', usuario: responseUsuario });
    } catch (err) {
      next(err);
    }
  },

  async listar(req, res, next) {
    try {
      const usuarios = await Usuario.listar();
      res.json(usuarios);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrada." });
      }

      res.json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async inserir(req, res, next) {
    try {
      const { nome_usuario, email_usuario, senha_usuario } = req.body;

      if (!nome_usuario) {
        return res.status(400).json({ erro: "O campo nome_usuario é obrigatório." });
      }
      if (!email_usuario) {
        return res.status(400).json({ erro: "O campo email_usuario é obrigatório." });
      }
      if (!senha_usuario) {
        return res.status(400).json({ erro: "O campo senha_usuario é obrigatório." });
      }

      const [id] = await Usuario.inserir({ nome_usuario, email_usuario, senha_usuario });

      res.status(201).json({
        mensagem: "Usuario cadastrada com sucesso!",
        id_usuario: id,
        nome_usuario,
        email_usuario
      });
    } catch (err){
      if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email já cadastrado!' });
      }
      next(err);
    }

},

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atualizado = await Usuario.atualizar(id, req.body);

      if (!atualizado) {
        return res.status(404).json({ mensagem: "Usuario não encontrado." });
      }

      res.json({ mensagem: "Usuario atualizado com sucesso!" });
    } catch (err) {
      next(err);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Usuario.excluir(id);

      if (!deletado) {
        return res.status(404).json({ mensagem: "Usuario não encontrado." });
      }

      res.json({ mensagem: "Usuario excluído com sucesso!" });
    } catch (err) {
      next(err);
    }
  }

};
