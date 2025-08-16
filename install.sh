#!/bin/bash

# Script de instalação do Sistema de Reforma Residencial
# Autor: Manus AI

set -e

echo "🏗️  Sistema de Gestão de Reforma Residencial"
echo "=========================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    echo "   https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. Versão 18+ é necessária."
    exit 1
fi

echo "✅ Node.js $NODE_VERSION encontrado"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm encontrado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL não encontrado."
    echo "   Para instalação no Ubuntu/Debian:"
    echo "   sudo apt update && sudo apt install postgresql postgresql-contrib"
    echo ""
    echo "   Para outras distribuições, consulte: https://postgresql.org/download/"
    echo ""
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ PostgreSQL encontrado"
fi

echo ""
echo "🔧 Instalando dependências..."
echo ""

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd frontend
pnpm install
cd ..

# Instalar concurrently para desenvolvimento
echo "📦 Instalando ferramentas de desenvolvimento..."
npm install

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o banco PostgreSQL (veja README.md)"
echo "2. Configure as variáveis de ambiente"
echo "3. Execute: npm run dev"
echo ""
echo "📖 Para mais informações, consulte o README.md"
echo ""

