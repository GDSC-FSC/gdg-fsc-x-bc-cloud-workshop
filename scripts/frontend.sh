#!/usr/bin/env bash
set -euo pipefail

# Frontend Docker Management Script
# Usage: ./scripts/frontend-docker.sh [build|run|stop|logs|shell]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
IMAGE_NAME="gdg-frontend:latest"
CONTAINER_NAME="frontend"
PORT="${PORT:-3000}"
API_URL="${VITE_API_URL:-http://localhost:8080}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
  echo -e "${GREEN}▶ $*${NC}"
}

warn() {
  echo -e "${YELLOW}⚠ $*${NC}"
}

error() {
  echo -e "${RED}✖ $*${NC}"
  exit 1
}

build() {
  log "Building frontend Docker image..."
  docker build -t "$IMAGE_NAME" "$FRONTEND_DIR" || error "Build failed"
  log "Build complete: $IMAGE_NAME"
}

run() {
  # Check if container already exists
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    warn "Container '$CONTAINER_NAME' already exists. Removing..."
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1
  fi

  log "Starting frontend container..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:3000" \
    -e VITE_API_URL="$API_URL" \
    --restart unless-stopped \
    "$IMAGE_NAME" || error "Failed to start container"
  
  log "Frontend running at http://localhost:$PORT"
  log "View logs with: $0 logs"
}

stop() {
  log "Stopping frontend container..."
  docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || warn "Container not running"
  docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || warn "Container doesn't exist"
  log "Frontend stopped and removed"
}

logs() {
  docker logs -f "$CONTAINER_NAME"
}

shell() {
  log "Opening shell in container..."
  docker exec -it "$CONTAINER_NAME" /bin/sh
}

status() {
  if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log "Frontend is running"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  else
    warn "Frontend is not running"
  fi
}

case "${1:-}" in
  build)
    build
    ;;
  run)
    run
    ;;
  start)
    build
    run
    ;;
  stop)
    stop
    ;;
  restart)
    stop
    build
    run
    ;;
  logs)
    logs
    ;;
  shell)
    shell
    ;;
  status)
    status
    ;;
  *)
    echo "Frontend Docker Management Script"
    echo ""
    echo "Usage: $0 {build|run|start|stop|restart|logs|shell|status}"
    echo ""
    echo "Commands:"
    echo "  build    - Build the Docker image"
    echo "  run      - Run the container (requires pre-built image)"
    echo "  start    - Build and run (full setup)"
    echo "  stop     - Stop and remove the container"
    echo "  restart  - Rebuild and restart the container"
    echo "  logs     - View container logs (follow mode)"
    echo "  shell    - Open a shell in the running container"
    echo "  status   - Check if container is running"
    echo ""
    echo "Environment variables:"
    echo "  PORT           - Host port to expose (default: 3000)"
    echo "  VITE_API_URL   - Backend API URL (default: http://localhost:8080)"
    echo ""
    echo "Examples:"
    echo "  $0 start                                    # Build and run"
    echo "  PORT=8080 $0 run                           # Run on port 8080"
    echo "  VITE_API_URL=http://api:8080 $0 restart   # Restart with API URL"
    exit 1
    ;;
esac
