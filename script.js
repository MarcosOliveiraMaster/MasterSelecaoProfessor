// config.js - Configurações do Supabase
const SUPABASE_CONFIG = {
    URL: 'https://jfdcddxcfkrhgiozfxmw.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZGNkZHhjZmtyaGdpb3pmeG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTgxODgsImV4cCI6MjA3NDQ3NDE4OH0.BFnQDb6GdvbXvgQq3mB0Bt2u2551-QR4QT1RT6ZXfAE'
};

// app.js - Aplicação principal
class FormularioApp {
    constructor() {
        this.supabase = null;
        this.currentSection = 1;
        this.formData = {
            nome: '',
            cpf: '',
            email: '',
            endereco: '',
            disciplinas: [],
            nivel: '',
            curso: '',
            expAulas: 'não',
            descricaoExpAulas: '',
            expNeuro: 'não',
            descricaoExpNeuro: '',
            expTdics: 'não',
            descricaoTdics: '',
            disponibilidade: {
                segManha: false, segTarde: false,
                terManha: false, terTarde: false,
                quaManha: false, quaTarde: false,
                quiManha: false, quiTarde: false,
                sexManha: false, sexTarde: false,
                sabManha: false, sabTarde: false
            },
            bairros: []
        };
        
        this.init();
    }

    async init() {
        await this.initializeSupabase();
        this.setupEventListeners();
        this.initializeUI();
        console.log('✅ Aplicação inicializada');
    }

    // ========== SUPABASE ==========
    async initializeSupabase() {
        try {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                this.supabase = supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
                console.log('✅ Supabase inicializado');
            } else {
                console.warn('Supabase não encontrado, carregando dinamicamente...');
                await this.loadSupabaseScript();
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
        }
    }

    loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                this.supabase = supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                this.supabase = supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async testSupabaseConnection() {
        if (!this.supabase) {
            console.error('Supabase não inicializado');
            return false;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('candidatoSelecao')
                .select('count')
                .limit(1);
                
            if (error) throw error;
            console.log('✅ Conexão com Supabase: OK');
            return true;
        } catch (error) {
            console.error('❌ Erro na conexão com Supabase:', error);
            return false;
        }
    }

    // ========== UI FUNCTIONS ==========
    showSection(sectionNumber) {
        document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.progress-step').forEach(step => step.classList.remove('active'));
        
        const sectionEl = document.getElementById(`section${sectionNumber}`);
        if (sectionEl) sectionEl.classList.add('active');
        
        const progressStep = document.querySelector(`.progress-step:nth-child(${sectionNumber})`);
        if (progressStep) progressStep.classList.add('active');
        
        this.currentSection = sectionNumber;
        console.log(`📄 Navegou para seção ${sectionNumber}`);
    }

    toggleGroup(headerElement) {
        const groupEl = headerElement.closest('.group');
        if (!groupEl) return;
        
        const items = groupEl.querySelector('.items');
        if (!items) return;
        
        const isHidden = items.classList.contains('hidden');
        items.classList.toggle('hidden', !isHidden);
        groupEl.classList.toggle('expanded', isHidden);
        groupEl.classList.toggle('collapsed', !isHidden);
    }

    initializeUI() {
        document.querySelectorAll('.group').forEach(g => g.classList.add('collapsed'));
        this.validateSection2();
    }

    // ========== FIELD VALIDATIONS ==========
    setupMaskCPF() {
        const cpfField = document.getElementById('cpf');
        if (!cpfField) return;

        cpfField.addEventListener('input', e => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = value;
            this.validateSection2();
        });
    }

    validateSection2() {
        const section2NextBtn = document.getElementById('section2-next');
        if (!section2NextBtn) return;

        const nomeField = document.getElementById('nome');
        const cpfField = document.getElementById('cpf');
        const emailField = document.getElementById('email');
        const enderecoField = document.getElementById('endereco');

        const nomeValid = nomeField && nomeField.value.trim() !== '';
        const cpfValid = cpfField && cpfField.value.replace(/\D/g, '').length === 11;
        const emailValid = emailField && emailField.value.trim() !== '' && emailField.checkValidity();
        const enderecoValid = enderecoField && enderecoField.value.trim() !== '';

        section2NextBtn.disabled = !(nomeValid && cpfValid && emailValid && enderecoValid);
    }

    // ========== DROPDOWN DISCIPLINAS ==========
    setupDropdownDisciplinas() {
        const dropdownWrapper = document.querySelector('.dropdown');
        const dropdownBtn = document.getElementById('dropdownBtn');
        const dropdownContent = document.getElementById('dropdownContent');

        if (!dropdownBtn || !dropdownWrapper || !dropdownContent) return;

        this.updateDropdownText();

        dropdownBtn.addEventListener('click', e => {
            e.stopPropagation();
            dropdownWrapper.classList.toggle('open');
            dropdownContent.style.display = dropdownWrapper.classList.contains('open') ? 'block' : 'none';
        });

        dropdownContent.addEventListener('click', e => e.stopPropagation());

        const discCheckboxes = dropdownContent.querySelectorAll('input[name="disciplinas"]');
        discCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.updateDisciplinasData();
                this.updateDropdownText();
            });
        });

        document.addEventListener('click', () => {
            dropdownWrapper.classList.remove('open');
            dropdownContent.style.display = 'none';
        });
    }

    updateDropdownText() {
        const dropdownBtn = document.getElementById('dropdownBtn');
        const dropdownContent = document.getElementById('dropdownContent');
        
        if (!dropdownBtn || !dropdownContent) return;

        const checkboxes = dropdownContent.querySelectorAll('input[name="disciplinas"]');
        const selecionadas = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
        
        dropdownBtn.textContent = selecionadas.length 
            ? selecionadas.join(', ') 
            : 'Selecione as disciplinas que você pode lecionar';
    }

    updateDisciplinasData() {
        const checkboxes = document.querySelectorAll('input[name="disciplinas"]:checked');
        this.formData.disciplinas = Array.from(checkboxes).map(cb => cb.value);
    }

    // ========== EXPERIÊNCIAS TOGGLES ==========
    setupExperienceToggles() {
        this.setupToggle('expAulasToggle', 'expAulasBox', 'expAulas', 'descricaoExpAulas');
        this.setupToggle('expNeuroToggle', 'expNeuroBox', 'expNeuro', 'descricaoExpNeuro');
        this.setupToggle('expTdicsToggle', 'expTdicsBox', 'expTdics', 'descricaoTdics');
    }

    setupToggle(toggleId, boxId, dataKey, descKey) {
        const toggle = document.getElementById(toggleId);
        const box = document.getElementById(boxId);
        
        if (!toggle || !box) return;

        toggle.addEventListener('change', () => {
            const isChecked = toggle.checked;
            box.classList.toggle('hidden', !isChecked);
            
            this.formData[dataKey] = isChecked ? 'sim' : 'não';
            
            if (!isChecked) {
                const textarea = box.querySelector('textarea');
                if (textarea) textarea.value = '';
                this.formData[descKey] = '';
            }
        });

        const textarea = box.querySelector('textarea');
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                this.formData[descKey] = e.target.value.trim();
            });
        }
    }

    // ========== SECTION 2 ==========
    setupSection2() {
        const section2NextBtn = document.getElementById('section2-next');
        if (!section2NextBtn) return;

        section2NextBtn.addEventListener('click', () => {
            if (section2NextBtn.disabled) return;

            this.saveSection2Data();
            
            console.log('=== 📋 DADOS SEÇÃO 2 ===');
            console.log('Nome:', this.formData.nome);
            console.log('CPF:', this.formData.cpf);
            console.log('Email:', this.formData.email);
            console.log('Endereço:', this.formData.endereco);
            console.log('=======================');

            this.showSection(3);
        });
    }

    saveSection2Data() {
        const nomeField = document.getElementById('nome');
        const cpfField = document.getElementById('cpf');
        const emailField = document.getElementById('email');
        const enderecoField = document.getElementById('endereco');

        this.formData.nome = nomeField ? nomeField.value.trim() : '';
        this.formData.cpf = cpfField ? cpfField.value.replace(/\D/g, '') : '';
        this.formData.email = emailField ? emailField.value.trim() : '';
        this.formData.endereco = enderecoField ? enderecoField.value.trim() : '';
    }

    // ========== SECTION 3 ==========
    setupSection3() {
        this.setupVoltarSection3();
        this.setupAvancarSection3();
        this.setupDisponibilidade();
        this.setupBairros();
        this.setupNivelCurso();
    }

    setupVoltarSection3() {
        const btnVoltar = document.querySelector('#section3 .btn-prev');
        if (!btnVoltar) return;

        btnVoltar.addEventListener('click', e => {
            e.preventDefault();
            this.clearSection2Fields();
            this.showSection(2);
        });
    }

    clearSection2Fields() {
        const fields = ['nome', 'cpf', 'email', 'endereco'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.value = '';
        });
        console.log('⚠️ Campos da seção 2 resetados');
    }

    setupAvancarSection3() {
        const btnAvancar = document.querySelector('#section3 .btn-next');
        if (!btnAvancar) return;

        btnAvancar.addEventListener('click', e => {
            e.preventDefault();
            this.saveSection3Data();
            
            console.log('=== 📋 DADOS SEÇÃO 3 ===');
            console.log('Disponibilidade:', this.formData.disponibilidade);
            console.log('Bairros:', this.formData.bairros);
            console.log('Nível:', this.formData.nivel);
            console.log('Curso:', this.formData.curso);
            console.log('=======================');

            this.showSection(4);
        });
    }

    setupDisponibilidade() {
        const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
        const tableRows = document.querySelectorAll('#section3 .schedule-table tbody tr');

        tableRows.forEach((row, index) => {
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach((checkbox, turnoIndex) => {
                checkbox.addEventListener('change', () => {
                    const turno = turnoIndex === 0 ? 'Manha' : 'Tarde';
                    const key = `${dias[index]}${turno}`;
                    this.formData.disponibilidade[key] = checkbox.checked;
                });
            });
        });
    }

    setupBairros() {
        const bairrosCheckboxes = document.querySelectorAll('input[name="bairros"]');
        
        bairrosCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBairrosData();
            });
        });
    }

    updateBairrosData() {
        const bairrosSelecionados = Array.from(document.querySelectorAll('input[name="bairros"]:checked'))
            .map(cb => {
                const descElement = cb.closest('.item-row')?.querySelector('.desc');
                return descElement ? descElement.textContent.trim() : '';
            })
            .filter(Boolean);
        
        this.formData.bairros = bairrosSelecionados;
    }

    setupNivelCurso() {
        const nivelRadios = document.querySelectorAll('input[name="nivel"]');
        nivelRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.formData.nivel = e.target.value;
                }
            });
        });

        const cursoField = document.getElementById('curso');
        if (cursoField) {
            cursoField.addEventListener('input', (e) => {
                this.formData.curso = e.target.value.trim();
            });
        }
    }

    saveSection3Data() {
        this.updateBairrosData();
    }

    // ========== FORM SUBMIT ==========
    setupFormSubmit() {
        const form = document.getElementById('meuFormulario');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await this.handleFormSubmit();
        });
    }

    async handleFormSubmit() {
        const submitBtn = document.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
        }

        try {
            // Testa conexão
            const connectionOk = await this.testSupabaseConnection();
            if (!connectionOk) {
                throw new Error('Erro de conexão com o banco de dados');
            }

            // CAPTURA TODOS OS DADOS PARA LOG (mas só envia o nome)
            this.captureAllDataForLog();
            
            console.log('=== 📊 DADOS COMPLETOS CAPTURADOS ===');
            console.log('DADOS PESSOAIS:');
            console.log('  Nome:', this.formData.nome);
            console.log('  CPF:', this.formData.cpf);
            console.log('  Email:', this.formData.email);
            console.log('  Endereço:', this.formData.endereco);
            
            console.log('FORMAÇÃO:');
            console.log('  Disciplinas:', this.formData.disciplinas);
            console.log('  Nível:', this.formData.nivel);
            console.log('  Curso:', this.formData.curso);
            
            console.log('EXPERIÊNCIAS:');
            console.log('  Exp. Aulas:', this.formData.expAulas);
            console.log('  Descrição Aulas:', this.formData.descricaoExpAulas);
            console.log('  Exp. Neuro:', this.formData.expNeuro);
            console.log('  Descrição Neuro:', this.formData.descricaoExpNeuro);
            console.log('  Exp. TDICs:', this.formData.expTdics);
            console.log('  Descrição TDICs:', this.formData.descricaoTdics);
            
            console.log('DISPONIBILIDADE:');
            console.log('  Segunda:', { manhã: this.formData.disponibilidade.segManha, tarde: this.formData.disponibilidade.segTarde });
            console.log('  Terça:', { manhã: this.formData.disponibilidade.terManha, tarde: this.formData.disponibilidade.terTarde });
            console.log('  Quarta:', { manhã: this.formData.disponibilidade.quaManha, tarde: this.formData.disponibilidade.quaTarde });
            console.log('  Quinta:', { manhã: this.formData.disponibilidade.quiManha, tarde: this.formData.disponibilidade.quiTarde });
            console.log('  Sexta:', { manhã: this.formData.disponibilidade.sexManha, tarde: this.formData.disponibilidade.sexTarde });
            console.log('  Sábado:', { manhã: this.formData.disponibilidade.sabManha, tarde: this.formData.disponibilidade.sabTarde });
            
            console.log('BAIRROS:');
            console.log('  Bairros selecionados:', this.formData.bairros);
            console.log('================================');

            // PREPARA DADOS PARA ENVIO - APENAS NOME
            const finalData = {
                nome: this.formData.nome || 'Não informado'
            };

            console.log('📤 ENVIANDO PARA SUPABASE (apenas nome):', finalData);

            // Envia apenas o nome para o Supabase
            const { data, error } = await this.supabase
                .from('candidatoSelecao')
                .insert([finalData]);

            if (error) throw error;

            console.log('✅ Dados enviados com sucesso para Supabase:', data);
            this.showSection(5); // Tela de sucesso

        } catch (error) {
            console.error('❌ Erro ao enviar formulário:', error);
            alert(`Erro ao enviar: ${error.message}`);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Cadastro';
            }
        }
    }

    captureAllDataForLog() {
        // Garante que todos os dados estejam atualizados antes do log
        this.saveSection2Data();
        this.updateDisciplinasData();
        this.updateBairrosData();
        
        // Captura nível e curso atualizados
        const nivelSelected = document.querySelector('input[name="nivel"]:checked');
        this.formData.nivel = nivelSelected ? nivelSelected.value : '';
        
        const cursoField = document.getElementById('curso');
        this.formData.curso = cursoField ? cursoField.value.trim() : '';
    }

    // ========== EVENT LISTENERS SETUP ==========
    setupEventListeners() {
        // Campos da seção 2 para validação
        const section2Fields = ['nome', 'cpf', 'email', 'endereco'];
        section2Fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.validateSection2());
            }
        });

        // Máscara do CPF
        this.setupMaskCPF();

        // Dropdown de disciplinas
        this.setupDropdownDisciplinas();

        // Toggles de experiência
        this.setupExperienceToggles();

        // Navegação entre seções
        this.setupSection2();
        this.setupSection3();

        // Submit do formulário
        this.setupFormSubmit();

        console.log('✅ Event listeners configurados');
    }
}

// ========== INICIALIZAÇÃO DA APLICAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    window.formApp = new FormularioApp();
});

// ========== FUNÇÕES GLOBAIS PARA HTML ==========
function showSection(sectionNumber) {
    if (window.formApp) {
        window.formApp.showSection(sectionNumber);
    }
}

function toggleGroup(headerElement) {
    if (window.formApp) {
        window.formApp.toggleGroup(headerElement);
    }
}