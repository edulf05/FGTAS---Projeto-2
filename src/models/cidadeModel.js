const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("cidades").select("*").orderBy("nome_cidade", "asc");
  },

  buscarPorId(id) {
    return conn("cidades").where("id_cidade", id).first();
  },

  ultima() {
    return conn("cidades").orderBy("id_cidade", "desc").first();
  },
};
