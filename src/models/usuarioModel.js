const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("usuarios").orderBy("nome_usuario", "asc");
  },

  buscarPorId(id) {
    return conn("usuarios").where("id_usuario", id).first();
  },

  inserir(usuario) {
    return conn("usuarios").insert(usuario);
  },

  atualizar(id, dados) {
    return conn("usuarios").where("id_usuario", id).update(dados);
  },

  excluir(id) {
    return conn("usuarios").where("id_usuario", id).delete();
  }

};
