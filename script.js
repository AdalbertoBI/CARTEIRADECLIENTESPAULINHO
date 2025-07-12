// Variáveis globais
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let interacoes = JSON.parse(localStorage.getItem('interacoes')) || [];
let clienteAtual = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarClientes();
    setupEventListeners();
    carregarCidades();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('form-cliente').addEventListener('submit', salvarCliente);
    
    document.getElementById('tipo-interacao').addEventListener('change', function() {
        const kmField = document.getElementById('km-percorrida');
        if (this.value === 'visita') {
            kmField.removeAttribute('readonly');
            kmField.focus();
        } else {
            kmField.value = '0';
            kmField.setAttribute('readonly', true);
        }
    });
}

// Navegação entre páginas
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById('page-' + pageId).style.display = 'block';
    
    if (pageId === 'home') {
        carregarClientes();
    } else if (pageId === 'relatorios') {
        carregarCidades();
    }
}

// Alertas
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" onclick="closeAlert('${alertId}')"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    setTimeout(() => {
        closeAlert(alertId);
    }, 5000);
}

function closeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.remove();
    }
}

// Gerenciamento de Clientes
function salvarCliente(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const cidade = document.getElementById('cidade').value;
    
    const cliente = {
        id: Date.now(),
        nome: nome,
        telefone: telefone,
        cidade: cidade,
        dataCadastro: new Date().toISOString()
    };
    
    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    showAlert('Cliente adicionado com sucesso!');
    document.getElementById('form-cliente').reset();
    showPage('home');
}

function carregarClientes() {
    const tbody = document.getElementById('clientes-table');
    
    if (clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="alert alert-info mb-0">
                        <i class="fas fa-info-circle"></i> Nenhum cliente cadastrado ainda.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td>${cliente.nome}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.cidade}</td>
            <td>${new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="verDetalhes(${cliente.id})">
                    <i class="fas fa-eye"></i> Ver Detalhes
                </button>
            </td>
        </tr>
    `).join('');
}

function verDetalhes(clienteId) {
    clienteAtual = clientes.find(c => c.id === clienteId);
    
    const clienteInfo = document.getElementById('cliente-info');
    clienteInfo.innerHTML = `
        <p><strong>Nome:</strong> ${clienteAtual.nome}</p>
        <p><strong>Telefone:</strong> ${clienteAtual.telefone}</p>
        <p><strong>Cidade:</strong> ${clienteAtual.cidade}</p>
        <p><strong>Data Cadastro:</strong> ${new Date(clienteAtual.dataCadastro).toLocaleDateString('pt-BR')}</p>
    `;
    
    carregarInteracoes(clienteId);
    showPage('cliente-detalhes');
}

// Gerenciamento de Interações
function carregarInteracoes(clienteId) {
    const interacoesCliente = interacoes.filter(i => i.clienteId === clienteId);
    const container = document.getElementById('interacoes-list');
    
    if (interacoesCliente.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Nenhuma interação registrada ainda.
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead class="table-dark">
                    <tr>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>KM</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    ${interacoesCliente.map(interacao => `
                        <tr>
                            <td>
                                ${getTipoBadge(interacao.tipo)}
                            </td>
                            <td>${interacao.descricao || '-'}</td>
                            <td>${interacao.kmPercorrida > 0 ? interacao.kmPercorrida : '-'}</td>
                            <td>${new Date(interacao.dataInteracao).toLocaleDateString('pt-BR')} ${new Date(interacao.dataInteracao).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getTipoBadge(tipo) {
    const badges = {
        'ligacao': '<span class="badge bg-primary">Ligação</span>',
        'whatsapp': '<span class="badge bg-success">WhatsApp</span>',
        'visita': '<span class="badge bg-warning">Visita</span>'
    };
    return badges[tipo] || tipo;
}

function showAddInteraction() {
    const modal = new bootstrap.Modal(document.getElementById('modalInteracao'));
    document.getElementById('form-interacao').reset();
    document.getElementById('km-percorrida').value = '0';
    document.getElementById('km-percorrida').setAttribute('readonly', true);
    modal.show();
}

function salvarInteracao() {
    const tipo = document.getElementById('tipo-interacao').value;
    const descricao = document.getElementById('descricao-interacao').value;
    const kmPercorrida = parseFloat(document.getElementById('km-percorrida').value) || 0;
    
    if (!tipo) {
        showAlert('Selecione o tipo de interação!', 'danger');
        return;
    }
    
    const interacao = {
        id: Date.now(),
        clienteId: clienteAtual.id,
        tipo: tipo,
        descricao: descricao,
        kmPercorrida: kmPercorrida,
        dataInteracao: new Date().toISOString()
    };
    
    interacoes.push(interacao);
    localStorage.setItem('interacoes', JSON.stringify(interacoes));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalInteracao'));
    modal.hide();
    
    showAlert('Interação adicionada com sucesso!');
    carregarInteracoes(clienteAtual.id);
}

// Relatórios e Exportação
function carregarCidades() {
    const select = document.getElementById('filtro-cidade');
    const cidades = [...new Set(clientes.map(c => c.cidade))].sort();
    
    select.innerHTML = '<option value="">Todas as cidades</option>' +
        cidades.map(cidade => `<option value="${cidade}">${cidade}</option>`).join('');
}

function exportarExcel() {
    const nomeFilter = document.getElementById('filtro-nome').value.toLowerCase();
    const cidadeFilter = document.getElementById('filtro-cidade').value;
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    
    let dadosExport = [];
    
    clientes.forEach(cliente => {
        // Filtros de cliente
        if (nomeFilter && !cliente.nome.toLowerCase().includes(nomeFilter)) return;
        if (cidadeFilter && cliente.cidade !== cidadeFilter) return;
        
        const interacoesCliente = interacoes.filter(i => i.clienteId === cliente.id);
        
        if (interacoesCliente.length === 0) {
            dadosExport.push({
                'Nome Cliente': cliente.nome,
                'Telefone': cliente.telefone,
                'Cidade': cliente.cidade,
                'Tipo Interação': '',
                'Descrição': '',
                'KM Percorrida': '',
                'Data Interação': ''
            });
        } else {
            interacoesCliente.forEach(interacao => {
                const dataInteracao = new Date(interacao.dataInteracao);
                
                // Filtros de data
                if (dataInicio && dataInteracao < new Date(dataInicio)) return;
                if (dataFim && dataInteracao > new Date(dataFim + 'T23:59:59')) return;
                
                dadosExport.push({
                    'Nome Cliente': cliente.nome,
                    'Telefone': cliente.telefone,
                    'Cidade': cliente.cidade,
                    'Tipo Interação': interacao.tipo,
                    'Descrição': interacao.descricao || '',
                    'KM Percorrida': interacao.kmPercorrida || 0,
                    'Data Interação': dataInteracao.toLocaleDateString('pt-BR') + ' ' + dataInteracao.toLocaleTimeString('pt-BR')
                });
            });
        }
    });
    
    if (dadosExport.length === 0) {
        showAlert('Nenhum dado encontrado para exportar!', 'warning');
        return;
    }
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosExport);
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes e Interações');
    
    // Gerar nome do arquivo
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `clientes_relatorio_${timestamp}.xlsx`;
    
    // Download do arquivo
    XLSX.writeFile(wb, filename);
    
    showAlert('Relatório exportado com sucesso!');
}

// Funções utilitárias
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// Dados de demonstração (opcional - remover em produção)
function carregarDadosDemo() {
    if (clientes.length === 0) {
        const clientesDemo = [
            {
                id: 1,
                nome: 'João Silva',
                telefone: '(11) 99999-9999',
                cidade: 'São Paulo',
                dataCadastro: new Date('2024-01-15').toISOString()
            },
            {
                id: 2,
                nome: 'Maria Santos',
                telefone: '(21) 88888-8888',
                cidade: 'Rio de Janeiro',
                dataCadastro: new Date('2024-02-20').toISOString()
            }
        ];
        
        const interacoesDemo = [
            {
                id: 1,
                clienteId: 1,
                tipo: 'ligacao',
                descricao: 'Primeira ligação para apresentação',
                kmPercorrida: 0,
                dataInteracao: new Date('2024-01-16').toISOString()
            },
            {
                id: 2,
                clienteId: 1,
                tipo: 'visita',
                descricao: 'Visita técnica no escritório',
                kmPercorrida: 25.5,
                dataInteracao: new Date('2024-01-20').toISOString()
            }
        ];
        
        clientes = clientesDemo;
        interacoes = interacoesDemo;
        localStorage.setItem('clientes', JSON.stringify(clientes));
        localStorage.setItem('interacoes', JSON.stringify(interacoes));
    }
}

// Descomente a linha abaixo para carregar dados de demonstração
// carregarDadosDemo();
