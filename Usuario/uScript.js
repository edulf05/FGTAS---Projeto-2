// --- DADOS MOCKADOS DE EXEMPLO ---
let usuarios = [
    { id: 1, nome: "Ana Silva", email: "adm@fgtas.com", perfil: "Administrador", status: "Ativo" },
    { id: 2, nome: "Carlos Souza", email: "teste@fgtas.com", perfil: "Atendente", status: "Ativo" },
];

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
const perfil = document.getElementById("perfil");
const status = document.getElementById("status");

// --- FUNÇÃO PARA ATUALIZAR TABELA ---
function carregarUsuarios() {
    listaUsuarios.innerHTML = "";

    usuarios.forEach(u => {
        listaUsuarios.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.perfil}</td>
                <td>${u.status}</td>
                <td class="center">
                    <button class="btn btn-primary btn-small" onclick="editarUsuario(${u.id})">Editar</button>
                    <button class="btn btn-danger btn-small" onclick="removerUsuario(${u.id})">Remover</button>
                </td>
            </tr>
        `;
    });
}

// --- ABRIR MODAL PARA NOVO USUÁRIO ---
btnNovo.addEventListener("click", () => {
    modal.style.display = "flex";
    modalTitulo.textContent = "Novo Usuário";
    form.reset();
    userId.value = "";
});

// --- FECHAR MODAL ---
closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// --- SALVAR USUÁRIO ---
form.addEventListener("submit", function(e) {
    e.preventDefault();

    if (userId.value) {
        // MODO EDIÇÃO
        const id = parseInt(userId.value);
        const usuario = usuarios.find(u => u.id === id);

        usuario.nome = nome.value;
        usuario.email = email.value;
        usuario.perfil = perfil.value;
        usuario.status = status.value;
    } else {
        // MODO NOVO
        const novo = {
            id: usuarios.length ? usuarios[usuarios.length - 1].id + 1 : 1,
            nome: nome.value,
            email: email.value,
            perfil: perfil.value,
            status: status.value
        };
        usuarios.push(novo);
    }

    modal.style.display = "none";
    carregarUsuarios();
});

// --- EDITAR ---
function editarUsuario(id) {
    const u = usuarios.find(x => x.id === id);

    userId.value = u.id;
    nome.value = u.nome;
    email.value = u.email;
    perfil.value = u.perfil;
    status.value = u.status;

    modalTitulo.textContent = "Editar Usuário";
    modal.style.display = "flex";
}

// --- REMOVER ---
function removerUsuario(id) {
    if (confirm("Deseja realmente remover este usuário?")) {
        usuarios = usuarios.filter(u => u.id !== id);
        carregarUsuarios();
    }
}

// CARREGAR TABELA AO INICIAR
carregarUsuarios();
