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
          'r.atendimento_id',
          'a.nome_empregador',
          'a.cnpj',
          'a.telefone_contato',
          'r.data_geracao',
          'r.data_edicao',
          conn.raw('u.nome_usuario as usuario_nome')
        )
        .leftJoin('usuarios as u', 'r.usuario_matricula', 'u.id_usuario')
        .leftJoin('atendimentos as a', 'r.atendimento_id', 'a.id_atendimento')
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
        'r.atendimento_id',
        'a.nome_empregador',
        'a.cnpj',
        'a.telefone_contato',
        'r.data_geracao',
        'r.data_edicao',
        conn.raw('u.nome_usuario as usuario_nome')
      )
      .leftJoin('usuarios as u', 'r.usuario_matricula', 'u.id_usuario')
      .leftJoin('atendimentos as a', 'r.atendimento_id', 'a.id_atendimento')
      .where('r.id_relatorio', id)
      .first();

    if (!row) return res.status(404).send('Relatório não encontrado');

    // -------- FORMATADORES --------
    const formatDate = (d) => {
      if (!d) return '';
      const data = new Date(d);
      return data.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    };

    // colocar todos os valores entre aspas e duplicar aspas internas
    const esc = (v) => {
      if (v === null || v === undefined) return '""';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };

    // -------- CABEÇALHOS LEGÍVEIS --------
    const headers = [
      'ID do Relatorio',
      'Matrícula do Usuario',
      'Nome do Usuario',
      'Filtro: Atendente',
      'Filtro: Forma Atendimento',
      'Filtro: Tipo Atendimento',
      'Filtro: Perfil',
      'Atendimento ID',
      'Nome Empregador',
      'CNPJ',
      'Telefone Contato',
      'Data de Geracao',
      'Data de Edicao'
    ];

    // -------- VALORES FORMATADOS --------
    const values = [
      row.id_relatorio,
      row.usuario_matricula,
      row.usuario_nome,
      row.filtro_atendente,
      row.filtro_forma_atendimento,
      row.filtro_tipo_atendimento,
      row.filtro_perfil,
      row.atendimento_id,
      row.nome_empregador,
      row.cnpj,
      row.telefone_contato,
      formatDate(row.data_geracao),
      formatDate(row.data_edicao)
    ].map(esc);

    // Usa ; como separador (Excel BR) e cabeçalhos também entre aspas
    const csv = headers.map(esc).join(';') + '\n' + values.join(';') + '\n';


    // -------- RETORNO --------
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_${id}.csv`);
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

      if (Object.keys(payload).length === 0 && typeof body.nome_empregador === 'undefined' && typeof body.cnpj === 'undefined' && typeof body.telefone_contato === 'undefined') {
        return res.status(400).json({ message: 'Nada para atualizar.' });
      }

      // buscar relatório para obter atendimento_id (se houver)
      const rel = await conn('relatorios_atendimentos').select('atendimento_id').where('id_relatorio', id).first();
      const atendimentoId = rel ? rel.atendimento_id : null;

      // atualiza data_edicao para now
      if (Object.keys(payload).length > 0) {
        payload.data_edicao = conn.fn.now();
        const updated = await conn('relatorios_atendimentos').where('id_relatorio', id).update(payload);
        if (!updated) return res.status(404).json({ message: 'Relatório não encontrado.' });
      }

      // se vierem campos de empregador e temos atendimento_id, atualiza tabela atendimentos
      if (atendimentoId && (typeof body.nome_empregador !== 'undefined' || typeof body.cnpj !== 'undefined' || typeof body.telefone_contato !== 'undefined')) {
        const up = {};
        if (typeof body.nome_empregador !== 'undefined') up.nome_empregador = body.nome_empregador;
        if (typeof body.cnpj !== 'undefined') up.cnpj = body.cnpj;
        if (typeof body.telefone_contato !== 'undefined') up.telefone_contato = body.telefone_contato;
        // atualiza também a data de edição do atendimento se quiser (opcional)
        await conn('atendimentos').where('id_atendimento', atendimentoId).update(up);
      }

      return res.json({ message: 'Relatório atualizado.' });
    } catch (err) {
      console.error('Erro atualizar relatorio:', err);
      next(err);
    }
  }
}