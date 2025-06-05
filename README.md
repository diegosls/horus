Projeto Horus: Registro de Incidentes de Rede
Descrição do Projeto

Aplicação web para simular um sistema de registro e gerenciamento de incidentes de rede. Desenvolvido com frontend (HTML, CSS, JavaScript) e um backend mockado (json-server) para persistência de dados localmente. Possui interface moderna com tema escuro.
Funcionalidades
Gestão de Usuários

    Registro de Usuários: Criar novas contas.
    Login: Acessar a área restrita.
    Controle de Acesso: Página de incidentes protegida por login.
    Logout: Sair da conta.

Gestão de Incidentes de Rede

    Criar (C): Registrar novos incidentes (data/hora, tipo, descrição, status).
    Ler (R): Listar todos os incidentes registrados.
    Excluir (D): Remover incidentes da lista.

Tecnologias 

    HTML5
    CSS3 (com Bootstrap 5 e Variáveis CSS)
    JavaScript (ES6+)
    Google Fonts (Poppins, Montserrat)
    JSON Server (para backend fake)
    Git & GitHub

Como Executar o Projeto Localmente
Pré-requisitos

Node.js e npm instalados.

Passos
instale o json server

    npm install -g json-server



Crie/Verifique o db.json: Na pasta data/, certifique-se de que db.json possui:
JSON

{ "users": [{ "id": 1, "username": "admin", "password": "123" }], "incidents": [] }

Inicie o Backend Fake (json-server): No terminal, na pasta raiz do projeto:
Bash

    json-server --watch data/db.json --port 3000

    Mantenha este terminal aberto.
    Inicie o Frontend (Live Server): Use a extensão "Live Server" no VS Code. Clique direito em index.html e "Open with Live Server". Acesse a aplicação em http://127.0.0.1:5500.

Guia de Uso

    Login Padrão: admin / 123.
    Registro: Clique em "Não tem uma conta? Registre-se aqui".
    Dashboard: Após o login, adicione e gerencie incidentes.

Próximos Passos e Melhorias Futuras

    Implementar funcionalidades de Atualização (U) para incidentes e usuários.
    Adicionar filtros e pesquisa na lista de incidentes.
    Integrar com um backend e banco de dados reais para produção.

Autor

    diegosls

