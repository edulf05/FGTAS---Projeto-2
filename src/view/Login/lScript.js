const loginButton = document.getElementById('Login');
const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

// Ajuste para sua rota (routes usam '/usuario/login')
const API_URL = 'http://localhost:3000/usuario/login';

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

async function handleLogin() {
    if (!messageElement) return;
    messageElement.textContent = 'Verificando credenciais...';
    messageElement.style.color = 'blue';

    const loginEl = document.getElementById('login');
    const senhaEl = document.getElementById('senha');
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
