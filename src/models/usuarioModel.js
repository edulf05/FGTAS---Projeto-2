const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("usuarios")
      .select("id_usuario", "nome_usuario", "email_usuario", "data_usuario", "editado_usuario", "adm_usuario", "ativo")
      .orderBy("nome_usuario", "asc");
  },

  buscarPorId(id) {
    return conn("usuarios").where("id_usuario", id).first();
  },

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
    const payload = { ...dados, editado_usuario: conn.fn.now() };
    return conn("usuarios").where("id_usuario", id).update(payload);
  },

  excluir(id) {
    return conn("usuarios").where("id_usuario", id).del();
  }
};