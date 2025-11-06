const Categoria = require("../models/categoriaModel");

module.exports = {
  async listar(req, res, next) {
    try {
      const categorias = await Categoria.listar();
      res.json(categorias);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await Categoria.buscarPorId(id);

      if (!categoria) {
        return res.status(404).json({ mensagem: "Categoria não encontrada." });
      }

      res.json(categoria);
    } catch (err) {
      next(err);
    }
  },

  async inserir(req, res, next) {
    try {
      const { nome_categoria } = req.body;

      if (!nome_categoria) {
        return res.status(400).json({ erro: "O campo nome_categoria é obrigatório." });
      }

      const [id] = await Categoria.inserir({ nome_categoria });

      res.status(201).json({
        mensagem: "Categoria cadastrada com sucesso!",
        id_categoria: id,
        nome_categoria
      });
    } catch (err) {
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atualizado = await Categoria.atualizar(id, req.body);

      if (!atualizado) {
        return res.status(404).json({ mensagem: "Categoria não encontrada." });
      }

      res.json({ mensagem: "Categoria atualizada com sucesso!" });
    } catch (err) {
      next(err);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Categoria.excluir(id);

      if (!deletado) {
        return res.status(404).json({ mensagem: "Categoria não encontrada." });
      }

      res.json({ mensagem: "Categoria excluída com sucesso!" });
    } catch (err) {
      next(err);
    }
  }
};
