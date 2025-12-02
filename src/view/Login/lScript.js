const loginButton = document.getElementById('Login');
const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

// Ajuste para sua rota (routes usam '/usuario/login')
const API_URL = 'http://localhost:3000/usuario/login';

const loginEl = document.getElementById('login');
const senhaEl = document.getElementById('senha');
// checkbox (mantém compatibilidade se foi criado com id "remember")
const rememberCheckbox = document.getElementById('remember') || document.querySelector('.remember-forgot input[type="checkbox"]');


if (loginButton) {
    loginButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (loginForm) loginForm.requestSubmit();
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        handleLogin();
    });
}

// preencher campo login a partir do remember armazenado
document.addEventListener('DOMContentLoaded', () => {
    try {
        const saved = localStorage.getItem('remember_login');
        if (saved && loginEl) {
            loginEl.value = saved;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    } catch (e) {
        console.warn('Erro ao ler remember_login:', e);
    }
});

// atualiza armazenamento quando usuário altera checkbox
if (rememberCheckbox) {
    rememberCheckbox.addEventListener('change', () => {
        try {
            if (rememberCheckbox.checked && loginEl && loginEl.value.trim()) {
                localStorage.setItem('remember_login', loginEl.value.trim());
            } else {
                localStorage.removeItem('remember_login');
            }
        } catch (e) {
            console.warn('Erro ao atualizar remember_login:', e);
        }
    });
}

// sempre que o campo login mudar e checkbox estiver marcada, atualiza o valor salvo
if (loginEl) {
    loginEl.addEventListener('input', () => {
        try {
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('remember_login', loginEl.value.trim());
            }
        } catch (e) { /* silent */ }
    });
}

async function handleLogin() {
    if (!messageElement) return;
    messageElement.textContent = 'Verificando credenciais...';
    messageElement.style.color = 'blue';

    const login = loginEl ? loginEl.value.trim() : '';
    const senha = senhaEl ? senhaEl.value : '';
    
    if (!login || !senha) {
        messageElement.textContent = 'Preencha usuário/email e senha.';
        messageElement.style.color = 'red';
        return;
    }

    const loginData = { login, senha };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = result.message || 'Login bem-sucedido!';
            messageElement.style.color = 'green';

            // opcional: salvar usuário no localStorage
            if (result.usuario) localStorage.setItem('usuario', JSON.stringify(result.usuario));

            // salvar/remover usuário lembrado conforme checkbox
            try {
                if (rememberCheckbox && rememberCheckbox.checked) {
                    localStorage.setItem('remember_login', login);
                } else {
                    localStorage.removeItem('remember_login');
                }
            } catch (e) { /* silent */ }

            setTimeout(() => {
                window.location.href = '../Home/home.html';
            }, 600);
        } else {
            const errorMessage = result.message || 'Credenciais inválidas.';
            messageElement.textContent = errorMessage;
            messageElement.style.color = 'red';
        }

    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        messageElement.textContent = 'Erro de conexão com o servidor da API.';
        messageElement.style.color = 'red';
    }
}