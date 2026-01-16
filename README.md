# Photo For You - API Gateway

API Gateway para orquestrar e rotear requisições para os microserviços do MyGallery.

## 🎯 Responsabilidades

Este serviço é responsável por:
- Roteamento de requisições para os microserviços apropriados
- Autenticação centralizada (validação de JWT)
- Rate limiting global
- Load balancing entre instâncias
- Agregação de respostas de múltiplos serviços
- Cache de respostas quando apropriado
- Logging e monitoramento centralizado

## 🏗️ Arquitetura

- **Framework**: NestJS
- **Porta**: 3000 (porta principal da aplicação)
- **Proxy**: HTTP Proxy para microserviços

## 📦 Instalação

```bash
pnpm install
```

## 🔧 Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Application
PORT=3000
NODE_ENV=development

# Microservices URLs
AUTH_SERVICE_URL=http://localhost:3001
GALLERY_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003

# JWT (deve ser o mesmo do Auth Service)
JWT_SECRET=your-secret-key

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

## 🚀 Execução

### Desenvolvimento
```bash
pnpm start:dev
```

### Produção
```bash
pnpm build
pnpm start:prod
```

## 🔌 Rotas

### Autenticação (proxied para Auth Service)
- `POST /api/auth/register` → Auth Service
- `POST /api/auth/login` → Auth Service
- `POST /api/auth/forgot-password` → Auth Service
- `POST /api/auth/reset-password` → Auth Service
- `POST /api/auth/verify-email` → Auth Service

### Usuários (proxied para Auth Service)
- `GET /api/users/me` → Auth Service
- `PATCH /api/users/me` → Auth Service

### Álbuns (proxied para Gallery Service)
- `GET /api/albums` → Gallery Service
- `POST /api/albums` → Gallery Service
- `GET /api/albums/:id` → Gallery Service
- `PATCH /api/albums/:id` → Gallery Service
- `DELETE /api/albums/:id` → Gallery Service
- `PATCH /api/albums/:id/share` → Gallery Service
- `GET /api/albums/shared/:shareToken` → Gallery Service (público)

### Fotos (proxied para Gallery Service)
- `POST /api/albums/:albumId/photos` → Gallery Service
- `GET /api/albums/:albumId/photos` → Gallery Service
- `GET /api/photos/:id` → Gallery Service
- `PATCH /api/photos/:id` → Gallery Service
- `DELETE /api/photos/:id` → Gallery Service
- `GET /api/photos/search` → Gallery Service

### Notificações (proxied para Notification Service)
- `GET /api/notifications` → Notification Service
- `GET /api/notifications/unread` → Notification Service
- `PATCH /api/notifications/:id/read` → Notification Service
- `PATCH /api/notifications/read-all` → Notification Service
- `DELETE /api/notifications/:id` → Notification Service
- `GET /api/preferences` → Notification Service
- `PATCH /api/preferences` → Notification Service

## 🔐 Segurança

- Validação de JWT em todas as rotas protegidas
- Rate limiting global
- Headers de segurança (Helmet)
- CORS configurado
- Logging de todas as requisições

## 📝 Licença

UNLICENSED
