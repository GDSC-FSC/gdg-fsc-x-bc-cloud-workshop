#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🧹 Cleaning build artifacts..."

# Clean API
if [ -d "api/build" ]; then
    echo "  → Removing api/build/"
    rm -rf api/build
fi

# Clean Frontend
if [ -d "frontend/dist" ]; then
    echo "  → Removing frontend/dist/"
    rm -rf frontend/dist
fi
if [ -d "frontend/node_modules" ]; then
    echo "  → Removing frontend/node_modules/"
    rm -rf frontend/node_modules
fi

echo ""
echo "🐳 Cleaning Docker resources..."

# Stop and remove containers
for container in postgres api frontend; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "  → Stopping and removing container: $container"
        docker rm -f "$container" 2>/dev/null || true
    fi
done

# Optional: Remove volumes (commented out for safety)
# echo "  → Removing Docker volumes..."
# docker volume rm pgdata 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💡 To also remove Docker volumes, run:"
echo "   docker volume rm pgdata"
