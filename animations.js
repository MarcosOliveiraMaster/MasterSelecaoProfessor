// Navegação entre seções
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



// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('meuFormulario');
    const nomeField = document.getElementById('nome');
    const cpfField = document.getElementById('cpf');
    const emailField = document.getElementById('email');
    const enderecoField = document.getElementById('endereco');
    const section2NextBtn = document.getElementById('section2-next');

    // Formatação do CPF
    cpfField.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });

    // Validação da Seção 2
    function validateSection2() {
        const nomeValid = nomeField.value.trim() !== '';
        const cpfValid = cpfField.value.replace(/\D/g, '').length === 11;
        const emailValid = emailField.value.trim() !== '' && emailField.checkValidity();
        const enderecoValid = enderecoField.value.trim() !== '';
        section2NextBtn.disabled = !(nomeValid && cpfValid && emailValid && enderecoValid);
    }

    [nomeField, cpfField, emailField, enderecoField].forEach(field => {
        field.addEventListener('input', validateSection2);
    });
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
            dropdownBtn.textContent = selecionadas.length > 0 
                ? selecionadas.join(", ") 
                : "Selecione as disciplinas que você pode lecionar";
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".dropdown")) {
            dropdownContent.style.display = "none";
        }
    });

    
});