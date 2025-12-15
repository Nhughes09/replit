#!/bin/bash

# Kill any existing processes on ports 8000 or 5173 to avoid conflicts
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "🚀 Regenerating Data..."
python3 -c "from update_data import update_dataset; update_dataset()"

echo "🚀 Starting Local Backend (FastAPI)..."
# Start uvicorn in the background
# Start uvicorn in the background with LOCAL_DEV flag
LOCAL_DEV=true uvicorn app:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "🚀 Starting Local Frontend (Vite)..."
cd frontend
# Overwrite the API URL to point to localhost for this session
export VITE_API_URL=http://127.0.0.1:8000
npm run dev

# When frontend stops, kill backend
kill $BACKEND_PID
