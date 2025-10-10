#!/bin/bash

# Docker Cleanup Script
# Removes all containers, images, and volumes related to the project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧹 Cleaning up Docker resources..."
echo "=================================="
echo ""

cd "$PROJECT_ROOT"

# Stop and remove containers
echo "🛑 Stopping containers..."
docker-compose down -v

# Remove images
echo "🗑️  Removing images..."
docker rmi gdg-api:latest gdg-frontend:latest 2>/dev/null || true

# Remove dangling images
echo "🧹 Removing dangling images..."
docker image prune -f

# Remove unused volumes
echo "📦 Removing unused volumes..."
docker volume prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To start fresh, run: ./scripts/deploy-docker.sh"
