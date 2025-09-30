// alert("✅ Conexão estabelecida entre a página e o script.js!");

// Função para alternar entre seções
function showSection(sectionNumber) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section${sectionNumber}`).classList.add('active');

    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`.progress-step:nth-child(${sectionNumber})`).classList.add('active');
}

// Animação para seleção de bairros:
function toggleGroup(headerElement) {
    const groupElement = headerElement.closest('.group');
    const itemsElement = groupElement.querySelector('.items');
    const toggleButton = groupElement.querySelector('.toggle-btn');

    if (itemsElement.classList.contains('hidden')) {
        // Expandir
        itemsElement.classList.remove('hidden');
        groupElement.classList.remove('collapsed');
        groupElement.classList.add('expanded');
    } else {
        // Recolher
        itemsElement.classList.add('hidden');
        groupElement.classList.remove('expanded');
        groupElement.classList.add('collapsed');
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('meuFormulario');
    const nomeField = document.getElementById('nome');
    const cpfField = document.getElementById('cpf');
    const emailField = document.getElementById('email');
    const enderecoField = document.getElementById('endereco');
    const section2NextBtn = document.getElementById('section2-next');

    // Inicializa todos os grupos de bairros como colapsados
    document.querySelectorAll('.group').forEach(group => {
        group.classList.add('collapsed');
    });

    // Formatação do CPF
    cpfField.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });

    // Validação da Seção 2 (inclui endereço)
    function validateSection2() {
        const nomeValid = nomeField.value.trim() !== '';
        const cpfValid = cpfField.value.replace(/\D/g, '').length === 11;
        const emailValid = emailField.value.trim() !== '' && emailField.checkValidity();
        const enderecoValid = enderecoField.value.trim() !== '';
        section2NextBtn.disabled = !(nomeValid && cpfValid && emailValid && enderecoValid);
    }

    nomeField.addEventListener('input', validateSection2);
    cpfField.addEventListener('input', validateSection2);
    emailField.addEventListener('input', validateSection2);
    enderecoField.addEventListener('input', validateSection2);
    validateSection2();

    // Dropdown de disciplinas
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownContent = document.getElementById("dropdownContent");
    const checkboxes = dropdownContent.querySelectorAll('input[name="disciplinas"]');

    dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
    });

    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const selecionadas = Array.from(checkboxes)
                .filter(i => i.checked)
                .map(i => i.value);
            dropdownBtn.textContent = selecionadas.length > 0 ? selecionadas.join(", ") : "Selecione as disciplinas que você pode lecionar";
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".dropdown")) {
            dropdownContent.style.display = "none";
        }
    });

    // Switches de experiência (Corrigido para usar os IDs corretos do HTML)
    const expAulasToggle = document.getElementById('expAulasToggle');
    const expAulasBox = document.getElementById('expAulasBox');
    const expNeuroToggle = document.getElementById('expNeuroToggle');
    const expNeuroBox = document.getElementById('expNeuroBox');
    const expTdicsToggle = document.getElementById('expTdicsToggle');
    const expTdicsBox = document.getElementById('expTdicsBox');

    // Ativação dos campos de texto da seção 4
    if(expAulasToggle) {
        expAulasToggle.addEventListener('change', () => {
            expAulasBox.classList.toggle('hidden', !expAulasToggle.checked);
        });
    }

    if(expNeuroToggle) {
        expNeuroToggle.addEventListener('change', () => {
            expNeuroBox.classList.toggle('hidden', !expNeuroToggle.checked);
        });
    }
    
    if(expTdicsToggle) {
        expTdicsToggle.addEventListener('change', () => {
            expTdicsBox.classList.toggle('hidden', !expTdicsToggle.checked);
        });
    }

    // Ação de envio do formulário (apenas simulação)
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        showSection(5); // Mostra tela de sucesso
    });
});