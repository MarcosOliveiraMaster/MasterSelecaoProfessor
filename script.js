// script.js -- substitua o arquivo existente por este
// Funções globais (usadas por atributos onclick no HTML)
function showSection(sectionNumber) {
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
    const el = document.getElementById(`section${sectionNumber}`);
    if (el) el.classList.add('active');

    document.querySelectorAll('.progress-step').forEach(step => step.classList.remove('active'));
    const progressStep = document.querySelector(`.progress-step:nth-child(${sectionNumber})`);
    if (progressStep) progressStep.classList.add('active');
}

function toggleGroup(headerElement) {
    const groupElement = headerElement.closest('.group');
    if (!groupElement) return;
    const itemsElement = groupElement.querySelector('.items');
    if (!itemsElement) return;

    const isHidden = itemsElement.classList.contains('hidden');
    itemsElement.classList.toggle('hidden', !isHidden);
    groupElement.classList.toggle('expanded', isHidden);
    groupElement.classList.toggle('collapsed', !isHidden);
}

document.addEventListener('DOMContentLoaded', function () {
    // Elementos principais
    const form = document.getElementById('meuFormulario');
    const nomeField = document.getElementById('nome');
    const cpfField = document.getElementById('cpf');
    const emailField = document.getElementById('email');
    const enderecoField = document.getElementById('endereco');
    const section2NextBtn = document.getElementById('section2-next');

    // Inicializa grupos colapsados
    document.querySelectorAll('.group').forEach(g => g.classList.add('collapsed'));

    // Formatação CPF (segura: só roda se existir o campo)
    if (cpfField) {
        cpfField.addEventListener('input', function (e) {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v;
        });
    }

    // Validação seção 2 (habilita/desabilita botão Avançar)
    function validateSection2() {
        if (!section2NextBtn || !nomeField || !cpfField || !emailField || !enderecoField) return;
        const nomeValid = nomeField.value.trim() !== '';
        const cpfValid = cpfField.value.replace(/\D/g, '').length === 11;
        const emailValid = emailField.value.trim() !== '' && emailField.checkValidity();
        const enderecoValid = enderecoField.value.trim() !== '';
        section2NextBtn.disabled = !(nomeValid && cpfValid && emailValid && enderecoValid);
    }
    if (nomeField) nomeField.addEventListener('input', validateSection2);
    if (cpfField) cpfField.addEventListener('input', validateSection2);
    if (emailField) emailField.addEventListener('input', validateSection2);
    if (enderecoField) enderecoField.addEventListener('input', validateSection2);
    validateSection2();

    // Dropdown de disciplinas (seguro contra null)
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdownContent = document.getElementById('dropdownContent');
    const disciplinasCheckboxes = dropdownContent ? dropdownContent.querySelectorAll('input[name="disciplinas"]') : [];

    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!dropdownContent) return;
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });
    }

    disciplinasCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const selecionadas = Array.from(disciplinasCheckboxes).filter(i => i.checked).map(i => i.value);
            if (dropdownBtn) dropdownBtn.textContent = selecionadas.length ? selecionadas.join(', ') : 'Selecione as disciplinas que você pode lecionar';
        });
    });

    document.addEventListener('click', (ev) => {
        if (!ev.target.closest('.dropdown') && dropdownContent) dropdownContent.style.display = 'none';
    });

    // Toggles de experiência e caixas associadas
    const expAulasToggle = document.getElementById('expAulasToggle');
    const expAulasBox = document.getElementById('expAulasBox');
    const expNeuroToggle = document.getElementById('expNeuroToggle');
    const expNeuroBox = document.getElementById('expNeuroBox');
    const expTdicsToggle = document.getElementById('expTdicsToggle');
    const expTdicsBox = document.getElementById('expTdicsBox');

    if (expAulasToggle && expAulasBox) expAulasToggle.addEventListener('change', () => expAulasBox.classList.toggle('hidden', !expAulasToggle.checked));
    if (expNeuroToggle && expNeuroBox) expNeuroToggle.addEventListener('change', () => expNeuroBox.classList.toggle('hidden', !expNeuroToggle.checked));
    if (expTdicsToggle && expTdicsBox) expTdicsToggle.addEventListener('change', () => expTdicsBox.classList.toggle('hidden', !expTdicsToggle.checked));

    // --- CAPTURA e LOG: clique em Avançar da section2 ---
    if (section2NextBtn) {
        section2NextBtn.addEventListener('click', function (e) {
            // botão pode estar desabilitado; se estiver, não prossegue
            if (section2NextBtn.disabled) return;
            const nome = nomeField ? nomeField.value.trim() : '';
            const cpf = cpfField ? cpfField.value.trim() : '';
            const email = emailField ? emailField.value.trim() : '';
            const endereco = enderecoField ? enderecoField.value.trim() : '';

            console.log('--- Dados Section 2 (ao avançar) ---');
            console.log('Nome:', nome);
            console.log('CPF:', cpf);
            console.log('Email:', email);
            console.log('Endereço:', endereco);

            // garante navegação (se HTML já chamar showSection, isto é redundante mas inofensivo)
            showSection(3);
        });
    }

    // --- BOTÕES da section3 (Voltar e Avançar) ---
    const btnVoltarSection3 = document.querySelector('#section3 .btn-prev');
    const btnAvancarSection3 = document.querySelector('#section3 .btn-next');

    if (btnVoltarSection3) {
        btnVoltarSection3.addEventListener('click', function (e) {
            e.preventDefault();
            if (nomeField) nomeField.value = '';
            if (cpfField) cpfField.value = '';
            if (emailField) emailField.value = '';
            if (enderecoField) enderecoField.value = '';
            console.log('⚠️ Valores resetados: nome, cpf, email, endereco');
            showSection(2);
        });
    }

    if (btnAvancarSection3) {
        btnAvancarSection3.addEventListener('click', function (e) {
            e.preventDefault();

            // Campos principais
            const nome = nomeField ? nomeField.value.trim() : '';
            const cpf = cpfField ? cpfField.value.trim() : '';
            const email = emailField ? emailField.value.trim() : '';
            const endereco = enderecoField ? enderecoField.value.trim() : '';

            // Disponibilidade dias/turnos
            const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
            const disponibilidade = {};
            const linhas = document.querySelectorAll('#section3 .schedule-table tbody tr');

            linhas.forEach((tr, i) => {
                const checks = tr.querySelectorAll('input[type="checkbox"]');
                const manha = checks && checks[0] ? !!checks[0].checked : false;
                const tarde = checks && checks[1] ? !!checks[1].checked : false;
                const diaKey = dias[i] || `dia${i}`;
                disponibilidade[`${diaKey}Manha`] = manha;
                disponibilidade[`${diaKey}Tarde`] = tarde;
            });

            // Expõe as variáveis nomeadas (compatíveis com o banco)
            const segManha = disponibilidade.segManha || false;
            const segTarde = disponibilidade.segTarde || false;
            const terManha = disponibilidade.terManha || false;
            const terTarde = disponibilidade.terTarde || false;
            const quaManha = disponibilidade.quaManha || false;
            const quaTarde = disponibilidade.quaTarde || false;
            const quiManha = disponibilidade.quiManha || false;
            const quiTarde = disponibilidade.quiTarde || false;
            const sexManha = disponibilidade.sexManha || false;
            const sexTarde = disponibilidade.sexTarde || false;
            const sabManha = disponibilidade.sabManha || false;
            const sabTarde = disponibilidade.sabTarde || false;

            // Bairros (descrições concatenadas)
            const bairrosSelecionados = [];
            document.querySelectorAll("input[name='bairros']:checked").forEach(cb => {
                const itemRow = cb.closest('.item-row');
                if (!itemRow) return;
                const descEl = itemRow.querySelector('.desc');
                if (descEl) {
                    const txt = descEl.textContent.trim();
                    if (txt) bairrosSelecionados.push(txt);
                }
            });
            const bairros = bairrosSelecionados.join('. ');

            // --- LOG ---
            console.log('--- Dados Section 2 (re-uso) ---');
            console.log('Nome:', nome);
            console.log('CPF:', cpf);
            console.log('Email:', email);
            console.log('Endereço:', endereco);

            console.log('--- Disponibilidade ---');
            console.log('segManha:', segManha, 'segTarde:', segTarde);
            console.log('terManha:', terManha, 'terTarde:', terTarde);
            console.log('quaManha:', quaManha, 'quaTarde:', quaTarde);
            console.log('quiManha:', quiManha, 'quiTarde:', quiTarde);
            console.log('sexManha:', sexManha, 'sexTarde:', sexTarde);
            console.log('sabManha:', sabManha, 'sabTarde:', sabTarde);

            console.log('Bairros:', bairros);

            showSection(4);
        });
    }

    // --- SUBMIT final (section4 -> section5) ---
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Disciplinas como string: "Matemática, Português"
            const disciplinasChecked = Array.from(document.querySelectorAll('input[name="disciplinas"]:checked')).map(c => c.value);
            const disciplinas = disciplinasChecked.join(', ');

            // Nivel
            const nivelEl = document.querySelector('input[name="nivel"]:checked');
            const nivel = nivelEl ? nivelEl.value : '';

            // Curso
            const curso = (document.getElementById('curso') ? document.getElementById('curso').value.trim() : '');

            // Toggles ('sim' / 'não') + textos
            const expAulasValor = (document.getElementById('expAulasToggle') && document.getElementById('expAulasToggle').checked) ? 'sim' : 'não';
            const expAulasTexto = (expAulasValor === 'sim' && document.getElementById('expAulasText')) ? document.getElementById('expAulasText').value.trim() : '';

            const expNeuroValor = (document.getElementById('expNeuroToggle') && document.getElementById('expNeuroToggle').checked) ? 'sim' : 'não';
            const expNeuroTexto = (expNeuroValor === 'sim' && document.getElementById('expNeuroText')) ? document.getElementById('expNeuroText').value.trim() : '';

            const expTdicsValor = (document.getElementById('expTdicsToggle') && document.getElementById('expTdicsToggle').checked) ? 'sim' : 'não';
            const expTdicsTexto = (expTdicsValor === 'sim' && document.getElementById('expTdicsText')) ? document.getElementById('expTdicsText').value.trim() : '';

            // --- LOG para conferência antes do envio real ---
            console.log('--- Envio Final (Section 4) ---');
            console.log('Disciplinas:', disciplinas);
            console.log('Nível acadêmico:', nivel);
            console.log('Curso:', curso);

            console.log('expAulas:', expAulasValor, expAulasTexto ? '→ ' + expAulasTexto : '');
            console.log('expNeuro:', expNeuroValor, expNeuroTexto ? '→ ' + expNeuroTexto : '');
            console.log('expTdics:', expTdicsValor, expTdicsTexto ? '→ ' + expTdicsTexto : '');

            // segue para seção de sucesso
            showSection(5);
        });
    }
});
