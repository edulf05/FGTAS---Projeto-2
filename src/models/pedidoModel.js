const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("pedidos")
      .select("pedidos.*", "clientes.nome_cliente AS nomeCliente")
      .leftJoin("clientes", "pedidos.cliente_id", "=", "clientes.id_cliente")
      .orderBy("pedidos.id_pedido", "asc");
  },

  buscarPorId(id) {
    return conn("pedidos").where("id_pedido", id).first();
  },

  buscarPorCliente(idCliente) {
    return conn("pedidos")
      .select("pedidos.*", "clientes.nome_cliente AS nomeCliente")
      .leftJoin("clientes", "pedidos.cliente_id", "=", "clientes.id_cliente")
      .where("pedidos.cliente_id", idCliente)
      .orderBy("pedidos.id_pedido", "asc");
  },

  inserir(pedido) {
    return conn("pedidos").insert(pedido);
  },

  atualizar(id, dados) {
    return conn("pedidos").where("id_pedido", id).update(dados);
  },

  excluir(id) {
    return conn("pedidos").where("id_pedido", id).delete();
  }
};
