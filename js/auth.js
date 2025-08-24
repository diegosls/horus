document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    const registerUserForm = document.getElementById('registerUserForm');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');

    const mainContent = document.getElementById('mainContent');

    const navLogoutRegister = document.getElementById('navLogoutRegister');
    const navLogoutRegisterUser = document.getElementById('navLogoutRegisterUser');

    const API_BASE_URL = 'http://localhost:3000/api';

    // --- JWT Helpers ---
    function setToken(token) { localStorage.setItem('jwtToken', token); }
    function getToken() { return localStorage.getItem('jwtToken'); }
    function clearToken() { localStorage.removeItem('jwtToken'); }

    function isLoggedIn() { return !!getToken(); }

    function updateNavbarLinks() {
        const logged = isLoggedIn();
        if (navLogoutRegister) navLogoutRegister.classList.toggle('d-none', !logged);
        if (navLogoutRegisterUser) navLogoutRegisterUser.classList.toggle('d-none', !logged);
    }

    async function registerUser(username, password, confirmPassword) {
        if (password !== confirmPassword) {
            registerError.textContent = 'As senhas não coincidem.';
            registerError.classList.remove('d-none');
            registerSuccess.classList.add('d-none');
            return false;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error('Erro ao registrar usuário');

            registerSuccess.textContent = 'Usuário registrado com sucesso! Faça login.';
            registerSuccess.classList.remove('d-none');
            registerError.classList.add('d-none');
            return true;
        } catch (err) {
            registerError.textContent = 'Erro ao registrar usuário.';
            registerError.classList.remove('d-none');
            registerSuccess.classList.add('d-none');
            console.error(err);
            return false;
        }
    }

    async function login(username, password) {
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error('Usuário ou senha inválidos');
            const data = await res.json();
            setToken(data.token);
            updateNavbarLinks();
            window.location.href = 'register.html';
        } catch (err) {
            if (loginError) {
                loginError.textContent = 'Usuário ou senha inválidos.';
                loginError.classList.remove('d-none');
            }
            console.error(err);
        }
    }

    function logout() {
        clearToken();
        updateNavbarLinks();
        window.location.href = 'index.html';
    }

    function setupLogoutButtons() {
        const buttons = [
            document.getElementById('logoutButtonRegister'),
            document.getElementById('logoutButtonRegisterUser'),
            document.getElementById('logoutButtonLogin'),
            document.getElementById('logoutButtonIndex')
        ];

        buttons.forEach(btn => {
            if (btn) btn.addEventListener('click', e => { e.preventDefault(); logout(); });
        });
    }

    // --- Incidentes ---
    async function fetchIncidents() {
        try {
            const res = await fetch(`${API_BASE_URL}/incidents`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            if (!res.ok) throw new Error('Erro ao buscar incidentes');
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function addIncident(title, description, date, time, type) {
        try {
            const res = await fetch(`${API_BASE_URL}/incidents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({ title, description, date, time, type })
            });
            if (!res.ok) throw new Error('Erro ao registrar incidente');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async function renderIncidentDashboard() {
        if (!mainContent) return;
        if (!isLoggedIn()) { window.location.href = 'login.html'; return; }

        mainContent.innerHTML = `
            <section class="mb-5">
                <h2>Registrar Novo Incidente</h2>
                <form id="incidentForm">
                    <div class="mb-3">
                        <label for="incidentDate" class="form-label">Data do Incidente:</label>
                        <input type="text" class="form-control" id="incidentDate" required>
                    </div>
                    <div class="mb-3">
                        <label for="incidentTime" class="form-label">Hora do Incidente:</label>
                        <input type="text" class="form-control" id="incidentTime" required>
                    </div>
                    <div class="mb-3">
                        <label for="incidentType" class="form-label">Tipo de Incidente:</label>
                        <select class="form-select" id="incidentType" required>
                            <option value="" disabled selected>Selecione o tipo de incidente</option>
                            <option value="hardware">Hardware</option>
                            <option value="software">Software</option>
                            <option value="rede">Rede</option>
                            <option value="seguranca">Segurança</option>
                            <option value="outros">Outros</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="title" class="form-label">Título:</label>
                        <input type="text" class="form-control" id="title" required>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">Descrição:</label>
                        <textarea class="form-control" id="description" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Registrar Incidente</button>
                </form>
            </section>
            <hr>
            <section>
                <h2>Incidentes Registrados</h2>
                <div id="incidentList" class="row">
                    <p id="noIncidentsMessage" class="text-muted text-center">Carregando incidentes...</p>
                </div>
            </section>
        `;
        
        // Inicializa Flatpickr para data e hora
        flatpickr("#incidentDate", {
            dateFormat: "Y-m-d",
        });

        flatpickr("#incidentTime", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true
        });

        const incidentForm = document.getElementById('incidentForm');
        const incidentList = document.getElementById('incidentList');

        incidentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const date = document.getElementById('incidentDate').value;
            const time = document.getElementById('incidentTime').value;
            const type = document.getElementById('incidentType').value;

            const incident = await addIncident(title, description, date, time, type);
            if (incident) {
                incidentForm.reset();
                await loadIncidents();
            }
        });

        async function loadIncidents() {
            const incidents = await fetchIncidents();
            if (incidents.length === 0) {
                incidentList.innerHTML = `<p class="text-muted text-center">Nenhum incidente registrado ainda.</p>`;
            } else {
                incidentList.innerHTML = '';
                incidents.forEach(inc => {
                    const div = document.createElement('div');
                    div.className = 'col-md-4 mb-3';
                    div.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${inc.title}</h5>
                                <p class="card-text">${inc.description}</p>
                                <small class="text-primary">
                                    Tipo: ${inc.type || 'N/A'} | Data: ${new Date(inc.date).toLocaleDateString()} | Hora: ${inc.time || 'N/A'}
                                </small>
                            </div>
                        </div>
                    `;
                    incidentList.appendChild(div);
                });
            }
        }

        loadIncidents();
    }

    // --- Inicialização ---
    updateNavbarLinks();
    setupLogoutButtons();

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }

    if (registerUserForm) {
        registerUserForm.addEventListener('submit', async e => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const success = await registerUser(username, password, confirmPassword);
            if (success) registerUserForm.reset();
        });
    }

    if (mainContent) {
        renderIncidentDashboard();
    }
});