# 🐳 Docker Quick Reference

Quick commands for the GDG FSC x BC Cloud Workshop Docker setup.

## 🚀 Quick Start

```bash
# Setup and deploy
cp .env.example .env                    # Copy environment file
# Edit .env with your Google Maps API key
./scripts/deploy-docker.sh              # Deploy all services
```

## 📦 Common Commands

### Start/Stop Services

```bash
docker-compose up -d                    # Start all services
docker-compose up -d --build            # Start with rebuild
docker-compose down                     # Stop all services
docker-compose down -v                  # Stop and remove volumes
docker-compose restart                  # Restart all services
docker-compose restart api              # Restart specific service
```

### View Logs

```bash
docker-compose logs -f                  # Follow all logs
docker-compose logs -f api              # Follow API logs
docker-compose logs -f frontend         # Follow frontend logs
docker-compose logs -f postgres         # Follow database logs
docker-compose logs --tail=100          # Last 100 lines
```

### Check Status

```bash
docker-compose ps                       # List containers
docker stats                            # Resource usage
docker-compose top                      # Running processes
```

### Build Commands

```bash
docker-compose build                    # Build all images
docker-compose build --no-cache         # Clean build
docker-compose build api                # Build specific service
```

## 🔍 Debugging

### Database Commands

```bash
docker exec -it gdg-postgres psql -U postgres              # Connect to DB
docker exec gdg-postgres pg_isready -U postgres            # Check readiness
docker exec gdg-postgres pg_dump -U postgres > backup.sql  # Backup database
```

### Container Inspection

```bash
docker logs gdg-api                     # View API logs
docker inspect gdg-api                  # Inspect API container
docker exec -it gdg-api sh              # Enter API container
docker top gdg-api                      # View processes
```

### Health Checks

```bash
docker inspect gdg-api --format='{{.State.Health.Status}}'      # API health
docker inspect gdg-frontend --format='{{.State.Health.Status}}' # Frontend health
curl http://localhost:8080/actuator/health                      # API health endpoint
curl http://localhost:3000/health                               # Frontend health endpoint
```

## 🧹 Cleanup

```bash
./scripts/docker-clean.sh               # Clean all project resources
docker-compose down -v                  # Remove containers & volumes
docker system prune -a                  # Clean all Docker resources
docker volume prune                     # Remove unused volumes
docker image prune -a                   # Remove unused images
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080 |
| API Health | http://localhost:8080/actuator/health |
| API Docs | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 |

## 📊 Default Credentials

| Service | User | Password | Database |
|---------|------|----------|----------|
| PostgreSQL | postgres | brooklyn | postgres |

## 🔧 Environment Variables

Key variables in `.env`:

```properties
# Database
POSTGRES_PASSWORD=brooklyn
DB_USER=postgres
DB_NAME=postgres
DB_PORT=5432

# API
API_PORT=8080

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

## 🐛 Troubleshooting One-Liners

```bash
# Restart everything
docker-compose restart

# Fresh start
docker-compose down -v && docker-compose up -d --build

# Check container health
docker ps --filter "health=unhealthy"

# View errors only
docker-compose logs | grep -i error

# Check port conflicts
sudo lsof -i :8080
sudo lsof -i :3000
sudo lsof -i :5432

# Container resource usage
docker stats --no-stream

# Network inspection
docker network inspect pgnetwork
```

## 📝 Useful Scripts

```bash
./scripts/deploy-docker.sh              # Deploy all services
./scripts/docker-clean.sh               # Clean up resources
./scripts/db-seed.sh                    # Populate database
./scripts/test-api.sh                   # Test API endpoints
```

## 🔗 More Information

See [Docker Guide](./DOCKER_GUIDE.md) for comprehensive documentation.
