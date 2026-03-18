// 1. Inicialização e Variáveis Globais

document.getElementById('data').value = new Date().toLocaleDateString('pt-BR');

let selecaoMestre = "";

let selecaoSub = "";

let currentStep = 1;

let alvaraAtiva = true;

let tempoAtivo = true;



const CORES_TIPOLOGIA = {

    "madeira_Mista": "#795548",

    "madeira_Pinus": "#8bc34a",

    "alvenaria_BRONZE": "#cd7f32",

    "alvenaria_PRATA": "#94a3b8",

    "alvenaria_OURO": "#d4af37",

    "tijolo_padrao": "#ff6f00",

    "default": "#28a745"

};



const FRETE_CIDADES = { "Joinville": 100, "Araquari": 100, "Pirabeiraba": 420, "São Francisco do Sul": 600, "Ervino": 550, "Blumenau": 1809, "Campo Alegre": 2250, "Pomerode": 2320, "Schroeder": 1788, "Jaragua do Sul": 1950, "Barra Velha": 990, "Piçarras": 1200, "Penha": 1410, "Balneário Camboriú": 2418, "Balneário Barra do Sul": 600, "São Bento do Sul": 2460, "Massaranduba": 2320, "Curitiba": 3574, "Itapema": 3694, "Garuva": 672, "Bombinhas": 3694, "Rio do Sul": 3680, "Timbó": 2320, "Brusque": 1809, "Presidente Getúlio": 3680, "Corupá": 2098, "Itajai": 2418, "Itapoá": 938, "Rio dos Cedros": 2632, "Guaratuba": 1162, "Urubici": 6238, "Florianópolis": 3680, "Rio do Campo": 4434, "Indaial": 1809, "Criciuma": 6124 };



const PRECOS_M2 = {

    "madeira": { "Mista": {"f": 2380, "a": 1438.08}, "Pinus": {"f": 2024.44, "a": 1198.4} },

    "alvenaria": { "BRONZE": {"f": 2462.88, "a": 1438.08}, "PRATA": {"f": 3246.88, "a": 1438.08}, "OURO": {"f": 3899, "a": 1438.08} },

    "tijolo": { "padrao": {"f": 2540.608, "a": 1954.4} }

};



const PRECOS_EXTRAS = {

    "banheiro":      { "nome": "Banh. Extra",          "p": 3500,  "d": 3 },

    "pintura":       { "nome": "Pintura",              "p": 32,    "d": 0.1 },

    "ac":            { "nome": "Ponto de A/C",         "p": 300,   "d": 0 },

    "janelas":       { "nome": "Jan. Madeira",         "p": 250,   "d": 0 },

    "torre":         { "nome": "Torre Tijolo Eco",     "p": 8500,  "d": 0 },

    "torneira":      { "nome": "Pto Torneira Elétr.",  "p": 300,   "d": 0 },

    "veneziana":     { "nome": "Venezianas",           "p": 1890,  "d": 0 },

    "pivotante":     { "nome": "Porta Pivotante",      "p": 1300,  "d": 0 },

    "janela_ex":     { "nome": "Porta Janela Extra",   "p": 1000,  "d": 0 },

    "forro_inc":     { "nome": "Teto Forro Inc.",      "p": 365,   "d": 0 },

    "forro_reto":    { "nome": "Forro Madeira Reto",   "p": 152,   "d": 0 },

    "churrasqueira": { "nome": "Churrasq. Tijolo",     "p": 10200, "d": 5 }

};



// Popular Cidades

const list = document.getElementById('cidades-logistica');

if(list) {

    Object.keys(FRETE_CIDADES).sort().forEach(c => {

        const opt = document.createElement('option'); opt.value = c; list.appendChild(opt);

    });

}



// 2. Funções de Lógica e Visual

function atualizarIdentidadeVisual() {

    const chave = `${selecaoMestre}_${selecaoSub}`;

    const novaCor = CORES_TIPOLOGIA[chave] || CORES_TIPOLOGIA["default"];

    document.documentElement.style.setProperty('--primary-color', novaCor);

}



function toggleMenuResumo() { document.getElementById('resumo-flutuante').classList.toggle('aberto'); }

function toggleFicha() { document.getElementById('ficha-resumo').classList.toggle('aberto'); }



function showStep2(tipo) {

    selecaoMestre = tipo;

    if (tipo === 'tijolo') { selecaoSub = "padrao"; atualizarIdentidadeVisual(); changeStep(3); return; }

    const container = document.getElementById('sub-options-container');

    container.innerHTML = (tipo === 'madeira') ?

        `<div class="btn-sub" onclick="setSubOption('Mista')">Madeira de Lei</div><div class="btn-sub" onclick="setSubOption('Pinus')">Pinus Autoclavado</div>` :

        `<div class="btn-sub" onclick="setSubOption('BRONZE')">BRONZE</div><div class="btn-sub" onclick="setSubOption('PRATA')">PRATA</div><div class="btn-sub" onclick="setSubOption('OURO')">OURO</div>`;

    changeStep(2);

}



function setSubOption(nome) { selecaoSub = nome; atualizarIdentidadeVisual(); changeStep(3); }



function changeStep(num) {

    currentStep = num;

    document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));

    if(document.getElementById('step-' + num)) document.getElementById('step-' + num).classList.add('active');

    document.getElementById('btn-voltar').style.display = (num > 1) ? 'block' : 'none';

    document.getElementById('painel-adicionais').style.display = (num === 3) ? 'block' : 'none';

    calcularTudo();

}



function voltar() { if (currentStep === 3 && selecaoMestre === 'tijolo') changeStep(1); else changeStep(currentStep - 1); }



function toggleTag(id, defVal) {

    const tag = document.getElementById('tag-' + id);

    if(tag) {

        tag.classList.toggle('active');

        if (defVal && tag.classList.contains('active')) {

            const input = document.getElementById('val-' + id);

            if(input) input.value = defVal;

        }

    }

    calcularTudo();

}



function toggleTaxa(tipo) {

    if (tipo === 'alvara') alvaraAtiva = !alvaraAtiva; else if (tipo === 'tempo') tempoAtivo = !tempoAtivo;

    const fBtn = document.getElementById('ficha-alvara-status');

    if(alvaraAtiva) { fBtn.innerText = "Incluso"; fBtn.className = "tag-alvara incluso"; }

    else { fBtn.innerText = "Não Incluso"; fBtn.className = "tag-alvara pendente"; }

    calcularTudo();

}



function sincronizarPintura() {

    const f = parseFloat(document.getElementById('masterFechada').value) || 0;

    const a = parseFloat(document.getElementById('masterAberta').value) || 0;

    if(document.getElementById('val-pintura')) document.getElementById('val-pintura').value = (f + a).toFixed(2);

}



function toggleAdicionais() { document.getElementById('content-adicionais').classList.toggle('open'); }

function formatar(v) { return v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}); }



function calcularTudo() {

    const m2F = parseFloat(document.getElementById('masterFechada').value) || 0;

    const m2A = parseFloat(document.getElementById('masterAberta').value) || 0;

    const m2Total = m2F + m2A;

    const cidade = document.getElementById('local').value;

   

    let vF = 0, vA = 0;

    if (selecaoMestre && PRECOS_M2[selecaoMestre]) {

        const p = PRECOS_M2[selecaoMestre][selecaoSub] || Object.values(PRECOS_M2[selecaoMestre])[0];

        vF = m2F * p.f; vA = m2A * p.a;

    }

   

    let tExt = 0; let htmlE = "";

    Object.keys(PRECOS_EXTRAS).forEach(id => {

        if (document.getElementById('tag-' + id)?.classList.contains('active')) {

            const q = document.getElementById('val-' + id) ? parseFloat(document.getElementById('val-' + id).value) || 0 : 1;

            const subExtra = q * PRECOS_EXTRAS[id].p; tExt += subExtra;

            htmlE += `<div class="resumo-item"><span>${PRECOS_EXTRAS[id].nome}</span><span>${formatar(subExtra)}</span></div>`;

        }

    });



    // 1. CÁLCULO DE DIAS (BASE + EXTRAS)

    let diasBase = Math.ceil((selecaoMestre === 'tijolo') ? (m2Total * 1.25) : (m2Total * 0.83477));

    let diasExtras = 0;

    Object.keys(PRECOS_EXTRAS).forEach(id => {

        if (document.getElementById('tag-' + id)?.classList.contains('active')) {

            const q = document.getElementById('val-' + id) ? parseFloat(document.getElementById('val-' + id).value) || 0 : 1;

            if (id === 'forro_inc') {

                let calculoForro = (q > 17) ? (q / 10) : (q / 5);

                diasExtras += Math.ceil(calculoForro);

            } else if (id === 'pintura' || id === 'forro_reto') {

                diasExtras += Math.ceil(q / 10);

            } else {

                diasExtras += q * (PRECOS_EXTRAS[id].d || 0);

            }

        }

    });



    let dias = diasBase + diasExtras;

    let mesesObra = Math.ceil(dias / 30) || (m2Total > 0 ? 1 : 0);

    let valorLogisticaBase = (FRETE_CIDADES[cidade] || 0) * mesesObra;

   

    // 2. CÁLCULOS FINANCEIROS

    const totalObra = vF + vA + tExt + valorLogisticaBase + dias;

    const subtotal = totalObra + 1000;

    let valorAlvara = alvaraAtiva ? Math.max(1000, Math.ceil((subtotal - 1000) * 0.045)) : 0;

    const subFinal = subtotal + valorAlvara;

    let valorFatorTempo = (tempoAtivo && dias > 0) ? (subFinal * 0.007) : 0;

    const totalInvestimento = (m2Total > 0) ? (subFinal + valorFatorTempo + valorLogisticaBase) : 0;



    // 3. ATUALIZAÇÃO DA TELA E PDF

    document.getElementById('totalMaster').innerText = formatar(totalInvestimento);

    document.getElementById('res-lista-base').innerHTML = `<div class="resumo-item"><span>Área Fechada</span><span>${formatar(vF)}</span></div><div class="resumo-item"><span>Área Aberta</span><span>${formatar(vA)}</span></div>${htmlE}<div class="resumo-item"><span>Logística</span><span>${formatar(valorLogisticaBase)}</span></div>`;

   

    const fichaTotalDiv = document.getElementById('pdf-total-investimento');

    if(fichaTotalDiv) fichaTotalDiv.innerText = formatar(totalInvestimento);



    document.getElementById('res-total-obra').innerText = formatar(totalObra);

    document.getElementById('res-subtotal').innerText = formatar(subtotal);

    document.getElementById('res-alvara').innerText = formatar(valorAlvara);

    document.getElementById('res-subfinal').innerText = formatar(subFinal);

    document.getElementById('res-tempo').innerText = formatar(valorFatorTempo);

    document.getElementById('res-total').innerText = formatar(totalInvestimento);



    // 4. TRADUTOR DA TIPOLOGIA

    const tradutorFicha = {

        'madeira': { 'titulo': 'Madeira', 'sub': { 'Mista': 'de Lei (mista)', 'Pinus': 'Pinus Autoclavado' } },

        'alvenaria': { 'titulo': 'Alvenaria', 'sub': { 'BRONZE': 'Padrão Bronze', 'PRATA': 'Padrão Prata', 'OURO': 'Padrão Ouro' } },

        'tijolo': { 'titulo': 'Tijolo Ecológico', 'sub': { 'padrao': '' } }

    };



    const categoria = selecaoMestre.toLowerCase();

    const nomePrincipal = tradutorFicha[categoria]?.titulo || selecaoMestre;

    const nomeSub = tradutorFicha[categoria]?.sub[selecaoSub] || "";

    let textoFicha = nomePrincipal + (nomeSub ? ' - ' + nomeSub : '');

    document.getElementById('ficha-modelo').innerText = textoFicha.toUpperCase();



    document.getElementById('ficha-m2-fechada').innerText = m2F.toFixed(2) + ' m²';

    document.getElementById('ficha-m2-aberta').innerText = m2A.toFixed(2) + ' m²';

    document.getElementById('ficha-m2-total').innerText = m2Total.toFixed(2) + ' m²';



    // --- LISTA DE ITENS NA FICHA ---

    const listaFicha = document.getElementById('ficha-itens');

    listaFicha.innerHTML = "";

    let temItem = false;

    const mapaItens = [

        { tag: 'tag-banheiro', nome: 'Banheiro Extra', input: 'val-banheiro' },

        { tag: 'tag-pintura', nome: 'Pintura Total', input: 'val-pintura' },

        { tag: 'tag-torre', nome: 'Torre Tijolo Eco', input: 'val-torre' },

        { tag: 'tag-torneira', nome: 'Pto Torneira Elétr.', input: 'val-torneira' },

        { tag: 'tag-veneziana', nome: 'Venezianas', input: 'val-veneziana' },

        { tag: 'tag-forro_inc', nome: 'Teto Forro Inc.', input: 'val-forro_inc' },

        { tag: 'tag-ac', nome: 'Ponto de A/C', input: 'val-ac' },

        { tag: 'tag-pivotante', nome: 'Porta Pivotante', input: 'val-pivotante' },

        { tag: 'tag-janela_ex', nome: 'Porta Janela Extra', input: 'val-janela_ex' },

        { tag: 'tag-forro_reto', nome: 'Forro Reto Madeira', input: 'val-forro_reto' },

        { tag: 'tag-churrasqueira', nome: 'Churrasqueira', input: 'val-churrasqueira' }

    ];



    mapaItens.forEach(item => {

        const elTag = document.getElementById(item.tag);

        if (elTag && elTag.classList.contains('active')) {

            temItem = true;

            const qtd = document.getElementById(item.input)?.value || "1";

            const unidade = (item.tag.includes('pintura') || item.tag.includes('forro') || item.tag.includes('veneziana')) ? 'm²' : 'und';

            const li = document.createElement('li');

            li.innerHTML = `<span>${item.nome}:</span> <b>${qtd} ${unidade}</b>`;

            listaFicha.appendChild(li);

        }

    });



    if (!temItem) listaFicha.innerHTML = "<li>Nenhum selecionado</li>";



    // --- ATUALIZAÇÃO DAS ETAPAS DE PAGAMENTO (AQUI!) ---

    const etapasPagamento = [

        { d: "Assinatura de contrato", p: 0.15 },

        { d: "Início das obras",       p: 0.10 },

        { d: "Fim de fundação",        p: 0.15 },

        { d: "Inicio do madeiramento", p: 0.20 },

        { d: "Inicio da cobertura",    p: 0.20 },

        { d: "Inicio do acabamento",   p: 0.15 },

        { d: "Entrega das chaves",     p: 0.05 }

    ];



    let miudoHtml = "";

    etapasPagamento.forEach(item => {

        const valorEtapa = totalInvestimento * item.p;

        miudoHtml += `

            <div style="display: flex; justify-content: space-between; padding-right: 15px; border-bottom: 0.2px solid #f1f5f9; margin-bottom: 2px;">

                <span>${item.d}</span>

                <span style="font-weight: 600;">${formatar(valorEtapa)}</span>

            </div>`;

    });



    const containerEtapas = document.getElementById('corpo-etapas');

    if (containerEtapas) {

        containerEtapas.innerHTML = miudoHtml;

    }

}



// 3. CONFIGURAÇÕES DE ACESSO E CONTATO

const DADOS_VENDEDORES = {

    "Érik": { senha: "123", tel: "(47) 99180-6834" },

    "Rodrigo": { senha: "456", tel: "(47) 99104-7138" },

    "Tiago": { senha: "789", tel: "(47) 99255-9821" }

};



function solicitarSenha() {

    const wrapper = document.getElementById('wrapper-senha');

    wrapper.classList.remove('w-0', 'opacity-0');

    wrapper.classList.add('w-32', 'opacity-100', 'ml-4');

    document.getElementById('input-senha').focus();

    bloquearSite();

}



function validarAcesso() {

    const vendedor = document.getElementById('vendedor').value;

    const senhaDigitada = document.getElementById('input-senha').value;

    const main = document.getElementById('conteudo-principal');

    if (DADOS_VENDEDORES[vendedor] && DADOS_VENDEDORES[vendedor].senha === senhaDigitada) {

        main.classList.remove('opacity-20', 'pointer-events-none', 'blur-[2px]');

    } else {

        bloquearSite();

    }

}



function bloquearSite() {

    document.getElementById('conteudo-principal').classList.add('opacity-20', 'pointer-events-none', 'blur-[2px]');

}



// 4. FUNÇÃO GERAR PDF

function gerarPDF() {

    const nome = document.getElementById('clienteNome')?.value || "---";

    const telCliente = document.getElementById('clienteTel')?.value || "---";

    const vendedorNome = document.getElementById('vendedor')?.value || "---";

    const obra = document.getElementById('local')?.value || "---";

    const dataHoje = new Date().toLocaleDateString('pt-BR');



    const infoVendedor = DADOS_VENDEDORES[vendedorNome];

    const vendedorComContato = infoVendedor ? `${vendedorNome} - ${infoVendedor.tel}` : vendedorNome;



    if(document.getElementById('pdf-cliente-nome')) document.getElementById('pdf-cliente-nome').innerText = nome;

    if(document.getElementById('pdf-cliente-whatsapp')) document.getElementById('pdf-cliente-whatsapp').innerText = telCliente;

    if(document.getElementById('pdf-cliente-obra')) document.getElementById('pdf-cliente-obra').innerText = obra;

    if(document.getElementById('pdf-data')) document.getElementById('pdf-data').innerText = dataHoje;

    if(document.getElementById('pdf-orcamentista')) document.getElementById('pdf-orcamentista').innerText = vendedorComContato;



    const campoObs = document.getElementById('ficha-obs');

    if (campoObs) {

        if (!campoObs.value.trim()) {

            campoObs.style.display = 'none';

        } else {

            campoObs.style.display = 'block';

            campoObs.style.border = 'none';

            campoObs.style.padding = '0';

        }

    }



    window.print();



    if (campoObs && campoObs.value.trim()) {

        campoObs.style.border = '';

        campoObs.style.padding = '';

    }

}



function toggleObservacao() {

    const campo = document.getElementById('ficha-obs');

    campo.classList.toggle('hidden');

    if (!campo.classList.contains('hidden')) campo.focus();

}
// ================================================================
// 5. FUNÇÃO GERAR PDF ENGENHARIA (RELATÓRIO TÉCNICO)
// ================================================================

function gerarPDFEngenharia() {
    const nome = document.getElementById('clienteNome')?.value || "---";
    const telCliente = document.getElementById('clienteTel')?.value || "---";
    const vendedorNome = document.getElementById('vendedor')?.value || "---";
    const obra = document.getElementById('local')?.value || "---";
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    // Pega o telefone do vendedor no objeto DADOS_VENDEDORES que já existe no seu JS
    const infoVendedor = DADOS_VENDEDORES[vendedorNome];
    const vendedorCompleto = infoVendedor ? `${vendedorNome} - ${infoVendedor.tel}` : vendedorNome;

    document.getElementById('eng-pdf-cliente-nome').innerText = nome;
    document.getElementById('eng-pdf-cliente-whatsapp').innerText = telCliente;
    document.getElementById('eng-pdf-cliente-obra').innerText = obra;
    document.getElementById('eng-pdf-data').innerText = dataHoje;
    document.getElementById('eng-pdf-orcamentista').innerText = vendedorCompleto;

    // Metragens direto do cálculo
    const m2F = parseFloat(document.getElementById('masterFechada').value) || 0;
    const m2A = parseFloat(document.getElementById('masterAberta').value) || 0;
    
    document.getElementById('eng-area-fechada').innerText = m2F.toFixed(2) + " m²";
    document.getElementById('eng-area-aberta').innerText = m2A.toFixed(2) + " m²";
    document.getElementById('eng-area-total').innerText = (m2F + m2A).toFixed(2) + " m²";

    // Valor Total
    
    



    document.getElementById('eng-total-geral-valor').innerText = document.getElementById('res-total').innerText;

    // Grid de itens
    const gridEng = document.getElementById('eng-grid-opcionais');
    const itensPrice = document.querySelectorAll('#res-lista-base .resumo-item');
    gridEng.innerHTML = "";
    itensPrice.forEach(item => {
        const n = item.querySelector('span:first-child').innerText;
        const v = item.querySelector('span:last-child').innerText;
        gridEng.innerHTML += `
            <div style="padding: 5px; border-bottom: 1px dotted #eee;">
                <div style="font-size: 8px; color: #94a3b8;">${n}</div>
                <div style="font-size: 10px; font-weight: 700;">${v}</div>
            </div>`;
    });

    document.body.classList.add('imprimindo-engenharia');
    window.print();
    setTimeout(() => document.body.classList.remove('imprimindo-engenharia'), 500);
}

// Inicialização

calcularTudo();