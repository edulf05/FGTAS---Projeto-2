
// utils/auth.js

// AJUSTE ESTA URL para onde a sua API Node.js/JS Puro está rodando

// ...existing code...
const loginButton = document.getElementById('Login');
const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

// Ajuste aqui para a rota real do backend que processa login.
// Ex.: 'http://localhost:3000/usuarios/login' ou 'http://localhost:3000/fgtas/usuarios/login'
const API_URL = 'http://localhost:3000/usuarios/login';
if (loginButton) {
    // evitar redirecionamento direto; delegar ao envio do formulário
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

    const emailEl = document.getElementById('email');
    const senhaEl = document.getElementById('senha');
    const email = emailEl ? emailEl.value : '';
    const senha = senhaEl ? senhaEl.value : '';
    
    const loginData = { email, senha };

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

            if (result.token) localStorage.setItem('auth_token', result.token);

            // Redirecionar para a página correta dentro do seu view (ajuste caminho se necessário)
            setTimeout(() => {
                window.location.href = '../Home/home.html';
            }, 800);
        } else {
            const errorMessage = result.message || 'Erro de autenticação.';
            messageElement.textContent = `Falha no login: ${errorMessage}`;
            messageElement.style.color = 'red';
        }

    } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        messageElement.textContent = 'Erro de conexão com o servidor da API.';
        messageElement.style.color = 'red';
    }
}
// ...existing code...