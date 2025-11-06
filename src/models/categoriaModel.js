const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("categorias").orderBy("nome_categoria", "asc");
  },

  buscarPorId(id) {
    return conn("categorias").where("id_categoria", id).first();
  },

  inserir(categoria) {
    return conn("categorias").insert(categoria);
  },

  atualizar(id, dados) {
    return conn("categorias").where("id_categoria", id).update(dados);
  },

  excluir(id) {
    return conn("categorias").where("id_categoria", id).delete();
  }
};
