const conn = require("../config/knex");

module.exports = {
  async listar(req, res, next) {
    try {
      const { forma, perfil, atendente, start, end, q, tipo } = req.query;

      const query = conn('relatorios_atendimentos as r')
        .select(
          'r.id_relatorio',
          'r.usuario_matricula',
          'r.filtro_atendente',
          'r.filtro_forma_atendimento',
          'r.filtro_perfil',
          'r.filtro_tipo_atendimento',
          'r.data_geracao',
          'r.data_edicao',
          conn.raw('u.nome_usuario as usuario_nome')
        )
        .leftJoin('usuarios as u', 'r.usuario_matricula', 'u.id_usuario')
        .orderBy('r.data_geracao', 'desc');

      if (forma) query.where('r.filtro_forma_atendimento', forma);
      if (perfil) query.where('r.filtro_perfil', perfil);
      if (tipo) query.where('r.filtro_tipo_atendimento', tipo);
      if (atendente) query.where('r.filtro_atendente', 'like', `%${atendente}%`);

      if (start) query.where('r.data_geracao', '>=', start);
      if (end) query.where('r.data_geracao', '<=', end);

      if (q) {
        const qTrim = String(q).trim();
        if (/^\d+$/.test(qTrim)) {
          query.andWhere(function() {
            this.where('r.id_relatorio', qTrim)
              .orWhere('r.usuario_matricula', qTrim)
              .orWhere('r.filtro_atendente', 'like', `%${qTrim}%`)
              .orWhere('r.filtro_forma_atendimento', 'like', `%${qTrim}%`)
              .orWhere('r.filtro_perfil', 'like', `%${qTrim}%`)
              .orWhere('r.filtro_tipo_atendimento', 'like', `%${qTrim}%`);
          });
        } else {
          query.andWhere(function() {
            this.where('r.filtro_atendente', 'like', `%${qTrim}%`)
                .orWhere('r.filtro_forma_atendimento', 'like', `%${qTrim}%`)
                .orWhere('r.filtro_perfil', 'like', `%${qTrim}%`)
                .orWhere('r.filtro_tipo_atendimento', 'like', `%${qTrim}%`);
          });
        }
      }

      const rows = await query;
      return res.json(rows);
    } catch (err) {
      console.error('Erro listar relatorios:', err);
      next(err);
    }
  }
};