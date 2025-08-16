# Sistema de Gestão de Reforma Residencial

## Visão Geral

O Sistema de Gestão de Reforma Residencial é uma aplicação web completa desenvolvida para substituir planilhas Excel na gestão de projetos de reforma. O sistema oferece uma solução moderna, responsiva e segura para controle de projetos, ordens de serviço, materiais, fornecedores e custos.

### Características Principais

- **Interface Responsiva**: PWA (Progressive Web App) otimizada para dispositivos móveis e desktop
- **Autenticação Segura**: Sistema JWT com controle de permissões por roles
- **Gestão Completa**: Projetos, ordens de serviço, materiais, fornecedores e anexos
- **Upload de Arquivos**: Preservação de metadados EXIF para fotos
- **Sistema de Logs**: Auditoria completa de todas as alterações
- **Checklists Personalizáveis**: Templates para diferentes tipos de serviço
- **Relatórios**: Exportação de dados e geração de PDFs

## Stack Tecnológica

### Frontend
- **React 19** - Framework JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes de interface
- **PWA** - Progressive Web App
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Multer** - Upload de arquivos
- **bcryptjs** - Hash de senhas

### DevOps
- **Docker Compose** - Orquestração de containers
- **Jest** - Framework de testes
- **Nodemon** - Hot reload em desenvolvimento

## Estrutura do Projeto

```
reforma-residencial/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configurações do banco
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── middleware/     # Middlewares (auth, logs)
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rotas da API
│   │   ├── tests/          # Testes unitários
│   │   └── server.js       # Servidor principal
│   ├── uploads/            # Arquivos enviados
│   └── package.json
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos (Auth)
│   │   ├── lib/           # Utilitários e API client
│   │   ├── pages/         # Páginas da aplicação
│   │   └── App.jsx        # Componente principal
│   └── package.json
├── docker-compose.yml      # Orquestração Docker
└── README.md              # Esta documentação
```

## Modelagem de Dados

O sistema utiliza 8 tabelas principais:

### Tabela: users
Gerenciamento de usuários do sistema com diferentes níveis de acesso.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| nome | STRING | Nome completo do usuário |
| email | STRING | Email único para login |
| password | STRING | Senha hasheada com bcrypt |
| role | ENUM | Papel: admin, gestor, tecnico, visualizador |

### Tabela: projects
Projetos de reforma com informações básicas e cronograma.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| nome | STRING | Nome do projeto |
| endereco | TEXT | Endereço da obra |
| descricao | TEXT | Descrição detalhada |
| cliente | STRING | Nome do cliente |
| status | ENUM | planejado, em_andamento, pausado, concluido, cancelado |
| data_inicio | DATE | Data de início prevista |
| data_previsao_fim | DATE | Data de conclusão prevista |

### Tabela: work_orders
Ordens de serviço vinculadas aos projetos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| project_id | INTEGER | FK para projects |
| titulo | STRING | Título da ordem de serviço |
| descricao | TEXT | Descrição detalhada |
| tipo_servico | STRING | Tipo de serviço (ex: marcenaria, elétrica) |
| status | ENUM | planejada, em_andamento, pausada, concluida, cancelada |
| data_abertura | DATE | Data de criação |
| data_prevista_inicio | DATE | Início previsto |
| data_prevista_fim | DATE | Fim previsto |
| responsavel_id | INTEGER | FK para users |
| custo_estimado | DECIMAL | Custo estimado |
| custo_real | DECIMAL | Custo real |

### Tabela: checkpoints
Checklists personalizáveis para controle de qualidade.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| work_order_id | INTEGER | FK para work_orders |
| nome | STRING | Nome do checkpoint |
| descricao | TEXT | Descrição |
| ordem | INTEGER | Ordem de execução |
| tipo | ENUM | inspecao, seguranca, qualidade |
| padrao_json | JSON | Configurações personalizadas |
| concluido | BOOLEAN | Status de conclusão |
| data_conclusao | DATE | Data de conclusão |

### Tabela: materials
Catálogo de materiais com controle de estoque.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| nome | STRING | Nome do material |
| unidade | STRING | Unidade de medida |
| custo_unitario | DECIMAL | Custo por unidade |
| estoque | INTEGER | Quantidade em estoque |

### Tabela: material_usages
Uso de materiais nas ordens de serviço.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| work_order_id | INTEGER | FK para work_orders |
| material_id | INTEGER | FK para materials |
| quantidade | INTEGER | Quantidade utilizada |
| custo_total | DECIMAL | Custo total calculado |

### Tabela: vendors
Cadastro de fornecedores e prestadores de serviço.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| nome | STRING | Nome do fornecedor |
| cpf_cnpj | STRING | Documento |
| contato | STRING | Telefone/email |
| endereco | TEXT | Endereço completo |

### Tabela: attachments
Arquivos anexados às ordens de serviço.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| work_order_id | INTEGER | FK para work_orders |
| tipo | ENUM | foto, nota, perm |
| file_path | STRING | Caminho do arquivo |
| uploaded_by | INTEGER | FK para users |
| uploaded_at | DATE | Data do upload |
| metadata | JSON | Metadados EXIF e informações do arquivo |

### Tabela: logs
Sistema de auditoria para rastreamento de alterações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| entity | STRING | Entidade alterada |
| entity_id | INTEGER | ID da entidade |
| action | STRING | Ação realizada (CREATE, UPDATE, DELETE) |
| user_id | INTEGER | FK para users |
| timestamp | DATE | Data/hora da ação |
| old_value | JSON | Valor anterior |
| new_value | JSON | Novo valor |

## Sistema de Permissões

O sistema implementa controle de acesso baseado em roles (RBAC):

### Roles Disponíveis

1. **admin**: Acesso completo ao sistema
2. **gestor**: Gerenciamento de projetos e equipe
3. **tecnico**: Execução de ordens de serviço
4. **visualizador**: Apenas leitura

### Matriz de Permissões

| Funcionalidade | Admin | Gestor | Técnico | Visualizador |
|----------------|-------|--------|---------|--------------|
| Criar/Editar Projetos | ✅ | ✅ | ❌ | ❌ |
| Visualizar Projetos | ✅ | ✅ | ✅ | ✅ |
| Criar/Editar OS | ✅ | ✅ | ✅ | ❌ |
| Gerenciar Materiais | ✅ | ✅ | ✅ | ❌ |
| Gerenciar Fornecedores | ✅ | ✅ | ❌ | ❌ |
| Upload de Anexos | ✅ | ✅ | ✅ | ❌ |
| Relatórios | ✅ | ✅ | ❌ | ❌ |
| Configurações | ✅ | ❌ | ❌ | ❌ |




## Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou pnpm
- Git

### Instalação Local

#### 1. Clone o repositório
```bash
git clone <repository-url>
cd reforma-residencial
```

#### 2. Configure o banco de dados PostgreSQL
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco e usuário
sudo -u postgres psql -c "CREATE DATABASE reforma_residencial;"
sudo -u postgres psql -c "CREATE USER reforma_user WITH PASSWORD 'reforma_pass123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE reforma_residencial TO reforma_user;"
```

#### 3. Configurar Backend
```bash
cd backend
npm install

# Configurar variáveis de ambiente
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=reforma_residencial
export DB_USER=reforma_user
export DB_PASSWORD=reforma_pass123
export JWT_SECRET=reforma_jwt_secret_key_2025
export NODE_ENV=development

# Iniciar servidor
npm run dev
```

#### 4. Configurar Frontend
```bash
cd frontend
pnpm install

# Configurar variável de ambiente
export VITE_API_URL=http://localhost:3001

# Iniciar aplicação
pnpm run dev --host
```

#### 5. Acessar o sistema
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Instalação com Docker Compose

#### 1. Configurar Docker Compose
```bash
# Criar arquivo .env
cat > .env << EOF
DB_HOST=postgres
DB_PORT=5432
DB_NAME=reforma_residencial
DB_USER=reforma_user
DB_PASSWORD=reforma_pass123
JWT_SECRET=reforma_jwt_secret_key_2025
NODE_ENV=development
VITE_API_URL=http://localhost:3001
EOF
```

#### 2. Executar containers
```bash
docker-compose up -d
```

#### 3. Verificar status
```bash
docker-compose ps
docker-compose logs
```

### Primeiro Acesso

#### Criar usuário administrador
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Administrador",
    "email": "admin@empresa.com",
    "password": "senha_segura",
    "role": "admin"
  }'
```

#### Fazer login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "senha_segura"
  }'
```

## API Endpoints

### Autenticação

#### POST /api/auth/register
Registrar novo usuário.

**Request Body:**
```json
{
  "nome": "Nome Completo",
  "email": "email@exemplo.com",
  "password": "senha123",
  "role": "admin|gestor|tecnico|visualizador"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nome": "Nome Completo",
    "email": "email@exemplo.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/login
Fazer login no sistema.

**Request Body:**
```json
{
  "email": "email@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nome": "Nome Completo",
    "email": "email@exemplo.com",
    "role": "admin"
  }
}
```

#### GET /api/auth/profile
Obter perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "nome": "Nome Completo",
    "email": "email@exemplo.com",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Projetos

#### POST /api/projects
Criar novo projeto.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nome": "Casa da Silva",
  "endereco": "Rua das Flores, 123",
  "descricao": "Reforma completa da casa",
  "cliente": "João Silva",
  "data_inicio": "2025-01-15",
  "data_previsao_fim": "2025-06-15"
}
```

**Response:**
```json
{
  "message": "Projeto criado com sucesso",
  "project": {
    "id": 1,
    "nome": "Casa da Silva",
    "endereco": "Rua das Flores, 123",
    "descricao": "Reforma completa da casa",
    "cliente": "João Silva",
    "status": "planejado",
    "data_inicio": "2025-01-15T00:00:00.000Z",
    "data_previsao_fim": "2025-06-15T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/projects
Listar projetos com paginação e filtros.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `status`: Filtrar por status
- `search`: Buscar por nome, cliente ou endereço

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "nome": "Casa da Silva",
      "cliente": "João Silva",
      "status": "planejado",
      "workOrders": [
        {
          "id": 1,
          "titulo": "Troca de janelas",
          "status": "planejada",
          "responsavel": {
            "id": 2,
            "nome": "Técnico João"
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### GET /api/projects/:id
Obter projeto por ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "project": {
    "id": 1,
    "nome": "Casa da Silva",
    "endereco": "Rua das Flores, 123",
    "descricao": "Reforma completa da casa",
    "cliente": "João Silva",
    "status": "planejado",
    "data_inicio": "2025-01-15T00:00:00.000Z",
    "data_previsao_fim": "2025-06-15T00:00:00.000Z",
    "workOrders": [
      {
        "id": 1,
        "titulo": "Troca de janelas",
        "status": "planejada",
        "responsavel": {
          "id": 2,
          "nome": "Técnico João"
        }
      }
    ]
  }
}
```

#### PUT /api/projects/:id
Atualizar projeto.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nome": "Casa da Silva - Atualizado",
  "status": "em_andamento",
  "data_inicio": "2025-01-20"
}
```

#### DELETE /api/projects/:id
Excluir projeto.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Projeto excluído com sucesso"
}
```

#### GET /api/projects/:id/stats
Obter estatísticas do projeto.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "total_work_orders": 5,
    "work_orders_by_status": {
      "planejada": 2,
      "em_andamento": 2,
      "concluida": 1
    },
    "total_custo_estimado": 15000.00,
    "total_custo_real": 12500.00
  }
}
```

### Ordens de Serviço

#### POST /api/work_orders
Criar nova ordem de serviço.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "project_id": 1,
  "titulo": "Troca 3 janelas",
  "descricao": "Trocar 3 janelas do quarto - esquadrias em alumínio",
  "tipo_servico": "marcenaria/vidraceiro",
  "data_prevista_inicio": "2025-08-20",
  "data_prevista_fim": "2025-08-22",
  "responsavel_id": 2,
  "custo_estimado": 3000.00,
  "materiais": [
    {
      "material_id": 5,
      "quantidade": 3
    }
  ]
}
```

**Response:**
```json
{
  "message": "Ordem de serviço criada com sucesso",
  "workOrder": {
    "id": 1,
    "project_id": 1,
    "titulo": "Troca 3 janelas",
    "descricao": "Trocar 3 janelas do quarto - esquadrias em alumínio",
    "tipo_servico": "marcenaria/vidraceiro",
    "status": "planejada",
    "data_prevista_inicio": "2025-08-20T00:00:00.000Z",
    "data_prevista_fim": "2025-08-22T00:00:00.000Z",
    "responsavel_id": 2,
    "custo_estimado": 3000.00,
    "custo_real": 0.00,
    "project": {
      "id": 1,
      "nome": "Casa da Silva"
    },
    "responsavel": {
      "id": 2,
      "nome": "Técnico João"
    },
    "materialUsages": [
      {
        "id": 1,
        "material_id": 5,
        "quantidade": 3,
        "custo_total": 450.00,
        "material": {
          "id": 5,
          "nome": "Janela Alumínio",
          "unidade": "un",
          "custo_unitario": 150.00
        }
      }
    ]
  }
}
```

#### GET /api/work_orders
Listar ordens de serviço com filtros.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `status`: Filtrar por status
- `project_id`: Filtrar por projeto
- `responsavel_id`: Filtrar por responsável
- `search`: Buscar por título, descrição ou tipo de serviço

#### GET /api/work_orders/:id
Obter ordem de serviço por ID.

#### PUT /api/work_orders/:id
Atualizar ordem de serviço.

#### DELETE /api/work_orders/:id
Excluir ordem de serviço.

#### GET /api/work_orders/:id/stats
Obter estatísticas da ordem de serviço.

### Materiais

#### POST /api/materials
Criar novo material.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nome": "Cimento CP-II",
  "unidade": "saco",
  "custo_unitario": 25.50,
  "estoque": 100
}
```

#### GET /api/materials
Listar materiais.

#### GET /api/materials/:id
Obter material por ID.

#### PUT /api/materials/:id
Atualizar material.

#### DELETE /api/materials/:id
Excluir material.

#### PATCH /api/materials/:id/stock
Atualizar estoque do material.

**Request Body:**
```json
{
  "quantidade": 10,
  "operacao": "add|subtract"
}
```

### Checkpoints

#### POST /api/checkpoints
Criar novo checkpoint.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "work_order_id": 1,
  "nome": "Verificar alinhamento",
  "descricao": "Verificar se as janelas estão alinhadas",
  "ordem": 1,
  "tipo": "qualidade",
  "padrao_json": {
    "criterios": ["alinhamento", "vedacao", "funcionamento"]
  }
}
```

#### GET /api/checkpoints
Listar checkpoints.

**Query Parameters:**
- `work_order_id`: Filtrar por ordem de serviço
- `tipo`: Filtrar por tipo

#### GET /api/checkpoints/:id
Obter checkpoint por ID.

#### PUT /api/checkpoints/:id
Atualizar checkpoint.

#### DELETE /api/checkpoints/:id
Excluir checkpoint.

#### PATCH /api/checkpoints/:id/complete
Marcar checkpoint como concluído.

#### POST /api/checkpoints/templates
Criar template de checklist.

**Request Body:**
```json
{
  "tipo_servico": "troca_janelas",
  "checkpoints": [
    {
      "nome": "Verificar medidas",
      "descricao": "Confirmar medidas antes da instalação",
      "tipo": "inspecao"
    },
    {
      "nome": "Teste de vedação",
      "descricao": "Verificar vedação após instalação",
      "tipo": "qualidade"
    }
  ]
}
```

### Anexos

#### POST /api/attachments/upload
Fazer upload de arquivo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Arquivo a ser enviado
- `work_order_id`: ID da ordem de serviço
- `tipo`: foto|nota|perm

**Response:**
```json
{
  "message": "Arquivo enviado com sucesso",
  "attachment": {
    "id": 1,
    "work_order_id": 1,
    "tipo": "foto",
    "file_path": "/uploads/file-123456789.jpg",
    "uploaded_by": 1,
    "uploaded_at": "2025-01-01T00:00:00.000Z",
    "metadata": {
      "file": {
        "originalName": "janela_instalada.jpg",
        "size": 2048576,
        "mimetype": "image/jpeg"
      },
      "exif": {
        "dateTime": "2025-01-01T12:00:00.000Z",
        "gps": {
          "latitude": -23.5505,
          "longitude": -46.6333
        },
        "camera": {
          "make": "Apple",
          "model": "iPhone 12"
        },
        "dimensions": {
          "width": 4032,
          "height": 3024
        }
      }
    },
    "uploader": {
      "id": 1,
      "nome": "Técnico João"
    },
    "workOrder": {
      "id": 1,
      "titulo": "Troca 3 janelas"
    }
  }
}
```

#### GET /api/attachments
Listar anexos.

**Query Parameters:**
- `work_order_id`: Filtrar por ordem de serviço
- `tipo`: Filtrar por tipo

#### GET /api/attachments/:id
Obter anexo por ID.

#### GET /api/attachments/:id/download
Fazer download do arquivo.

#### DELETE /api/attachments/:id
Excluir anexo.

### Fornecedores

#### POST /api/vendors
Criar novo fornecedor.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nome": "Vidraçaria Silva",
  "cpf_cnpj": "12.345.678/0001-90",
  "contato": "(11) 98765-4321",
  "endereco": "Rua das Vidraças, 456"
}
```

#### GET /api/vendors
Listar fornecedores.

#### GET /api/vendors/:id
Obter fornecedor por ID.

#### PUT /api/vendors/:id
Atualizar fornecedor.

#### DELETE /api/vendors/:id
Excluir fornecedor.

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |

## Tratamento de Erros

Todas as respostas de erro seguem o padrão:

```json
{
  "error": "Descrição do erro"
}
```

### Erros Comuns

#### 401 - Token de acesso requerido
```json
{
  "error": "Token de acesso requerido"
}
```

#### 401 - Token inválido
```json
{
  "error": "Token inválido"
}
```

#### 403 - Acesso negado
```json
{
  "error": "Acesso negado. Permissão insuficiente."
}
```

#### 404 - Recurso não encontrado
```json
{
  "error": "Projeto não encontrado"
}
```

#### 400 - Dados inválidos
```json
{
  "error": "Email já está em uso"
}
```

