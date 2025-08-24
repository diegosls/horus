# Horus - Sistema de Registro e Gestão de Incidentes

## Sobre o Projeto

O **Horus** é um sistema web para registro, consulta e gerenciamento de incidentes.  
Permite que usuários se cadastrem, façam login, registrem novos incidentes e visualizem todos os incidentes cadastrados.  
O backend é feito em Node.js com Express e Prisma ORM, utilizando MySQL como banco de dados.  
O frontend é desenvolvido em HTML, CSS e JavaScript puro.

---

## Funcionalidades

- Cadastro e login de usuários
- Registro de incidentes com título, descrição, data, hora e tipo
- Listagem dos incidentes do usuário
- Interface responsiva e tema escuro

---

## Como Executar

### 1. Banco de Dados

Certifique-se que o MySQL está rodando e as tabelas foram criadas.  
O script SQL para criar as tabelas está em `data/db.sql`.

### 2. Backend

#### Via Docker

1. Na raiz do projeto, execute:
   ```bash
   docker compose up
   ```
2. O backend estará disponível em `http://localhost:3000`.

#### Via Node.js

1. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```
2. Gere o Prisma Client e sincronize o banco:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. Inicie o servidor:
   ```bash
   node server.js
   ```
4. O backend estará disponível em `http://localhost:3000`.

### 3. Frontend

Abra o arquivo `index.html` da pasta do frontend no navegador  
ou utilize uma extensão como "Live Server" no VS Code.

---

## Estrutura do Projeto

```
horus/
├── backend/
│   ├── generated/
│   ├── node_modules/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── .gitignore
│   ├── db.js
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│   ├── routes.js
│   ├── server.js
├── css/
│   ├── auth.css
│   ├── dashboard.css
│   ├── global.css
│   ├── landing.css
├── data/
│   └── db.sql
├── img/
│   └── logo1.png
├── js/
│   └── auth.js
├── docker-compose.yml
├── index.html
├── login.html
├── package.json
├── preview.png
├── README.md
├── register_user.html
├── register.html
```

---

## Observações

- O script `entrypoint.sh` garante que o banco esteja disponível e sincroniza o Prisma antes de iniciar o backend.
- Configure as variáveis de ambiente no arquivo `.env` do backend, incluindo `DATABASE_URL` e `JWT_SECRET`.
- Para dúvidas ou problemas, consulte os logs do backend e