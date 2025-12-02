const API = 'http://localhost:3000/relatorios';

const btnFiltrar = document.getElementById('btnFiltrar');
const filtroTexto = document.getElementById('filtroTexto');
const filtroForma = document.getElementById('filtroForma');
const filtroPerfil = document.getElementById('filtroPerfil');
const filtroTipo = document.getElementById('filtroTipo');
const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const listaRelatorios = document.getElementById('listaRelatorios');
const filtroPaciente = document.getElementById('filtroPaciente');

const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const formEditar = document.getElementById('formEditar');
const editId = document.getElementById('editId');
const editForma = document.getElementById('editForma');
const editPerfil = document.getElementById('editPerfil');
const editTipo = document.getElementById('editTipo');
const createdAt = document.getElementById('createdAt');
const editedAt = document.getElementById('editedAt');

function getLoggedUser() {
  try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch(e){ return null; }
}
function adminHeader() {
  const u = getLoggedUser();
  return u && u.id_usuario ? { 'x-admin-id': String(u.id_usuario) } : {};
}

function buildQuery() {
  const params = new URLSearchParams();
  if (filtroForma && filtroForma.value) params.set('forma', filtroForma.value);
  if (filtroPerfil && filtroPerfil.value) params.set('perfil', filtroPerfil.value);
  if (filtroTipo && filtroTipo.value) params.set('tipo', filtroTipo.value);
  if (filtroTexto && filtroTexto.value) params.set('q', filtroTexto.value);
  // inclui filtro por usuário (paciente/atendente) quando selecionado
  if (filtroPaciente && filtroPaciente.value) params.set('atendente', filtroPaciente.value);
  if (dataInicio && dataInicio.value) params.set('start', dataInicio.value + ' 00:00:00');
  if (dataFim && dataFim.value) params.set('end', dataFim.value + ' 23:59:59');
  return params.toString();
}

async function fetchUsuarios() {
  if (!filtroPaciente) return;
  try {
    // buscar relatórios para descobrir quem criou atendimentos
    const res = await fetch(`${API}`, { headers: adminHeader() });
    if (!res.ok) {
      console.warn('Não foi possível carregar usuários a partir dos relatórios:', res.status, await res.text());
      return;
    }
    const rows = await res.json();

    // mapear usuarios únicos presentes em relatorios (usuario_matricula) e usar nome como value
    const map = new Map();
    rows.forEach(r => {
      const id = r.usuario_matricula;
      const nome = (r.filtro_atendente || r.usuario_nome || String(id)).trim();
      if (nome && !map.has(nome)) {
        map.set(nome, { id, nome });
      }
    });

    // ordenar por nome e montar options (value = nome para pesquisar por filtro_atendente)
    const options = Array.from(map.values())
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(u => `<option value="${u.nome}">${u.nome} (${u.id})</option>`)
      .join('');

    filtroPaciente.innerHTML = '<option value="">Todos</option>' + options;
  } catch (err) {
    console.error('Erro ao buscar usuários a partir dos relatórios:', err);
  }
}

async function fetchRelatorios() {
  try {
    const q = buildQuery();
    const res = await fetch(`${API}${q ? '?' + q : ''}`, { headers: adminHeader() });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'Erro ao obter relatórios');
    }
    const rows = await res.json();
    renderList(rows || []);
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar relatórios. Veja console.');
  }
}

function renderList(rows) {
  listaRelatorios.innerHTML = '';
  if (!rows.length) {
    listaRelatorios.innerHTML = '<p style="padding:18px">Nenhum relatório encontrado.</p>';
    return;
  }
  rows.forEach(r => {
    const item = document.createElement('div');
    item.className = 'card';
    item.innerHTML = `
      <h3>Relatório #${r.id_relatorio}</h3>
      <p><strong>Gerado por:</strong> ${r.usuario_nome || r.filtro_atendente || r.usuario_matricula}</p>
      <p><strong>Forma:</strong> ${r.filtro_forma_atendimento}</p>
      <p><strong>Tipo:</strong> ${r.filtro_tipo_atendimento || ''}</p>
      <p><strong>Perfil:</strong> ${r.filtro_perfil}</p>
      <p><small>Gerado em: ${r.data_geracao ? new Date(r.data_geracao).toLocaleString() : ''}</small></p>
      <p><small>Última edição: ${r.data_edicao ? new Date(r.data_edicao).toLocaleString() : ''}</small></p>
      <div class="card-actions">
        <button class="btn-primary" onclick="abrirEditar(${r.id_relatorio})">Editar</button>
        <button class="download-btn" onclick="downloadRelatorio(${r.id_relatorio})">Download CSV</button>
      </div>
    `;
    listaRelatorios.appendChild(item);
  });
}

window.abrirEditar = async function(id) {
  try {
    const res = await fetch(`${API}?q=${encodeURIComponent(String(id))}`, { headers: adminHeader() });
    if (!res.ok) throw new Error('Não foi possível obter relatório');
    const rows = await res.json();
    const r = rows && rows.length ? rows.find(x=>String(x.id_relatorio)===String(id)) : null;
    if (!r) { alert('Relatório não encontrado'); return; }

    editId.value = r.id_relatorio;
    editForma.value = r.filtro_forma_atendimento || 'presencial';
    editPerfil.value = r.filtro_perfil || 'empregador';
    editTipo.value = r.filtro_tipo_atendimento || '';
    createdAt.textContent = r.data_geracao ? new Date(r.data_geracao).toLocaleString() : '';
    editedAt.textContent = r.data_edicao ? new Date(r.data_edicao).toLocaleString() : '';

    modal.style.display = 'flex';
  } catch (err) {
    console.error(err);
    alert('Erro ao abrir edição.');
  }
};

closeModal.addEventListener('click', ()=> modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editId.value;
  if (!id) return;

  const payload = {
    filtro_forma_atendimento: editForma.value,
    filtro_perfil: editPerfil.value,
    filtro_tipo_atendimento: editTipo.value
  };

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminHeader() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'Erro ao salvar');
    }
    modal.style.display = 'none';
    fetchRelatorios();
    alert('Relatório atualizado.');
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar alteração. Verifique permissão e backend.');
  }
});

function downloadRelatorio(id) {
  const url = `${API}/${encodeURIComponent(String(id))}/csv`;

  fetch(url, { method: 'GET' })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao gerar CSV: ' + res.status);
      return res.blob();
    })
    .then(blob => {
      const filename = `relatorio${id}.csv`;
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8' }));
      // abre em nova aba apenas com esse CSV
      window.open(blobUrl, '_blank');
      // inicia download automático
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60 * 1000);
    })
    .catch(err => {
      console.error('Erro download CSV:', err);
      alert('Não foi possível baixar o CSV. Verifique o console.');
    });
}

document.getElementById('btnFiltrar').addEventListener('click', fetchRelatorios);

// carrega inicialmente
fetchUsuarios();
fetchRelatorios();