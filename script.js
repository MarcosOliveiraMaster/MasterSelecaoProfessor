
// CONFIGURAÇÃO - SUBSTITUA COM OS SEUS DADOS DO SUPABASE!
const SUPABASE_URL = 'https://jfdcddxcfkrhgiozfxmw.supabase.co'; // Cole sua Project URL aqui
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZGNkZHhjZmtyaGdpb3pmeG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTgxODgsImV4cCI6MjA3NDQ3NDE4OH0.BFnQDb6GdvbXvgQq3mB0Bt2u2551-QR4QT1RT6ZXfAE'; // Cole sua anon public key aqui

// Inicializa a conexão com o Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('meuFormulario');
    const mensagemResultado = document.getElementById('mensagemResultado');

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

        // Pega os valores de TODOS os campos
        const dadosFormulario = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            email: document.getElementById('email').value,
            disciplinas: document.getElementById('disciplinas').value,
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
            veiculo: document.getElementById('veiculo').value,
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

            // SUCESSO!
            mensagemResultado.textContent = "Cadastro enviado com sucesso!";
            mensagemResultado.className = 'sucesso';
            form.reset(); // Limpa o formulário

        } catch (error) {
            // ERRO!
            console.error('Erro ao enviar dados:', error);
            mensagemResultado.textContent = "Ops! Houve um erro ao enviar seu cadastro. Tente novamente.";
            mensagemResultado.className = 'erro';
        } finally {
            // Reativa o botão
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = 'Enviar Cadastro';
        }
    });

});