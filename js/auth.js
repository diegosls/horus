// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página de Login
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // Elementos da página de Registro de Usuário
    const registerUserForm = document.getElementById('registerUserForm');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');

    // Elementos da página de Registro de Incidentes (para proteção e logout)
    const mainContent = document.getElementById('mainContent');

    // Elementos da barra de navegação (novo)
    const navLogin = document.getElementById('navLogin'); // Se você tivesse um link de login na navbar
    const navRegisterUser = document.getElementById('navRegisterUser'); // Se você tivesse um link de registro na navbar
    const navLogoutIndex = document.getElementById('navLogoutIndex');
    const navLogoutLogin = document.getElementById('navLogoutLogin');
    const navLogoutRegisterUser = document.getElementById('navLogoutRegisterUser');
    const navLogoutRegister = document.getElementById('navLogoutRegister'); // Este já existia

    const API_BASE_URL = 'http://localhost:3000'; // URL base do seu json-server

    // --- Funções de Autenticação e Usuários ---

    async function fetchUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) throw new Error('Erro ao buscar usuários da API.');
            return await response.json();
        } catch (error) {
            console.error('Erro de rede ou API:', error);
            return []; // Retorna array vazio em caso de erro para não travar a aplicação
        }
    }

    function isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    // Função para atualizar a visibilidade dos botões de login/logout na navbar
    function updateNavbarLinks() {
        const loggedIn = isLoggedIn();

        // Links de Sair (tornar visíveis se logado)
        if (navLogoutIndex) navLogoutIndex.classList.toggle('d-none', !loggedIn);
        if (navLogoutLogin) navLogoutLogin.classList.toggle('d-none', !loggedIn);
        if (navLogoutRegisterUser) navLogoutRegisterUser.classList.toggle('d-none', !loggedIn);
        if (navLogoutRegister) navLogoutRegister.classList.toggle('d-none', !loggedIn);

        // Links de Login/Registro (tornar visíveis se DESlogado)
        // Se você tivesse links diretos para login/registro na navbar que não estivessem na tela atual
        // Ex: if (navLogin) navLogin.classList.toggle('d-none', loggedIn);
        // Ex: if (navRegisterUser) navRegisterUser.classList.toggle('d-none', loggedIn);
    }

    async function login(username, password) {
        const users = await fetchUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', username);
            updateNavbarLinks(); // Atualiza a navbar após o login
            window.location.href = 'register.html';
        } else {
            if (loginError) {
                loginError.textContent = 'Usuário ou senha inválidos.';
                loginError.classList.remove('d-none');
            }
        }
    }

    async function registerUser(username, password, confirmPassword) {
        const users = await fetchUsers();
        
        if (password !== confirmPassword) {
            registerError.textContent = 'As senhas não coincidem.';
            registerError.classList.remove('d-none');
            registerSuccess.classList.add('d-none');
            return false;
        }

        if (users.some(u => u.username === username)) {
            registerError.textContent = 'Nome de usuário já existe.';
            registerError.classList.remove('d-none');
            registerSuccess.classList.add('d-none');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error('Erro ao registrar usuário na API.');

            registerSuccess.textContent = 'Usuário registrado com sucesso! Você pode fazer login agora.';
            registerSuccess.classList.remove('d-none');
            registerError.classList.add('d-none');
            return true;
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            registerError.textContent = 'Erro ao registrar usuário. Tente novamente.';
            registerError.classList.remove('d-none');
            registerSuccess.classList.add('d-none');
            return false;
        }
    }

    function logout() {
        localStorage.removeItem('currentUser');
        updateNavbarLinks(); // Atualiza a navbar após o logout
        window.location.href = 'index.html';
    }

    // --- Configura o evento de clique para o botão de sair em todas as páginas ---
    function setupLogoutButtons() {
        const logoutButtons = [
            document.getElementById('logoutButtonIndex'),
            document.getElementById('logoutButtonLogin'),
            document.getElementById('logoutButtonRegisterUser'),
            document.getElementById('logoutButtonRegister')
        ];

        logoutButtons.forEach(button => {
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            }
        });
    }


    // --- Lógica de inicialização para cada página ---

    // Sempre tenta atualizar os links da navbar ao carregar qualquer página
    updateNavbarLinks();
    setupLogoutButtons(); // Configura os event listeners para os botões de logout

    // Lógica específica para a página login.html
    if (loginForm) {
        if (isLoggedIn()) {
            window.location.href = 'register.html';
            return;
        }
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }

    // Lógica específica para a página register_user.html
    if (registerUserForm) {
        if (isLoggedIn()) {
            window.location.href = 'register.html';
            return;
        }
        registerUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            const registrationSuccessful = await registerUser(username, password, confirmPassword);
            if (registrationSuccessful) {
                registerUserForm.reset();
            }
        });
    }

    // Lógica específica para a página register.html (proteção e carregamento de conteúdo)
    if (window.location.pathname.includes('register.html')) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        } else {
            if (mainContent) {
                mainContent.innerHTML = `
                    <section id="addIncidentSection" class="mb-5">
                        <h2>Registrar Novo Incidente</h2>
                        <form id="incidentForm">
                            <div class="mb-3">
                                <label for="date" class="form-label">Data e Hora:</label>
                                <input type="datetime-local" class="form-control" id="date" required>
                            </div>
                            <div class="mb-3">
                                <label for="type" class="form-label">Tipo de Incidente:</label>
                                <input type="text" class="form-control" id="type" placeholder="Ex: Falha de Conexão, Lentidão, Ataque DDoS" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Descrição:</label>
                                <textarea class="form-control" id="description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="status" class="form-label">Status:</label>
                                <select class="form-select" id="status" required>
                                    <option value="aberto">Aberto</option>
                                    <option value="em_andamento">Em Andamento</option>
                                    <option value="resolvido">Resolvido</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-success">Registrar Incidente</button>
                        </form>
                    </section>

                    <hr>

                    <section id="incidentListSection">
                        <h2>Incidentes Registrados</h2>
                        <div id="incidentList" class="row">
                            <p id="noIncidentsMessage" class="text-muted text-center">Nenhum incidente registrado ainda.</p>
                        </div>
                    </section>
                `;
            }
        }
    }
});