# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Definir argumento de build para a URL da API
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copiar package.json
COPY package*.json ./

# Instalar pnpm e dependências
RUN npm install -g pnpm
RUN pnpm install

# Copiar código fonte
COPY . .

# Build da aplicação
# O Vite usará automaticamente a variável de ambiente VITE_API_URL
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

