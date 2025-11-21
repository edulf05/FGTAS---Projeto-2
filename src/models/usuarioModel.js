const conn = require("../config/knex");

module.exports = {
  
  listar() {
    return conn("usuarios").orderBy("nome_usuario", "asc");
  },

  buscarPorId(id) {
    return conn("usuarios").where("id_usuario", id).first();
  },

  // buscar por email_usuario OU nome_usuario
  buscarPorLogin(login) {
    return conn("usuarios")
      .where("email_usuario", login)
      .orWhere("nome_usuario", login)
      .first();
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