const conn = require("../config/knex");
const Usuario = require("../models/usuarioModel");

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
      if (atendente) {
        // atendente pode ser nome (filtro_atendente) ou id (usuario_matricula)
        if (/^\d+$/.test(String(atendente).trim())) {
          query.where('r.usuario_matricula', atendente);
        } else {
          query.where('r.filtro_atendente', 'like', `%${atendente}%`);
        }
      }

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
  },

  async csvById(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).send('ID obrigatório');

      const row = await conn('relatorios_atendimentos as r')
        .select(
          'r.id_relatorio',
          'r.usuario_matricula',
          'r.filtro_atendente',
          'r.filtro_forma_atendimento',
          'r.filtro_tipo_atendimento',
          'r.filtro_perfil',
          'r.data_geracao',
          'r.data_edicao',
          conn.raw('u.nome_usuario as usuario_nome')
        )
        .leftJoin('usuarios as u', 'r.usuario_matricula', 'u.id_usuario')
        .where('r.id_relatorio', id)
        .first();

      if (!row) return res.status(404).send('Relatório não encontrado');

      // montar CSV com cabeçalho e uma linha (escapa valores com ")
      const headers = [
        'id_relatorio',
        'usuario_matricula',
        'usuario_nome',
        'filtro_atendente',
        'filtro_forma_atendimento',
        'filtro_tipo_atendimento',
        'filtro_perfil',
        'data_geracao',
        'data_edicao'
      ];
      const esc = v => {
        if (v === null || typeof v === 'undefined') return '';
        const s = String(v);
        return (s.includes('"') || s.includes(',') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const values = [
        row.id_relatorio,
        row.usuario_matricula,
        row.usuario_nome,
        row.filtro_atendente,
        row.filtro_forma_atendimento,
        row.filtro_tipo_atendimento,
        row.filtro_perfil,
        row.data_geracao ? new Date(row.data_geracao).toISOString() : '',
        row.data_edicao ? new Date(row.data_edicao).toISOString() : ''
      ].map(esc);

      const csv = headers.join(',') + '\n' + values.join(',') + '\n';

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio${id}.csv`);
      return res.send(csv);
    } catch (err) {
      console.error('Erro csvById:', err);
      next(err);
    }
  },

  async atualizar(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: 'ID do relatório é obrigatório.' });

      // verificação simples de admin via header x-admin-id
      const adminId = req.header('x-admin-id');
      if (!adminId) return res.status(401).json({ message: 'Admin required.' });
      const admin = await Usuario.buscarPorId(parseInt(adminId, 10));
      if (!admin || Number(admin.adm_usuario) !== 1) {
        return res.status(403).json({ message: 'Forbidden. Admin only.' });
      }

      const body = req.body || {};
      const payload = {};
      if (typeof body.filtro_forma_atendimento !== 'undefined') payload.filtro_forma_atendimento = body.filtro_forma_atendimento;
      if (typeof body.filtro_perfil !== 'undefined') payload.filtro_perfil = body.filtro_perfil;
      if (typeof body.filtro_tipo_atendimento !== 'undefined') payload.filtro_tipo_atendimento = body.filtro_tipo_atendimento;

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ message: 'Nada para atualizar.' });
      }

      // atualiza data_edicao para now
      payload.data_edicao = conn.fn.now();

      const updated = await conn('relatorios_atendimentos').where('id_relatorio', id).update(payload);
      if (!updated) return res.status(404).json({ message: 'Relatório não encontrado.' });

      return res.json({ message: 'Relatório atualizado.' });
    } catch (err) {
      console.error('Erro atualizar relatorio:', err);
      next(err);
    }
  }
};