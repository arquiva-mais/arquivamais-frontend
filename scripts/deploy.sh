#!/bin/bash

echo "🚀 Iniciando deploy do Frontend..."

# Verificar se .env.production existe
if [ ! -f .env.production ]; then
    echo "❌ Arquivo .env.production não encontrado!"
    exit 1
fi

# Parar containers antigos
echo "📦 Parando containers antigos..."
docker-compose down

# Build da imagem
echo "🔨 Fazendo build da imagem..."
docker-compose build --no-cache

# Subir container
echo "🚢 Subindo container..."
docker-compose up -d

echo "📋 Status do container:"
docker-compose ps

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 Frontend disponível em: http://localhost:3000"
echo "📊 Logs: docker-compose logs -f frontend"
