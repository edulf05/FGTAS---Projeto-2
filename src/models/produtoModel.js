const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("produtos")
      .select("produtos.*", "categorias.nome_categoria AS categoriaNome")
      .leftJoin("categorias", "produtos.categoria_id", "=", "categorias.id_categoria")
      .orderBy("produtos.id_produto", "asc");
  },

  buscarPorId(id) {
    return conn("produtos").where("id_produto", id).first();
  },

  inserir(produto) {
    return conn("produtos").insert(produto);
  },

  atualizar(id, dados) {
    return conn("produtos").where("id_produto", id).update(dados);
  },

  excluir(id) {
    return conn("produtos").where("id_produto", id).delete();
  }
};
