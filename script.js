// Variáveis globais
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let interacoes = JSON.parse(localStorage.getItem('interacoes')) || [];
let clienteAtual = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarClientes();
    setupEventListeners();
    carregarCidades();
    atualizarEstatisticas();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('form-cliente').addEventListener('submit', salvarCliente);
    document.getElementById('form-interacao').addEventListener('submit', salvarInteracao);
    
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

    document.getElementById('usar-data-atual').addEventListener('change', function() {
        if (this.checked) {
            const agora = new Date();
            document.getElementById('data-interacao').value = agora.toISOString().split('T')[0];
            document.getElementById('horario-interacao').value = agora.toTimeString().slice(0, 5);
        }
    });

    // Filtros em tempo real
    document.getElementById('filtro-nome').addEventListener('input', filtrarClientes);
    document.getElementById('filtro-cidade').addEventListener('change', filtrarClientes);
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
        atualizarEstatisticas();
    } else if (pageId === 'nova-interacao') {
        // Configurar data/hora atual por padrão
        const agora = new Date();
        document.getElementById('data-interacao').value = agora.toISOString().split('T')[0];
        document.getElementById('horario-interacao').value = agora.toTimeString().slice(0, 5);
    }
}

// Salvar cliente
function salvarCliente(e) {
    e.preventDefault();
    
    const cliente = {
        id: Date.now(),
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        documento: document.getElementById('documento').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        regiao: document.getElementById('regiao').value,
        tipoCliente: document.getElementById('tipo-cliente').value,
        segmento: document.getElementById('segmento').value,
        origemLead: document.getElementById('origem-lead').value,
        potencialCompra: document.getElementById('potencial-compra').value,
        observacoes: document.getElementById('observacoes').value,
        dataCadastro: new Date().toISOString()
    };
    
    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    showAlert('Cliente salvo com sucesso!', 'success');
    document.getElementById('form-cliente').reset();
    showPage('home');
}

// Salvar interação
function salvarInteracao(e) {
    e.preventDefault();
    
    const interacao = {
        id: Date.now(),
        clienteId: clienteAtual.id,
        tipo: document.getElementById('tipo-interacao').value,
        status: document.getElementById('status-interacao').value,
        kmPercorrida: parseInt(document.getElementById('km-percorrida').value) || 0,
        duracao: parseInt(document.getElementById('duracao').value) || 0,
        resultado: document.getElementById('resultado').value,
        descricao: document.getElementById('descricao').value,
        proximosPassos: document.getElementById('proximos-passos').value,
        dataInteracao: document.getElementById('data-interacao').value,
        horarioInteracao: document.getElementById('horario-interacao').value,
        dataRegistro: new Date().toISOString()
    };
    
    interacoes.push(interacao);
    localStorage.setItem('interacoes', JSON.stringify(interacoes));
    
    showAlert('Interação salva com sucesso!', 'success');
    document.getElementById('form-interacao').reset();
    carregarInteracoes(clienteAtual.id);
    showPage('cliente-detalhes');
}

// Carregar clientes
function carregarClientes() {
    const tbody = document.getElementById('lista-clientes');
    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.email || '-'}</td>
            <td>${cliente.cidade}</td>
            <td><span class="badge bg-${getTipoClienteBadge(cliente.tipoCliente)}">${cliente.tipoCliente}</span></td>
            <td>${cliente.segmento || '-'}</td>
            <td>${new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-info btn-sm" onclick="verDetalhesCliente(${cliente.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editarCliente(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarExclusaoCliente(${cliente.id}, '${cliente.nome}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Ver detalhes do cliente
function verDetalhesCliente(clienteId) {
    clienteAtual = clientes.find(c => c.id === clienteId);
    
    const infoDiv = document.getElementById('info-cliente');
    infoDiv.innerHTML = `
        <p><strong>Nome:</strong> ${clienteAtual.nome}</p>
        <p><strong>Telefone:</strong> ${clienteAtual.telefone}</p>
        <p><strong>Email:</strong> ${clienteAtual.email || '-'}</p>
        <p><strong>Documento:</strong> ${clienteAtual.documento || '-'}</p>
        <p><strong>Cidade:</strong> ${clienteAtual.cidade}</p>
        <p><strong>Estado:</strong> ${clienteAtual.estado || '-'}</p>
        <p><strong>Região:</strong> ${clienteAtual.regiao || '-'}</p>
        <p><strong>Tipo:</strong> <span class="badge bg-${getTipoClienteBadge(clienteAtual.tipoCliente)}">${clienteAtual.tipoCliente}</span></p>
        <p><strong>Segmento:</strong> ${clienteAtual.segmento || '-'}</p>
        <p><strong>Origem:</strong> ${clienteAtual.origemLead || '-'}</p>
        <p><strong>Potencial:</strong> ${clienteAtual.potencialCompra || '-'}</p>
        <p><strong>Data Cadastro:</strong> ${new Date(clienteAtual.dataCadastro).toLocaleDateString('pt-BR')}</p>
        ${clienteAtual.observacoes ? `<p><strong>Observações:</strong> ${clienteAtual.observacoes}</p>` : ''}
    `;
    
    carregarInteracoes(clienteId);
    showPage('cliente-detalhes');
}

// Carregar interações
function carregarInteracoes(clienteId) {
    const interacoesCliente = interacoes.filter(i => i.clienteId === clienteId);
    const listaDiv = document.getElementById('lista-interacoes');
    
    if (interacoesCliente.length === 0) {
        listaDiv.innerHTML = '<p class="text-muted">Nenhuma interação registrada.</p>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-sm table-hover">';
    html += '<thead class="table-dark"><tr><th>Tipo</th><th>Status</th><th>Resultado</th><th>Duração</th><th>KM</th><th>Data</th><th>Ações</th></tr></thead><tbody>';
    
    interacoesCliente.sort((a, b) => new Date(b.dataInteracao + ' ' + b.horarioInteracao) - new Date(a.dataInteracao + ' ' + a.horarioInteracao));
    
    interacoesCliente.forEach(interacao => {
        const dataInteracao = new Date(interacao.dataInteracao + ' ' + interacao.horarioInteracao);
        html += `
            <tr>
                <td>${getTipoBadge(interacao.tipo)}</td>
                <td><span class="badge bg-${getStatusBadge(interacao.status)}">${interacao.status}</span></td>
                <td>${interacao.resultado || '-'}</td>
                <td>${interacao.duracao ? interacao.duracao + ' min' : '-'}</td>
                <td>${interacao.kmPercorrida > 0 ? interacao.kmPercorrida + ' km' : '-'}</td>
                <td>${dataInteracao.toLocaleDateString('pt-BR')}<br><small>${dataInteracao.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</small></td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verDetalhesInteracao(${interacao.id})" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirInteracao(${interacao.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    listaDiv.innerHTML = html;
}

// Funções auxiliares para badges
function getTipoClienteBadge(tipo) {
    const badges = {
        'Lead': 'warning',
        'Prospect': 'info',
        'Parceiro': 'success',
        'Cliente': 'primary'
    };
    return badges[tipo] || 'secondary';
}

function getTipoBadge(tipo) {
    const badges = {
        'ligacao': '<span class="badge bg-primary">Ligação</span>',
        'whatsapp': '<span class="badge bg-success">WhatsApp</span>',
        'visita': '<span class="badge bg-warning">Visita</span>',
        'video': '<span class="badge bg-info">Vídeo</span>',
        'evento': '<span class="badge bg-danger">Evento</span>',
        'email': '<span class="badge bg-secondary">Email</span>'
    };
    return badges[tipo] || `<span class="badge bg-secondary">${tipo}</span>`;
}

function getStatusBadge(status) {
    const badges = {
        'Sucesso': 'success',
        'Reagendado': 'warning',
        'Sem Resposta': 'danger',
        'Não Interessado': 'secondary'
    };
    return badges[status] || 'secondary';
}

// Carregar cidades para filtro
function carregarCidades() {
    const select = document.getElementById('filtro-cidade');
    const cidades = [...new Set(clientes.map(c => c.cidade))].sort();
    
    select.innerHTML = '<option value="">Todas as cidades</option>';
    cidades.forEach(cidade => {
        select.innerHTML += `<option value="${cidade}">${cidade}</option>`;
    });
}

// Filtrar clientes
function filtrarClientes() {
    const filtroNome = document.getElementById('filtro-nome').value.toLowerCase();
    const filtroCidade = document.getElementById('filtro-cidade').value;
    
    const tbody = document.getElementById('lista-clientes');
    const rows = tbody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const nome = row.cells[0].textContent.toLowerCase();
        const cidade = row.cells[3].textContent;
        
        const matchNome = !filtroNome || nome.includes(filtroNome);
        const matchCidade = !filtroCidade || cidade === filtroCidade;
        
        row.style.display = matchNome && matchCidade ? '' : 'none';
    });
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    document.getElementById('total-clientes').textContent = clientes.length;
    document.getElementById('total-interacoes').textContent = interacoes.length;
    document.getElementById('total-parceiros').textContent = clientes.filter(c => c.tipoCliente === 'Parceiro').length;
    document.getElementById('total-vendas').textContent = interacoes.filter(i => i.resultado === 'Venda Realizada').length;
}

// Exportar planilha mensal
function exportarPlanilhaMensal() {
    const dados = gerarDadosPlanilhaMensal();
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros Mensais");
    
    const fileName = `planilha-mensal-${new Date().toISOString().slice(0, 7)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showAlert('Planilha mensal exportada com sucesso!', 'success');
}

// Gerar dados para planilha mensal
function gerarDadosPlanilhaMensal() {
    const dados = [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Agrupar dados por data
    const dadosPorData = {};
    
    interacoes.forEach(interacao => {
        const dataInteracao = new Date(interacao.dataInteracao);
        if (dataInteracao.getMonth() === mesAtual && dataInteracao.getFullYear() === anoAtual) {
            const dataKey = interacao.dataInteracao;
            
            if (!dadosPorData[dataKey]) {
                dadosPorData[dataKey] = {
                    Data: dataKey,
                    'Visitas Presenciais': 0,
                    'Reuniões por Vídeo': 0,
                    'Eventos': 0,
                    'Parceiros': 0,
                    'Comissão 1%': 0,
                    'Campanha de Incentivo': 0,
                    'Ligações e Whats': 0,
                    'Novos Parceiros': 0,
                    'Reativação Parceiros': 0,
                    'Contratos Assinados': 0,
                    'Leads': 0,
                    'Propostas': 0,
                    'Vendas': 0
                };
            }
            
            // Mapear tipos de interação para campos da planilha
            switch (interacao.tipo) {
                case 'visita':
                    dadosPorData[dataKey]['Visitas Presenciais']++;
                    break;
                case 'video':
                    dadosPorData[dataKey]['Reuniões por Vídeo']++;
                    break;
                case 'evento':
                    dadosPorData[dataKey]['Eventos']++;
                    break;
                case 'ligacao':
                case 'whatsapp':
                    dadosPorData[dataKey]['Ligações e Whats']++;
                    break;
            }
            
            // Mapear resultados
            switch (interacao.resultado) {
                case 'Contrato Assinado':
                    dadosPorData[dataKey]['Contratos Assinados']++;
                    break;
                case 'Proposta Enviada':
                    dadosPorData[dataKey]['Propostas']++;
                    break;
                case 'Venda Realizada':
                    dadosPorData[dataKey]['Vendas']++;
                    break;
            }
            
            // Verificar se é novo parceiro
            const cliente = clientes.find(c => c.id === interacao.clienteId);
            if (cliente && cliente.tipoCliente === 'Parceiro') {
                const cadastroData = new Date(cliente.dataCadastro);
                if (cadastroData.getMonth() === mesAtual && cadastroData.getFullYear() === anoAtual) {
                    dadosPorData[dataKey]['Novos Parceiros']++;
                }
                dadosPorData[dataKey]['Parceiros']++;
            }
            
            if (cliente && cliente.tipoCliente === 'Lead') {
                dadosPorData[dataKey]['Leads']++;
            }
        }
    });
    
    return Object.values(dadosPorData);
}

// Exportar relatório completo
function exportarRelatorioCompleto() {
    const wb = XLSX.utils.book_new();
    
    // Aba Clientes
    const wsClientes = XLSX.utils.json_to_sheet(clientes.map(c => ({
        Nome: c.nome,
        Telefone: c.telefone,
        Email: c.email || '',
        Documento: c.documento || '',
        Cidade: c.cidade,
        Estado: c.estado || '',
        Região: c.regiao || '',
        Tipo: c.tipoCliente,
        Segmento: c.segmento || '',
        Origem: c.origemLead || '',
        Potencial: c.potencialCompra || '',
        'Data Cadastro': new Date(c.dataCadastro).toLocaleDateString('pt-BR'),
        Observações: c.observacoes || ''
    })));
    
    // Aba Interações
    const wsInteracoes = XLSX.utils.json_to_sheet(interacoes.map(i => {
        const cliente = clientes.find(c => c.id === i.clienteId);
        return {
            Cliente: cliente ? cliente.nome : 'Cliente não encontrado',
            Tipo: i.tipo,
            Status: i.status,
            Resultado: i.resultado || '',
            'Duração (min)': i.duracao || 0,
            'KM Percorrida': i.kmPercorrida || 0,
            Descrição: i.descricao || '',
            'Próximos Passos': i.proximosPassos || '',
            Data: i.dataInteracao,
            Horário: i.horarioInteracao,
            'Data Registro': new Date(i.dataRegistro).toLocaleDateString('pt-BR')
        };
    }));
    
    // Aba Dados Mensais
    const wsMensal = XLSX.utils.json_to_sheet(gerarDadosPlanilhaMensal());
    
    XLSX.utils.book_append_sheet(wb, wsClientes, "Clientes");
    XLSX.utils.book_append_sheet(wb, wsInteracoes, "Interações");
    XLSX.utils.book_append_sheet(wb, wsMensal, "Dados Mensais");
    
    const fileName = `relatorio-completo-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showAlert('Relatório completo exportado com sucesso!', 'success');
}

// Exportar Excel simples
function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(clientes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    
    const fileName = `clientes-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showAlert('Lista de clientes exportada com sucesso!', 'success');
}

// Funções de exclusão
function confirmarExclusaoCliente(clienteId, nomeCliente) {
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacao'));
    const mensagem = document.getElementById('mensagem-confirmacao');
    const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
    
    mensagem.innerHTML = `Tem certeza que deseja excluir o cliente <strong>${nomeCliente}</strong>?<br>Esta ação não pode ser desfeita!`;
    
    btnConfirmar.onclick = function() {
        excluirCliente(clienteId);
        modal.hide();
    };
    
    modal.show();
}

function excluirCliente(clienteId) {
    clientes = clientes.filter(c => c.id !== clienteId);
    interacoes = interacoes.filter(i => i.clienteId !== clienteId);
    
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('interacoes', JSON.stringify(interacoes));
    
    showAlert('Cliente excluído com sucesso!', 'success');
    carregarClientes();
}

function excluirInteracao(interacaoId) {
    if (confirm('Tem certeza que deseja excluir esta interação?')) {
        interacoes = interacoes.filter(i => i.id !== interacaoId);
        localStorage.setItem('interacoes', JSON.stringify(interacoes));
        
        showAlert('Interação excluída com sucesso!', 'success');
        carregarInteracoes(clienteAtual.id);
    }
}

// Ver detalhes da interação
function verDetalhesInteracao(interacaoId) {
    const interacao = interacoes.find(i => i.id === interacaoId);
    if (!interacao) return;
    
    const detalhes = `
        <strong>Tipo:</strong> ${interacao.tipo}<br>
        <strong>Status:</strong> ${interacao.status}<br>
        <strong>Resultado:</strong> ${interacao.resultado || 'Não informado'}<br>
        <strong>Duração:</strong> ${interacao.duracao ? interacao.duracao + ' minutos' : 'Não informado'}<br>
        <strong>KM Percorrida:</strong> ${interacao.kmPercorrida || 0} km<br>
        <strong>Data:</strong> ${new Date(interacao.dataInteracao + ' ' + interacao.horarioInteracao).toLocaleString('pt-BR')}<br>
        <strong>Descrição:</strong> ${interacao.descricao || 'Não informado'}<br>
        <strong>Próximos Passos:</strong> ${interacao.proximosPassos || 'Não informado'}
    `;
    
    showAlert(detalhes, 'info');
}

// Editar cliente (função básica)
function editarCliente(clienteId) {
    showAlert('Funcionalidade de edição será implementada em breve!', 'info');
}

// Voltar para detalhes do cliente
function voltarDetalhesCliente() {
    if (clienteAtual) {
        showPage('cliente-detalhes');
    } else {
        showPage('home');
    }
}

// Alertas
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}
