// CONFIGURAÇÃO - SUBSTITUA COM OS SEUS DADOS DO SUPABASE!
const SUPABASE_URL = 'https://jfdcddxcfkrhgiozfxmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZGNkZHhjZmtyaGdpb3pmeG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTgxODgsImV4cCI6MjA3NDQ3NDE4OH0.BFnQDb6GdvbXvgQq3mB0Bt2u2551-QR4QT1RT6ZXfAE';

// Inicializa a conexão com o Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('meuFormulario');
    
    // Configuração do dropdown de disciplinas
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownContent = document.getElementById("dropdownContent");
    const checkboxes = dropdownContent.querySelectorAll("input[type='checkbox']");

    dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
    });

    // Atualiza o texto do botão com as opções selecionadas
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const selecionadas = Array.from(checkboxes)
                                    .filter(i => i.checked)
                                    .map(i => i.value);
            dropdownBtn.textContent = selecionadas.length > 0 ? selecionadas.join(", ") : "Selecione as disciplinas que você pode lecionar";
        });
    });

    // Fecha dropdown se clicar fora
    document.addEventListener("click", function(event) {
        if (!event.target.closest(".dropdown")) {
            dropdownContent.style.display = "none";
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Botão fica desativado e muda de texto para evitar duplo clique
        const botaoSubmit = form.querySelector('button[type="submit"]');
        botaoSubmit.disabled = true;
        botaoSubmit.textContent = 'Enviando...';

        // Função auxiliar para verificar se um checkbox está marcado
        const getCheckboxValue = (name) => {
            const checkbox = form.querySelector(`input[name="${name}"]`);
            return checkbox ? checkbox.checked : false;
        };

        // Captura as disciplinas selecionadas
        const disciplinasSelecionadas = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value)
            .join(', ');

        // Pega os valores de TODOS os campos
        const dadosFormulario = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            email: document.getElementById('email').value,
            disciplinas: disciplinasSelecionadas,
            // Campos booleanos (checkboxes)
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
            // Campos de texto e textarea
            veiculo: document.getElementById('veiculo').checked ? 'Sim' : 'Não',
            expAulas: document.getElementById('expAulas').value,
            expNeuro: document.getElementById('expNeuro').value,
            descricao: document.getElementById('descricao').value,
            // Status é preenchido automaticamente pelo Supabase (default 'Pendente')
        };

        try {
            const { data, error } = await supabaseClient
                .from('candidatoSelecao') // Nome da sua tabela
                .insert([dadosFormulario]);

            if (error) {
                throw error;
            }

            // SUCESSO! Redireciona para a seção de sucesso
            showSection(4);

        } catch (error) {
            // ERRO!
            console.error('Erro ao enviar dados:', error);
            alert("Ops! Houve um erro ao enviar seu cadastro. Tente novamente.");
            
            // Reativa o botão em caso de erro
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = 'Enviar Cadastro';
        }
    });
});