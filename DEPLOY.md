# Guia de Deploy

## Deploy Permanente (Produção)

### Opção 1: Deploy Automático com Flask (Recomendado)

O projeto inclui uma versão Flask otimizada para deploy em produção:

```bash
# 1. Usar a versão Flask do projeto
cd backend-deploy

# 2. Ativar ambiente virtual
source venv/bin/activate

# 3. Instalar dependências (se necessário)
pip install -r requirements.txt

# 4. Testar localmente
python src/main.py

# 5. Deploy em plataforma de sua escolha
```

### Opção 2: Deploy com Docker

```bash
# 1. Construir e executar containers
docker-compose up -d

# 2. Verificar status
docker-compose ps

# 3. Ver logs
docker-compose logs -f
```

### Opção 3: Deploy Manual

#### Backend (Node.js + Express)

```bash
# 1. Instalar dependências
cd backend
npm install --production

# 2. Configurar variáveis de ambiente
export DB_HOST=seu_host_postgres
export DB_PORT=5432
export DB_NAME=reforma_residencial
export DB_USER=seu_usuario
export DB_PASSWORD=sua_senha
export JWT_SECRET=sua_chave_secreta_jwt
export NODE_ENV=production

# 3. Iniciar servidor
npm start
```

#### Frontend (React)

```bash
# 1. Instalar dependências
cd frontend
pnpm install

# 2. Configurar API URL
export VITE_API_URL=https://sua-api.com

# 3. Build para produção
pnpm run build

# 4. Servir arquivos estáticos
# Use nginx, Apache, ou qualquer servidor web
```

## Plataformas de Deploy Recomendadas

### 1. Vercel (Frontend)
- Conecte seu repositório GitHub
- Configure variável `VITE_API_URL`
- Deploy automático a cada push

### 2. Railway (Backend)
- Conecte seu repositório GitHub
- Configure variáveis de ambiente
- Inclui PostgreSQL gratuito

### 3. Heroku
- Use o Procfile incluído
- Configure add-on PostgreSQL
- Configure variáveis de ambiente

### 4. DigitalOcean App Platform
- Deploy full-stack em uma plataforma
- Configuração via arquivo de especificação

### 5. AWS/Google Cloud/Azure
- Use serviços gerenciados de banco
- Configure load balancer se necessário
- Use CDN para assets estáticos

## Configuração de Banco de Dados

### PostgreSQL em Produção

```sql
-- Criar banco e usuário
CREATE DATABASE reforma_residencial;
CREATE USER reforma_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE reforma_residencial TO reforma_user;

-- Configurar conexões (postgresql.conf)
max_connections = 100
shared_buffers = 256MB
```

### Backup Automático

```bash
# Script de backup (adicionar ao cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U reforma_user reforma_residencial > backup_$DATE.sql
```

## Monitoramento

### Health Checks

- Backend: `GET /health`
- Retorna: `{"status": "OK", "timestamp": "...", "version": "1.0.0"}`

### Logs

```bash
# Ver logs do backend
tail -f backend/logs/app.log

# Ver logs do Docker
docker-compose logs -f backend
```

### Métricas Recomendadas

- Tempo de resposta da API
- Uso de memória e CPU
- Conexões de banco de dados
- Erros 4xx/5xx
- Uptime do sistema

## SSL/HTTPS

Configure SSL em produção:

```nginx
server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Variáveis de Ambiente de Produção

### Backend
```bash
NODE_ENV=production
DB_HOST=seu_host_postgres
DB_PORT=5432
DB_NAME=reforma_residencial
DB_USER=seu_usuario
DB_PASSWORD=senha_segura
JWT_SECRET=chave_jwt_muito_segura_256_bits
PORT=3001
```

### Frontend
```bash
VITE_API_URL=https://sua-api.com
```

## Checklist de Deploy

- [ ] Banco PostgreSQL configurado
- [ ] Variáveis de ambiente definidas
- [ ] SSL/HTTPS configurado
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Health checks funcionando
- [ ] Logs sendo coletados
- [ ] Domínio personalizado configurado
- [ ] CDN configurado (opcional)
- [ ] Firewall configurado

