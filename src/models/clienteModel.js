const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("clientes")
      .select("clientes.*", "cidades.nome_cidade AS cidadeNome")
      .leftJoin("cidades", "clientes.cidade_id", "=", "cidades.id_cidade")
      .orderBy("clientes.nome_cliente", "asc");
  },

  buscarPorId(id) {
    return conn("clientes").where("id_cliente", id).first();
  },

  inserir(cliente) {
    return conn("clientes").insert(cliente);
  }
};
