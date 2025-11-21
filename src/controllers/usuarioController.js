const Usuario = require("../models/usuarioModel")

module.exports = {

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) return res.status(400).json({ message: 'Email e senha são obrigatórios.' });

      const usuario = await Usuario.buscarPorEmail(email);

      if (!usuario) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const bcrypt = require('bcrypt');
      const match = await bcrypt.compare(senha, usuario.senha);
      if (!match) return res.status(401).json({ message: 'Credenciais inválidas.' });

      // Retorne os dados que precisar (não retorne a senha)
      const { id, nome_usuario } = usuario;
      // opcional: gere token JWT aqui e retorne { token, message, usuario }
      res.json({ message: 'Login realizado com sucesso.', usuario: { id, nome_usuario, email } });
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
