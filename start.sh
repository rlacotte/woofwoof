#!/bin/bash
# WoofWoof - Script de lancement
# Usage: ./start.sh

echo "🐾 ============================================"
echo "🐾  WoofWoof - Le Tinder pour chiens"
echo "🐾 ============================================"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1) Install backend dependencies
echo "📦 Installation des dépendances backend..."
cd "$PROJECT_DIR/backend"
pip3 install -r requirements.txt --quiet 2>/dev/null || pip install -r requirements.txt --quiet

# 2) Seed the database
echo "🌱 Initialisation de la base de données..."
cd "$PROJECT_DIR/backend"
python3 seed_data.py 2>/dev/null || python seed_data.py

# 3) Install frontend dependencies
echo "📦 Installation des dépendances frontend..."
cd "$PROJECT_DIR/frontend"
npm install --silent 2>/dev/null

# 4) Start backend
echo ""
echo "🚀 Démarrage du backend (port 8001)..."
cd "$PROJECT_DIR/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

# 5) Start frontend
echo "🚀 Démarrage du frontend (port 3000)..."
cd "$PROJECT_DIR/frontend"
PORT=3000 npm start &
FRONTEND_PID=$!

echo ""
echo "🐾 ============================================"
echo "🐾  WoofWoof est lancé !"
echo "🐾"
echo "🐾  Frontend : http://localhost:3000"
echo "🐾  Backend  : http://localhost:8000"
echo "🐾  API Docs : http://localhost:8000/docs"
echo "🐾"
echo "🐾  Compte démo : marie@example.com / demo1234"
echo "🐾 ============================================"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter..."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
