#!/bin/bash

# Start script for City Air Watch
# This script starts both the backend and frontend servers

echo "🚀 Starting City Air Watch Servers..."
echo ""

# Check if .env exists in server directory
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env file not found!"
    echo "Please create server/.env with your configuration."
    exit 1
fi

# Start backend server in background
echo "📡 Starting backend server (port 3000)..."
cd server
npm run dev > ../server.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    echo "   Logs: tail -f server.log"
else
    echo "❌ Backend server failed to start. Check server.log for errors."
    exit 1
fi

# Start frontend server
echo ""
echo "🌐 Starting frontend server..."
echo "   Press Ctrl+C to stop both servers"
echo ""

npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT

