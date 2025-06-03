// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const incidentForm = document.getElementById('incidentForm');
    const incidentList = document.getElementById('incidentList');
    const noIncidentsMessage = document.getElementById('noIncidentsMessage');

    if (!incidentForm) {
        return; // Sai do script se os elementos não estiverem presentes
    }

    let incidents = [];
    const API_BASE_URL = 'http://localhost:3000'; // URL base do seu json-server

    // Função para carregar incidentes da API
    async function loadIncidents() {
        try {
            const response = await fetch(`${API_BASE_URL}/incidents`);
            if (!response.ok) throw new Error('Erro ao buscar incidentes da API.');
            incidents = await response.json();
            renderIncidents();
            console.log('Incidentes carregados da API.');
        } catch (error) {
            console.error('Erro ao carregar incidentes:', error);
            // Em caso de erro, inicia com array vazio e exibe a mensagem
            incidents = [];
            renderIncidents();
        }
    }

    // Função para renderizar os incidentes na tela (quase sem alterações)
    function renderIncidents() {
        incidentList.innerHTML = '';

        if (incidents.length === 0) {
            noIncidentsMessage.style.display = 'block';
            return;
        } else {
            noIncidentsMessage.style.display = 'none';
        }

        incidents.forEach((incident) => { // Removido 'index' pois o ID é o identificador agora
            const incidentCard = document.createElement('div');
            incidentCard.classList.add('col-md-6', 'col-lg-4');
            incidentCard.innerHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${incident.type}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${new Date(incident.date).toLocaleString()}</h6>
                        <p class="card-text">${incident.description}</p>
                        <p class="card-text">Status: <span class="badge ${getStatusClass(incident.status)}">${incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('_', ' ')}</span></p>
                        <button class="btn btn-danger btn-sm mt-2" onclick="deleteIncident(${incident.id})">Excluir</button> </div>
                </div>
            `;
            incidentList.appendChild(incidentCard);
        });
    }

    // Função auxiliar para retornar a classe CSS baseada no status (SEM ALTERAÇÕES)
    function getStatusClass(status) {
        switch (status) {
            case 'aberto':
                return 'status-aberto';
            case 'em_andamento':
                return 'status-em_andamento';
            case 'resolvido':
                return 'status-resolvido';
            default:
                return '';
        }
    }

    // Adiciona um novo incidente (AGORA FAZENDO POST PARA A API)
    incidentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newIncident = {
            date: document.getElementById('date').value,
            type: document.getElementById('type').value,
            description: document.getElementById('description').value,
            status: document.getElementById('status').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/incidents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newIncident)
            });

            if (!response.ok) throw new Error('Erro ao registrar incidente na API.');

            // Recarrega os incidentes para incluir o novo e atualizar a lista
            await loadIncidents();
            incidentForm.reset(); // Limpa o formulário
            console.log('Incidente registrado via API.');
        } catch (error) {
            console.error('Erro ao registrar incidente:', error);
            alert('Erro ao registrar incidente. Verifique o console para mais detalhes.');
        }
    });

    // Função para excluir um incidente (AGORA FAZENDO DELETE PARA A API)
    window.deleteIncident = async (id) => { // Recebe o ID do incidente
        if (confirm('Tem certeza que deseja excluir este incidente?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Erro ao excluir incidente da API.');

                // Recarrega os incidentes após a exclusão
                await loadIncidents();
                console.log('Incidente excluído via API.');
            } catch (error) {
                console.error('Erro ao excluir incidente:', error);
                alert('Erro ao excluir incidente. Verifique o console para mais detalhes.');
            }
        }
    };

    // Carrega os incidentes ao iniciar a página
    loadIncidents();
});