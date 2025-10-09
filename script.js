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
            cep: '',
            enderecoOficial: '',
            contato: '',
            pix: '',
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
            if (!window.supabase || typeof window.supabase.createClient !== 'function') {
                throw new Error('Biblioteca Supabase não encontrada. Verifique se o script CDN foi carregado.');
            }
            this.supabase = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
            console.log('✅ Supabase inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
            this.supabase = null;
        }
    }

    async testSupabaseConnection() {
        if (!this.supabase) {
            console.error('Supabase não inicializado');
            return false;
        }
        
        try {
            // Consulta simples para verificar se a tabela responde
            const { data, error } = await this.supabase
                .from('candidatoSelecao')
                .select('*')
                .limit(1);

            if (error) {
                console.error('Erro na query de teste Supabase:', error);
                return false;
            }

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
        
        const progressStep = document.querySelector(`.progress-step:nth-child(${Math.min(sectionNumber,4)})`);
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

    // ========== MÁSCARA TELEFONE ==========
    setupMaskTelefone() {
        const telefoneField = document.getElementById('contato');
        if (!telefoneField) return;

        telefoneField.addEventListener('input', e => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            // Formatação: (00) 0.0000-0000 ou (00) 00000-0000
            let formatted = '';
            if (value.length > 0) {
                formatted = '(' + value.substring(0, 2);
            }
            if (value.length > 2) {
                // se celular com 9 dígitos após DDD
                if (value.length >= 11) {
                    formatted += ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
                } else {
                    formatted += ') ' + value.substring(2, 6) + (value.length > 6 ? '-' + value.substring(6) : '');
                }
            }
            
            e.target.value = formatted;
            this.validateSection2();
        });
    }

    // ========== MÁSCARA E BUSCA DE CEP ==========
    setupMaskCEP() {
        const cepField = document.getElementById('cep');
        if (!cepField) return;

        const tryBuscar = (val) => {
            const numeric = (val || '').replace(/\D/g, '');
            if (numeric.length === 8) {
                const formatted = numeric.replace(/(\d{5})(\d)/, '$1-$2');
                cepField.value = formatted;
                this.buscarCEP(numeric);
            }
        };

        cepField.addEventListener('input', e => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            if (value.length > 5) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
            this.validateSection2();

            if (value.replace(/\D/g, '').length === 8) {
                // busca quando completar 8 dígitos
                this.buscarCEP(value.replace(/\D/g, ''));
            }
        });

        // caso cole o cep
        cepField.addEventListener('paste', (ev) => {
            setTimeout(() => tryBuscar(cepField.value), 50);
        });

        cepField.addEventListener('blur', (ev) => {
            tryBuscar(ev.target.value);
        });
    }

    async buscarCEP(cepNumeros) {
        try {
            const cepClean = String(cepNumeros).replace(/\D/g, '');
            if (cepClean.length !== 8) return;

            const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepClean}`);
            if (!response.ok) throw new Error('CEP não encontrado');

            const data = await response.json();
            const enderecoFormatado = `${data.street}, ${data.neighborhood}, ${data.city} - ${data.state}`;

            const enderecoOficialField = document.getElementById('enderecoOficial');
            if (enderecoOficialField) {
                enderecoOficialField.value = enderecoFormatado;
                this.formData.enderecoOficial = enderecoFormatado;
                enderecoOficialField.dispatchEvent(new Event('input', { bubbles: true }));
            }

            console.log('✅ Endereço encontrado via BrasilAPI:', enderecoFormatado);
            this.validateSection2();
        } catch (error) {
            console.error('❌ Erro ao buscar CEP:', error);
            const enderecoOficialField = document.getElementById('enderecoOficial');
            if (enderecoOficialField) {
                enderecoOficialField.value = '';
                this.formData.enderecoOficial = '';
                enderecoOficialField.dispatchEvent(new Event('input', { bubbles: true }));
            }
            // feedback claro ao usuário
            alert('CEP não encontrado. Verifique o CEP digitado.');
        }
    }

    // ========== MÁSCARA CPF ==========
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

    // ========== VALIDAÇÃO SEÇÃO 2 ==========
    validateSection2() {
        const section2NextBtn = document.getElementById('section2-next');
        if (!section2NextBtn) return;

        const nomeField = document.getElementById('nome');
        const cpfField = document.getElementById('cpf');
        const emailField = document.getElementById('email');
        const contatoField = document.getElementById('contato');
        const cepField = document.getElementById('cep');
        const enderecoOficialField = document.getElementById('enderecoOficial');
        const enderecoField = document.getElementById('endereco');

        const nomeValid = nomeField && nomeField.value.trim() !== '';
        const cpfValid = cpfField && cpfField.value.replace(/\D/g, '').length === 11;
        const emailValid = emailField && emailField.value.trim() !== '' && emailField.checkValidity();
        const contatoValid = contatoField && contatoField.value.replace(/\D/g, '').length >= 10; // aceita 10 ou 11
        const cepValid = cepField && cepField.value.replace(/\D/g, '').length === 8;
        const enderecoOficialValid = enderecoOficialField && enderecoOficialField.value.trim() !== '';
        const enderecoValid = enderecoField && enderecoField.value.trim() !== '';

        section2NextBtn.disabled = !(nomeValid && cpfValid && emailValid && contatoValid && cepValid && enderecoOficialValid && enderecoValid);
    }

    // ========== VALIDAÇÃO SEÇÃO 4 ==========
    validateSection4() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (!submitBtn) return false;

        const pixField = document.getElementById('pix');
        const nivelSelected = document.querySelector('input[name="nivel"]:checked');
        const cursoField = document.getElementById('curso');

        const pixValid = pixField && pixField.value.trim() !== '';
        const nivelValid = nivelSelected !== null;
        const cursoValid = cursoField && cursoField.value.trim() !== '';

        return pixValid && nivelValid && cursoValid;
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
            dropdownContent.setAttribute('aria-hidden', dropdownWrapper.classList.contains('open') ? 'false' : 'true');
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
            dropdownContent.setAttribute('aria-hidden', 'true');
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
                if (textarea) {
                    textarea.value = '';
                    this.formData[descKey] = '';
                }
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

        section2NextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (section2NextBtn.disabled) return;

            this.saveSection2Data();

            console.log('=== 📋 DADOS SEÇÃO 2 ===');
            console.log('Nome:', this.formData.nome);
            console.log('CPF:', this.formData.cpf);
            console.log('Email:', this.formData.email);
            console.log('Contato:', this.formData.contato);
            console.log('CEP:', this.formData.cep);
            console.log('Endereço Oficial:', this.formData.enderecoOficial);
            console.log('Complemento:', this.formData.endereco);
            console.log('=======================');

            this.showSection(3);
        });
    }

    saveSection2Data() {
        const nomeField = document.getElementById('nome');
        const cpfField = document.getElementById('cpf');
        const emailField = document.getElementById('email');
        const contatoField = document.getElementById('contato');
        const cepField = document.getElementById('cep');
        const enderecoOficialField = document.getElementById('enderecoOficial');
        const enderecoField = document.getElementById('endereco');

        this.formData.nome = nomeField ? nomeField.value.trim() : '';
        this.formData.cpf = cpfField ? cpfField.value.replace(/\D/g, '') : '';
        this.formData.email = emailField ? emailField.value.trim() : '';
        this.formData.contato = contatoField ? contatoField.value.replace(/\D/g, '') : '';
        this.formData.cep = cepField ? cepField.value.replace(/\D/g, '') : '';
        this.formData.enderecoOficial = enderecoOficialField ? enderecoOficialField.value.trim() : '';
        this.formData.endereco = enderecoField ? enderecoField.value.trim() : '';
    }

    // ========== SECTION 3 ==========
    setupSection3() {
        this.setupVoltarSection3();
        this.setupAvancarSection3();
        this.setupDisponibilidade();
        this.setupBairros();
    }

    setupVoltarSection3() {
        const btnVoltar = document.querySelector('#section3 .btn-prev');
        if (!btnVoltar) return;

        btnVoltar.addEventListener('click', e => {
            e.preventDefault();
            this.showSection(2);
        });
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
                const turno = turnoIndex === 0 ? 'Manha' : 'Tarde';
                const key = `${dias[index]}${turno}`;
                this.formData.disponibilidade[key] = !!checkbox.checked;
                
                checkbox.addEventListener('change', () => {
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

    saveSection3Data() {
        this.updateBairrosData();
    }

    // ========== SECTION 4 ==========
    setupSection4() {
        this.setupNivelCurso();
        this.setupPixValidation();
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

    setupPixValidation() {
        const pixField = document.getElementById('pix');
        if (pixField) {
            pixField.addEventListener('input', () => {
                this.formData.pix = pixField.value.trim();
            });
        }
    }

    // ========== FORM SUBMIT ==========
    setupFormSubmit() {
        const form = document.getElementById('meuFormulario');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Validar seção 4 antes do envio
            if (!this.validateSection4()) {
                alert('Por favor, preencha todos os campos obrigatórios da seção 4: Nível acadêmico, Curso e PIX.');
                return;
            }
            
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
            const connectionOk = await this.testSupabaseConnection();
            if (!connectionOk) {
                throw new Error('Erro de conexão com o banco de dados');
            }

            this.captureAllDataForLog();
            
            console.log('=== 📊 DADOS COMPLETOS CAPTURADOS ===');
            // ... logs omitidos para brevidade (já estavam no seu código)
            const finalData = {
                nome: this.formData.nome || 'Não informado',
                cpf: this.formData.cpf || '',
                email: this.formData.email || '',
                endereco: `${this.formData.enderecoOficial}, CEP: ${this.formData.cep}. Complemento: ${this.formData.endereco}`,
                contato: this.formData.contato || '',
                pix: this.formData.pix || '',
                bairros: this.formData.bairros.join(', ') || '',
                segManha: !!this.formData.disponibilidade.segManha,
                segTarde: !!this.formData.disponibilidade.segTarde,
                terManha: !!this.formData.disponibilidade.terManha,
                terTarde: !!this.formData.disponibilidade.terTarde,
                quaManha: !!this.formData.disponibilidade.quaManha,
                quaTarde: !!this.formData.disponibilidade.quaTarde,
                quiManha: !!this.formData.disponibilidade.quiManha,
                quiTarde: !!this.formData.disponibilidade.quiTarde,
                sexManha: !!this.formData.disponibilidade.sexManha,
                sexTarde: !!this.formData.disponibilidade.sexTarde,
                sabManha: !!this.formData.disponibilidade.sabManha,
                sabTarde: !!this.formData.disponibilidade.sabTarde,
                disciplinas: this.formData.disciplinas.join(', ') || '',
                nivel: this.formData.nivel || '',
                curso: this.formData.curso || '',
                expAulas: this.formData.expAulas || 'não',
                descricaoExpAulas: this.formData.descricaoExpAulas || '',
                expNeuro: this.formData.expNeuro || 'não',
                descricaoExpNeuro: this.formData.descricaoExpNeuro || '',
                expTdics: this.formData.expTdics || 'não',
                descricaoTdics: this.formData.descricaoTdics || ''
            };

            console.log('📤 ENVIANDO PARA SUPABASE:', finalData);

            const { data, error } = await this.supabase
                .from('candidatoSelecao')
                .insert([finalData]);

            if (error) throw error;

            console.log('✅ Dados enviados com sucesso para Supabase:', data);
            this.showSection(5);

        } catch (error) {
            console.error('❌ Erro ao enviar formulário:', error);
            alert(`Erro ao enviar: ${error.message || error}`);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Cadastro';
            }
        }
    }

    captureAllDataForLog() {
        this.saveSection2Data();
        this.updateDisciplinasData();
        this.updateBairrosData();
        
        const nivelSelected = document.querySelector('input[name="nivel"]:checked');
        this.formData.nivel = nivelSelected ? nivelSelected.value : '';
        
        const cursoField = document.getElementById('curso');
        this.formData.curso = cursoField ? cursoField.value.trim() : '';
        
        const pixField = document.getElementById('pix');
        this.formData.pix = pixField ? pixField.value.trim() : '';
    }

    // ========== EVENT LISTENERS SETUP ==========
    setupEventListeners() {
        // Campos da seção 2 para validação
        const section2Fields = ['nome', 'cpf', 'email', 'contato', 'cep', 'enderecoOficial', 'endereco'];
        section2Fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.validateSection2());
            }
        });

        // Máscaras
        this.setupMaskTelefone();
        this.setupMaskCPF();
        this.setupMaskCEP();

        // Componentes
        this.setupDropdownDisciplinas();
        this.setupExperienceToggles();

        // Navegação entre seções
        this.setupSection2();
        this.setupSection3();
        this.setupSection4();
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
