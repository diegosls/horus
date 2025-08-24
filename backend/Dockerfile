FROM node:18

# Instalar netcat
RUN apt-get update && apt-get install -y netcat-openbsd

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar o restante do código
COPY . .

# Dar permissão de execução ao entrypoint
RUN chmod +x entrypoint.sh

# Porta do servidor
EXPOSE 3000

# Usar o entrypoint
ENTRYPOINT ["./entrypoint.sh"]