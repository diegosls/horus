#!/bin/sh

#!/bin/sh

echo "⏳ Aguardando MySQL iniciar..."
until nc -z -v -w30 horus-db 3306; do
  echo "🔁 Aguardando conexão com o banco..."
  sleep 5
done

echo "✅ MySQL está pronto! Iniciando aplicação..."
npm start

echo "✅ Banco disponível!"

# Sincroniza o Prisma
echo "⚡ Rodando Prisma DB Push..."
npx prisma db push

# Inicia o servidor
echo "🚀 Iniciando backend..."
exec node index.js
