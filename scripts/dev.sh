#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🚀 Starting development environment..."
echo ""

# Start database
echo "📦 Setting up database..."
./scripts/db-setup.sh

echo ""
echo "🔥 Starting API in development mode..."
cd api
./gradlew bootRun &
API_PID=$!
cd ..

echo ""
echo "⚡ Starting Frontend in development mode..."
cd frontend
bun run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development environment started!"
echo ""
echo "🌐 Services:"
echo "  • Frontend: http://localhost:3000"
echo "  • API:      http://localhost:8080"
echo "  • Database: localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Trap to kill background processes on exit
trap 'echo ""; echo "🛑 Stopping services..."; kill $API_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM

# Wait for background processes
wait
