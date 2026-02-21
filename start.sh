#!/bin/sh
set -e

echo "⚽ Conectando a la base de datos..."

# AGREGAMOS: --skip-generate
# Esto evita el error de "Cannot find module ... wasm" y hace el arranque más rápido
echo "🚀 Corriendo prisma db push..."
npx prisma db push --skip-generate

# echo "🌱 Sembrando datos (Seeding)..."
# if [ -f ./prisma/seed.js ]; then
#   # El engine ya estará aquí gracias al COPY nuevo
#   node ./prisma/seed.js
# else
#   echo "⚠️ No encontré prisma/seed.js, saltando seed."
# fi

echo "⚡ Arrancando servidor Next.js..."
exec node server.js