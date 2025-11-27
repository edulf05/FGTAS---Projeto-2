const API = 'http://localhost:3000/usuario';

// ELEMENTOS
const listaUsuarios = document.getElementById("listaUsuarios");
const modal = document.getElementById("modal");
const form = document.getElementById("formUsuario");
const btnNovo = document.getElementById("btnNovo");
const modalTitulo = document.getElementById("modalTitulo");
const closeModal = document.getElementById("closeModal");

// CAMPOS DO FORM
const userId = document.getElementById("userId");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const adm = document.getElementById("adm");
const ativo = document.getElementById("ativo");

// obtém usuário logado do localStorage
function getLoggedUser() {
    const u = localStorage.getItem('usuario');
    if (!u) return null;
    try { return JSON.parse(u); } catch(e) { return null; }
}

function adminHeader() {
    const u = getLoggedUser();
    return u && u.adm_usuario ? { 'x-admin-id': String(u.id_usuario) } : {};
}

async function carregarUsuarios() {
    try {
        const headers = { ...adminHeader() };
        const res = await fetch(API, { headers });
        if (!res.ok) {
            const text = await res.text();
            console.error('Erro ao obter /usuario:', res.status, text);
            alert('Erro ao obter usuários. Verifique o console do servidor.');
            return;
        }
        const usuarios = await res.json();
        listaUsuarios.innerHTML = "";
        usuarios.forEach(u => {
            listaUsuarios.innerHTML += `
                <tr>
                    <td>${u.id_usuario}</td>
                    <td>${u.nome_usuario}</td>
                    <td>${u.email_usuario}</td>
                    <td>${u.data_usuario ? new Date(u.data_usuario).toLocaleString() : ''}</td>
                    <td>${u.editado_usuario ? new Date(u.editado_usuario).toLocaleString() : ''}</td>
                    <td>${u.adm_usuario ? 'Sim' : 'Não'}</td>
                    <td>${u.ativo ? 'Sim' : 'Não'}</td>
                    <td class="center">
                        <button class="btn btn-primary btn-small" onclick="editarUsuario(${u.id_usuario})">Editar</button>
                        <button class="btn btn-danger btn-small" onclick="removerUsuario(${u.id_usuario})">Remover</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Erro carregarUsuarios:', err);
        alert('Erro ao carregar usuários. Veja console para mais detalhes.');
    }
}

// abrir modal novo
btnNovo.addEventListener("click", () => {
    const logged = getLoggedUser();
    if (!logged || !logged.adm_usuario) { alert('Apenas administradores podem criar usuários.'); return; }
    modal.style.display = "flex";
    modalTitulo.textContent = "Novo Usuário";
    form.reset();
    userId.value = "";
    senha.placeholder = "Informe a senha";
    adm.checked = false;
    ativo.checked = true;
});

// fechar modal
closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// salvar usuário (criar/editar)
form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const logged = getLoggedUser();
    if (!logged || !logged.adm_usuario) { alert('Apenas administradores podem salvar usuários.'); return; }

    const payload = {
        nome_usuario: nome.value,
        email_usuario: email.value,
        adm_usuario: adm.checked ? 1 : 0,
        ativo: ativo.checked ? 1 : 0
    };
    if (senha.value) payload.senha_usuario = senha.value; // se em branco, não altera

    const headers = { 'Content-Type': 'application/json', ...adminHeader() };

    try {
        if (userId.value) {
            // edição
            const res = await fetch(`${API}/${userId.value}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || 'Erro ao editar usuário');
            }
            alert('Usuário atualizado.');
        } else {
            // criação
            const res = await fetch(API, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || 'Erro ao criar usuário');
            }
            alert('Usuário criado.');
        }
        modal.style.display = "none";
        carregarUsuarios();
    } catch (err) {
        console.error(err);
        alert('Erro ao salvar usuário.');
    }
});

// editar
window.editarUsuario = async function(id) {
    const logged = getLoggedUser();
    if (!logged || !logged.adm_usuario) { alert('Apenas administradores podem editar usuários.'); return; }
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error('Erro ao obter usuário');
        const u = await res.json();
        userId.value = u.id_usuario;
        nome.value = u.nome_usuario || '';
        email.value = u.email_usuario || '';
        adm.checked = u.adm_usuario ? true : false;
        ativo.checked = u.ativo ? true : false;
        senha.value = '';
        modalTitulo.textContent = "Editar Usuário";
        modal.style.display = "flex";
    } catch (err) {
        console.error(err);
        alert('Erro ao carregar usuário.');
    }
};

// remover
window.removerUsuario = async function(id) {
    const logged = getLoggedUser();
    if (!logged || !logged.adm_usuario) { alert('Apenas administradores podem remover usuários.'); return; }
    if (!confirm('Deseja realmente remover este usuário?')) return;
    try {
        const res = await fetch(`${API}/${id}`, {
            method: 'DELETE',
            headers: { ...adminHeader() }
        });
        if (!res.ok) {
            const t = await res.text();
            throw new Error(t || 'Erro ao remover usuário');
        }
        carregarUsuarios();
    } catch (err) {
        console.error(err);
        alert('Erro ao remover usuário.');
    }
};

carregarUsuarios();