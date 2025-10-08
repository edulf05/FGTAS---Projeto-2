// Campo de Tipo de Atendimento
const tiposAtendimentoFixos = [
    "Carteira de Trabalho, SD, Vagas",
    "Programa Gaúcho do Artesanato",
    "Vida Centro Humanístico",
    "Orientações sobre empreendedorismo",
    "Orientações sobre cursos de qualificação",
    "Informações sobre mercado de trabalho",
    "Outra"
];

const formaAtendimentoEl = document.getElementById('forma-atendimento');
const perfilSectionEl = document.getElementById('perfil-section');
const perfilEl = document.getElementById('perfil');
const camposEmpregadorEl = document.getElementById('campos-empregador');
const tipoAtendimentoSectionEl = document.getElementById('tipo-atendimento-section');
const tipoAtendimentoEl = document.getElementById('tipo-atendimento');
const telefoneEl = document.getElementById('telefone');
const cnpjEl = document.getElementById('cnpj');

// Função para popular o campo de Tipo de Atendimento
function popularTipoAtendimento() {
    tipoAtendimentoEl.innerHTML = '<option value="">Selecione...</option>';
    tiposAtendimentoFixos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.replace(/\s+/g, '-').toLowerCase();
        option.textContent = tipo;
        tipoAtendimentoEl.appendChild(option);
    });
}

// Lógica para mostrar as seções de forma condicional
formaAtendimentoEl.addEventListener('change', () => {
    if (formaAtendimentoEl.value) {
        perfilSectionEl.classList.add('active');
    } else {
        perfilSectionEl.classList.remove('active');
        tipoAtendimentoSectionEl.classList.remove('active');
        camposEmpregadorEl.classList.remove('active');
    }
    perfilEl.value = "";
    tipoAtendimentoEl.innerHTML = '<option value="">Selecione...</option>';
});

perfilEl.addEventListener('change', () => {
    const perfilSelecionado = perfilEl.value;
    
    // Esconde todos os campos de perfil antes de mostrar o correto
    camposEmpregadorEl.classList.remove('active');

    // Mostra campos do perfil (Empregador)
    if (perfilSelecionado === 'empregador') {
        camposEmpregadorEl.classList.add('active');
    }

    // A seção de Tipo de Atendimento é sempre mostrada
    if (perfilSelecionado) {
        tipoAtendimentoSectionEl.classList.add('active');
        popularTipoAtendimento();
    } else {
        tipoAtendimentoSectionEl.classList.remove('active');
        tipoAtendimentoEl.innerHTML = '<option value="">Selecione...</option>';
    }
});

// Formatar o telefone automaticamente
telefoneEl.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    let formatado = '';

    if (valor.length > 0) {
        formatado = '(' + valor.substring(0, 2);
    }
    if (valor.length > 2) {
        formatado += ') ' + valor.substring(2, 7);
    }
    if (valor.length > 7) {
        formatado += '-' + valor.substring(7, 11);
    }
    e.target.value = formatado;
});

// Formatar o CNPJ automaticamente
cnpjEl.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    let formatado = '';

    if (valor.length > 0) {
        formatado = valor.substring(0, 2);
    }
    if (valor.length > 2) {
        formatado += '.' + valor.substring(2, 5);
    }
    if (valor.length > 5) {
        formatado += '.' + valor.substring(5, 8);
    }
    if (valor.length > 8) {
        formatado += '/' + valor.substring(8, 12);
    }
    if (valor.length > 12) {
        formatado += '-' + valor.substring(12, 14);
    }
    e.target.value = formatado;
});

// Validação do CNPJ no envio do formulário
document.getElementById('atendimento-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const perfilSelecionado = perfilEl.value;

    if (perfilSelecionado === 'empregador') {
        const cnpj = cnpjEl.value;
        if (!validarCNPJ(cnpj)) {
            alert("Por favor, insira um CNPJ válido.");
            return;
        }
    }

    alert('Formulário enviado com sucesso (simulação).');
    console.log({
        formaAtendimento: formaAtendimentoEl.value,
        perfil: perfilEl.value,
        tipoAtendimento: tipoAtendimentoEl.value,
        nomeEmpregador: document.getElementById('nome-empregador').value,
        cnpj: cnpjEl.value,
        telefone: telefoneEl.value,
    });
});

// Função de validação de CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g,'');
    if(cnpj == '') return false;
    if (cnpj.length != 14) return false;

    if (cnpj == "00000000000000" || 
        cnpj == "11111111111111" || 
        cnpj == "22222222222222" || 
        cnpj == "33333333333333" || 
        cnpj == "44444444444444" || 
        cnpj == "55555555555555" || 
        cnpj == "66666666666666" || 
        cnpj == "77777777777777" || 
        cnpj == "88888888888888" || 
        cnpj == "99999999999999")
        return false;
        
    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0,tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
         
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
           
    return true;
}