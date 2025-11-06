const Produto = require("../models/produtoModel");

module.exports = {
  async listar(req, res, next) {
    try {
      const produtos = await Produto.listar();
      res.json(produtos);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await Produto.buscarPorId(id);

      if (!produto) {
        return res.status(404).json({ mensagem: "Produto não encontrado." });
      }

      res.json(produto);
    } catch (err) {
      next(err);
    }
  },

  async inserir(req, res, next) {
    try {
      const { nome_produto, preco_produto, quantidade, categoria_id } = req.body;

      if (!nome_produto || !preco_produto || !quantidade || !categoria_id) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
      }

      const novoProduto = { nome_produto, preco_produto, quantidade, categoria_id };
      const [id] = await Produto.inserir(novoProduto);

      res.status(201).json({
        mensagem: "Produto cadastrado com sucesso!",
        id_produto: id,
        ...novoProduto
      });
    } catch (err) {
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atualizado = await Produto.atualizar(id, req.body);

      if (!atualizado) {
        return res.status(404).json({ mensagem: "Produto não encontrado." });
      }

      res.json({ mensagem: "Produto atualizado com sucesso!" });
    } catch (err) {
      next(err);
    }
  },

  async atualizarParcial(req, res, next) {
    try {
      const { id } = req.params;
      const campos = req.body;

      if (Object.keys(campos).length === 0) {
        return res.status(400).json({ erro: "Nenhum campo enviado para atualização." });
      }

      const atualizado = await Produto.atualizar(id, campos);

      if (!atualizado) {
        return res.status(404).json({ mensagem: "Produto não encontrado." });
      }

      res.json({ mensagem: "Produto atualizado parcialmente!", campos });
    } catch (err) {
      next(err);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Produto.excluir(id);

      if (!deletado) {
        return res.status(404).json({ mensagem: "Produto não encontrado para exclusão." });
      }

      res.json({ mensagem: "Produto excluído com sucesso!" });
    } catch (err) {
      next(err);
    }
  }
};
