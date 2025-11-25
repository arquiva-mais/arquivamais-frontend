# 🚀 Deploy do Frontend - ArquivaMais

## 📋 Pré-requisitos na VPS

- Docker
- Docker Compose
- Git

## 🔧 Deploy na VPS

### 1. Clonar Repositório

```bash
cd /opt
git clone https://github.com/arquiva-mais/arquivamais-frontend.git
cd arquivamais-frontend
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.local.example .env.production

# Editar com suas configurações
nano .env.production
```

**Configuração:**

```env
NEXT_PUBLIC_API_URL=http://67.205.138.215:3001
```

### 3. Executar Deploy

```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh

# Fazer deploy
./scripts/deploy.sh
```

## 📊 Comandos Úteis

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f frontend

# Reiniciar
docker-compose restart frontend

# Parar
docker-compose down

# Atualizar código
git pull origin main
./scripts/deploy.sh
```

## 🔄 Processo de Atualização

```bash
# 1. Puxar alterações
git pull origin main

# 2. Rebuild
docker-compose down
docker-compose up -d --build
```

## 🌐 URLs

- **Frontend**: http://67.205.138.215:3000
- **API Backend**: http://67.205.138.215:3001

## 📝 Notas

- O build pode demorar alguns minutos
- Certifique-se de que a API está rodando
- A porta 3000 deve estar aberta no firewall
