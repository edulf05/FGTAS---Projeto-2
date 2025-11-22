const conn = require("../config/knex");

module.exports = {
  listar() {
    return conn("atendimentos").select("*").orderBy("data_atendimento", "desc");
  },

  buscarPorId(id) {
    return conn("atendimentos").where("id_atendimento", id).first();
  },

  inserir(atendimento) {
    return conn("atendimentos").insert(atendimento);
  },

  atualizar(id, dados) {
    return conn("atendimentos").where("id_atendimento", id).update(dados);
  },

  excluir(id) {
    return conn("atendimentos").where("id_atendimento", id).del();
  }
};