const Pedido = require("../models/pedidoModel");

module.exports = {
  async listar(req, res, next) {
    try {
      const pedidos = await Pedido.listar();
      res.json(pedidos);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.buscarPorId(id);

      if (!pedido) {
        return res.status(404).json({ mensagem: "Pedido não encontrado." });
      }

      res.json(pedido);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorCliente(req, res, next) {
    try {
      const { idCliente } = req.params;
      const pedidos = await Pedido.buscarPorCliente(idCliente);

      if (pedidos.length === 0) {
        return res.status(404).json({ mensagem: "Nenhum pedido encontrado para este cliente." });
      }

      res.json(pedidos);
    } catch (err) {
      next(err);
    }
  },

  async inserir(req, res, next) {
    try {
      const { horario, endereco, cliente_id } = req.body;

      if (!endereco || !horario) {
        return res.status(400).json({ erro: "Campos obrigatórios: endereco e horario." });
      }

      const novoPedido = { horario, endereco, cliente_id };
      const [id] = await Pedido.inserir(novoPedido);

      res.status(201).json({
        mensagem: "Pedido cadastrado com sucesso!",
        id_pedido: id,
        ...novoPedido
      });
    } catch (err) {
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atualizado = await Pedido.atualizar(id, req.body);

      if (!atualizado) {
        return res.status(404).json({ mensagem: "Pedido não encontrado para atualização." });
      }

      res.json({ mensagem: "Pedido atualizado com sucesso!" });
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

      const atualizado = await Pedido.atualizar(id, campos);

      if (!atualizado) {
        return res.status(404).json({ mensagem: "Pedido não encontrado." });
      }

      res.json({ mensagem: "Pedido atualizado parcialmente!", campos });
    } catch (err) {
      next(err);
    }
  },

  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await Pedido.excluir(id);

      if (!deletado) {
        return res.status(404).json({ mensagem: "Pedido não encontrado para exclusão." });
      }

      res.json({ mensagem: "Pedido excluído com sucesso!" });
    } catch (err) {
      next(err);
    }
  }
};
