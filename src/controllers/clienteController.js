const Cliente = require("../models/clienteModel");

module.exports = {
  async listar(req, res, next) {
    try {
      const clientes = await Cliente.listar();
      res.json(clientes);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.buscarPorId(id);

      if (!cliente) {
        return res.status(404).json({ mensagem: "Cliente não encontrado." });
      }

      res.json(cliente);
    } catch (err) {
      next(err);
    }
  },

  async inserir(req, res, next) {
    try {
      const { nome_cliente, altura, nascimento, cidade_id } = req.body;

      if (!nome_cliente) {
        return res.status(400).json({ erro: "O campo nome_cliente é obrigatório." });
      }

      const novoCliente = { nome_cliente, altura, nascimento, cidade_id };
      const [id] = await Cliente.inserir(novoCliente);

      res.status(201).json({
        mensagem: "Cliente cadastrado com sucesso!",
        id_cliente: id,
        ...novoCliente
      });
    } catch (err) {
      next(err);
    }
  }
};
