#!/bin/bash

echo "🚀 Setting up Replit Environment..."

# 1. Install Python Dependencies
echo "📦 Installing Python packages..."
pip install -r requirements.txt

# 2. Build Frontend (if not already built)
if [ ! -d "frontend/dist" ]; then
    echo "🎨 Building Frontend..."
    cd frontend
    npm install
    # We unset VITE_API_URL so it uses relative paths (same origin)
    unset VITE_API_URL
    npm run build
    cd ..
else
    echo "✅ Frontend already built. Skipping build (delete frontend/dist to force rebuild)."
fi

# 3. Start Server
echo "🔥 Starting Server..."
# Replit usually provides PORT env var, or we default to 8080 or 3000
python3 app.py
