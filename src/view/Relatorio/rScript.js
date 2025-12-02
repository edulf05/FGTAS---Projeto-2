const API = 'http://localhost:3000/relatorios';

const btnFiltrar = document.getElementById('btnFiltrar');
const filtroTexto = document.getElementById('filtroTexto');
const filtroPaciente = document.getElementById('filtroPaciente');
const filtroAtendimento = document.getElementById('filtroAtendimento'); 
const filtroTipo = document.getElementById('filtroTipo');
const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const listaRelatorios = document.getElementById('listaRelatorios');
const toggleViewBtn = document.getElementById('toggleView'); // novo
let latestRows = []; // cache dos últimos relatórios para re-render com trocar de visualização


function buildQuery() {
  const params = new URLSearchParams();
  // forma (agora enviada)
  if (filtroAtendimento && filtroAtendimento.value) params.set('forma', filtroAtendimento.value);
  if (filtroForma && filtroForma.value) params.set('forma', filtroForma.value);
  // perfil (novo)
  if (filtroPerfil && filtroPerfil.value) params.set('perfil', filtroPerfil.value);
  // tipo (texto livre/enumerado) — envia para filtro_tipo_atendimento no backend
  if (filtroTipo && filtroTipo.value) params.set('tipo', filtroTipo.value);
  if (filtroPaciente && filtroPaciente.value) params.set('atendente', filtroPaciente.value);

  // datas: enviar intervalo completo (start 00:00:00, end 23:59:59)
  if (dataInicio && dataInicio.value) {
    const s = dataInicio.value;
    params.set('start', s + ' 00:00:00');
  }
  if (dataFim && dataFim.value) {
    const e = dataFim.value;
    params.set('end', e + ' 23:59:59');
  }

  if (filtroTexto && filtroTexto.value) params.set('q', filtroTexto.value);
  return params.toString();
}

async function fetchRelatorios() {
  try {
    const q = buildQuery();
    const res = await fetch(`${API}${q ? '?' + q : ''}`);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'Erro ao obter relatórios');
    }
    const rows = await res.json();
    latestRows = rows || [];
    renderCards(latestRows);
    populatePacienteFilter(latestRows);
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar relatórios. Veja console.');
  }
}

function renderCards(rows) {
  listaRelatorios.innerHTML = '';
  if (!rows || !rows.length) {
    listaRelatorios.innerHTML = '<p style="padding:20px">Nenhum relatório encontrado.</p>';
    return;
  }

  const isList = listaRelatorios.classList.contains('list-mode');

  rows.forEach(r => {
    const div = document.createElement('div');
    if (isList) {
      div.className = 'list-item';
      div.innerHTML = `
        <div class="list-item-content">
          <h3>Relatório #${r.id_relatorio}</h3>
          <p><strong>Gerado por:</strong> ${r.usuario_nome || r.filtro_atendente || r.usuario_matricula}</p>
          <p><strong>Forma:</strong> ${r.filtro_forma_atendimento}</p>
          <p><strong>Tipo:</strong> ${r.filtro_tipo_atendimento || (r.tipo_atendimento || '')}</p>
          <p><strong>Perfil:</strong> ${r.filtro_perfil}</p>
          <p><strong>Gerado em:</strong> ${r.data_geracao ? new Date(r.data_geracao).toLocaleString() : ''}</p>
          <p><strong>Última edição:</strong> ${r.data_edicao ? new Date(r.data_edicao).toLocaleString() : ''}</p>
        </div>
        <div class="list-item-actions">
          <button class="download-btn" onclick="downloadRelatorio(${r.id_relatorio})">Download CSV</button>
        </div>
      `;
    } else {
      div.className = 'card';
      div.innerHTML = `
        <h3>Relatório #${r.id_relatorio}</h3>
        <p><strong>Gerado por:</strong> ${r.usuario_nome || r.filtro_atendente || r.usuario_matricula}</p>
        <p><strong>Forma:</strong> ${r.filtro_forma_atendimento}</p>
        <p><strong>Tipo:</strong> ${r.filtro_tipo_atendimento || (r.tipo_atendimento || '')}</p>
        <p><strong>Perfil:</strong> ${r.filtro_perfil}</p>
        <p><strong>Gerado em:</strong> ${r.data_geracao ? new Date(r.data_geracao).toLocaleString() : ''}</p>
        <p><strong>Última edição:</strong> ${r.data_edicao ? new Date(r.data_edicao).toLocaleString() : ''}</p>
        <div class="card-actions">
          <button class="btn-primary" onclick="downloadRelatorio(${r.id_relatorio})">Download CSV</button>
        </div>
      `;
    }
    listaRelatorios.appendChild(div);
  });
}

// toggle view
toggleViewBtn.addEventListener('click', () => {
  listaRelatorios.classList.toggle('list-mode');
  // atualizar texto do botão para indicar modo atual
  const isList = listaRelatorios.classList.contains('list-mode');
  toggleViewBtn.textContent = isList ? 'Visualização: Lista' : 'Visualização: Cartões';
  // re-render com latestRows
  renderCards(latestRows);
});


function populatePacienteFilter(rows) {
  if (!filtroPaciente) return;
  const set = new Set();
  rows.forEach(r => {
    if (r.filtro_atendente) set.add(r.filtro_atendente);
  });
  const values = Array.from(set).sort();
  filtroPaciente.innerHTML = '<option value="">Todos</option>' + values.map(v => `<option value="${v}">${v}</option>`).join('');
}

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

btnFiltrar.addEventListener('click', fetchRelatorios);

// carregar ao abrir
fetchRelatorios();