const SUPABASE_URL = 'https://jfdcddxcfkrhgiozfxmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZGNkZHhjZmtyaGdpb3pmeG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTgxODgsImV4cCI6MjA3NDQ3NDE4OH0.BFnQDb6GdvbXvgQq3mB0Bt2u2551-QR4QT1RT6ZXfAE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('meuFormulario');
    
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

    document.addEventListener("click", function(event) {
        if (!event.target.closest(".dropdown")) {
            dropdownContent.style.display = "none";
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const botaoSubmit = form.querySelector('button[type="submit"]');
        botaoSubmit.disabled = true;
        botaoSubmit.textContent = 'Enviando...';

        const getCheckboxValue = (id) => {
            const checkbox = document.getElementById(id);
            return checkbox ? checkbox.checked : false;
        };

        const disciplinasSelecionadas = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value)
            .join(', ');

        const dadosFormulario = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            email: document.getElementById('email').value,
            disciplinas: disciplinasSelecionadas,
            segManha: getCheckboxValue('segManha'),
            segTarde: getCheckboxValue('segTarde'),
            terManha: getCheckboxValue('terManha'),
            terTarde: getCheckboxValue('terTarde'),
            quaManha: getCheckboxValue('quaManha'),
            quaTarde: getCheckboxValue('quaTarde'),
            quiManha: getCheckboxValue('quiManha'),
            quiTarde: getCheckboxValue('quiTarde'),
            sexManha: getCheckboxValue('sexManha'),
            sexTarde: getCheckboxValue('sexTarde'),
            sabManha: getCheckboxValue('sabManha'),
            sabTarde: getCheckboxValue('sabTarde'),
            veiculo: document.getElementById('veiculo').checked ? 'Sim' : 'Não',
            expAulas: document.getElementById('expAulas').value,
            expNeuro: document.getElementById('expNeuro').value,
            descricao: document.getElementById('descricao').value,
        };

        try {
            const { data, error } = await supabaseClient
                .from('candidatoSelecao')
                .insert([dadosFormulario]);

            if (error) {
                throw error;
            }

            showSection(5);

        } catch (error) {
            // console.error('Erro ao enviar dados:', error);
            // alert("Ops! Houve um erro ao enviar seu cadastro. Tente novamente.");
            
            // botaoSubmit.disabled = false;
            // botaoSubmit.textContent = 'Enviar Cadastro';
        }
    });
});