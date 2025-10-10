#!/bin/bash

# Docker Build and Deploy Script for GDG FSC x BC Cloud Workshop
# This script builds and deploys all services using Docker Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🐳 GDG FSC x BC Cloud Workshop - Docker Deployment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    echo -e "${YELLOW}📝 Please edit .env file with your Google Maps API key${NC}"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${BLUE}📦 Building Docker images...${NC}"
cd "$PROJECT_ROOT"
docker-compose build --no-cache

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}✅ Services started successfully!${NC}"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo -e "${GREEN}🌐 Application URLs:${NC}"
echo "   Frontend:     http://localhost:3000"
echo "   API:          http://localhost:8080"
echo "   API Health:   http://localhost:8080/actuator/health"
echo "   PostgreSQL:   localhost:5432"
echo ""
echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo "   View logs:        docker-compose logs -f"
echo "   View API logs:    docker-compose logs -f api"
echo "   View frontend logs: docker-compose logs -f frontend"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo ""
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 5

# Check service health
for i in {1..30}; do
    if docker-compose ps | grep -q "healthy"; then
        echo -e "${GREEN}✅ All services are healthy!${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
