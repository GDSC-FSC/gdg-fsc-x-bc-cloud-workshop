# 🐳 Docker Deployment Guide

This guide explains how to containerize and run the GDG FSC x BC Cloud Workshop application using Docker.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Architecture](#-architecture)
- [Environment Configuration](#-environment-configuration)
- [Deployment](#-deployment)
- [Service Management](#-service-management)
- [Health Checks](#-health-checks)
- [Troubleshooting](#-troubleshooting)
- [Production Considerations](#-production-considerations)

## 🚀 Quick Start

### 1. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Maps API key:

```properties
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 2. Deploy All Services

Use the automated deployment script:

```bash
./scripts/deploy-docker.sh
```

Or manually with Docker Compose:

```bash
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8080
- **API Health**: http://localhost:8080/actuator/health
- **PostgreSQL**: localhost:5432

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 📦 Prerequisites

- Docker Engine 20.10+
- Docker Compose V2+
- At least 4GB of available RAM
- Google Maps API key (for maps functionality)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│          Docker Network (pgnetwork)          │
│                                             │
│  ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │ Frontend │───▶│   API    │───▶│PostgreSQL│
│  │  :3000   │    │  :8080   │    │  :5432  ││
│  └──────────┘    └──────────┘    └────────┘│
│   Node 20         Java 21         PG 16     │
│   150MB           200MB           256MB     │
└─────────────────────────────────────────────┘
         │              │              │
         │              │              │
      localhost      localhost      localhost
       :3000          :8080          :5432
```

### Service Details

| Service | Technology | Base Image | Size | Memory |
|---------|-----------|------------|------|--------|
| **Frontend** | React + Vite | node:20-alpine | ~150MB | 256MB |
| **API** | Spring Boot | temurin:21-jre-alpine | ~200MB | 768MB |
| **Database** | PostgreSQL 16 | postgres:16-alpine | ~80MB | 512MB |

## 🔧 Environment Configuration

### Database Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | `brooklyn` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_NAME` | Database name | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |

### API Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PORT` | API server port | `8080` |
| `SPRING_DATASOURCE_URL` | Database connection URL | Auto-configured |
| `JAVA_OPTS` | JVM options | `-Xms256m -Xmx512m` |

### Frontend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_PORT` | Frontend port | `3000` |
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | Required |

## 🚢 Deployment

### Using Deployment Script

The automated script handles everything:

```bash
./scripts/deploy-docker.sh
```

This will:
1. ✅ Check for Docker installation
2. ✅ Create .env file if missing
3. ✅ Build all Docker images
4. ✅ Start all services
5. ✅ Wait for health checks
6. ✅ Display service status

### Manual Deployment

#### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api
docker-compose build frontend
```

#### Start Services

```bash
# Start all services in background
docker-compose up -d

# Start with fresh build
docker-compose up -d --build

# Start and view logs
docker-compose up
```

#### Rebuild After Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Clean rebuild
docker-compose build --no-cache
docker-compose up -d
```

## 🔄 Service Management

### Check Service Status

```bash
# List running containers
docker-compose ps

# Check health status
docker inspect gdg-api --format='{{.State.Health.Status}}'
docker inspect gdg-frontend --format='{{.State.Health.Status}}'
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart frontend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (data will be lost)
docker-compose down -v

# Stop specific service
docker-compose stop api
```

### Clean Up

Use the cleanup script for complete cleanup:

```bash
./scripts/docker-clean.sh
```

Or manually:

```bash
# Remove containers and volumes
docker-compose down -v

# Remove images
docker rmi gdg-api:latest gdg-frontend:latest

# Remove dangling images
docker image prune -f

# Remove unused volumes
docker volume prune -f
```

## 💚 Health Checks

All services include health checks:

### PostgreSQL
- **Check**: `pg_isready -U postgres -d postgres`
- **Interval**: 10s
- **Timeout**: 5s
- **Retries**: 5
- **Start Period**: 10s

### API
- **Check**: `wget http://localhost:8080/actuator/health`
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 60s

### Frontend
- **Check**: `wget http://localhost:3000/health`
- **Interval**: 30s
- **Timeout**: 5s
- **Retries**: 3
- **Start Period**: 10s

## 🐛 Troubleshooting

### View Logs

```bash
# All services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f api
```

### Common Issues

#### Port Already in Use

```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill the process
sudo kill -9 <PID>

# Or change port in .env
API_PORT=8081
```

#### Container Won't Start

```bash
# Check container logs
docker logs gdg-api

# Inspect container
docker inspect gdg-api

# Check health status
docker inspect gdg-api --format='{{.State.Health.Status}}'
```

#### Database Connection Failed

```bash
# Check if PostgreSQL is ready
docker exec gdg-postgres pg_isready -U postgres

# Connect to database
docker exec -it gdg-postgres psql -U postgres

# Restart API service
docker-compose restart api
```

#### Out of Memory

```bash
# Check container stats
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### Reset Everything

```bash
# Complete reset
./scripts/docker-clean.sh
./scripts/deploy-docker.sh
```

## 🏭 Production Considerations

### Security

1. **Use secrets management** for sensitive environment variables
   ```bash
   docker secret create postgres_password ./postgres_password.txt
   ```

2. **Enable TLS/SSL** for database connections
3. **Run containers as non-root** (already configured)
4. **Use specific image tags** instead of `latest`
5. **Scan images for vulnerabilities**
   ```bash
   docker scan gdg-api:latest
   ```

### Performance

1. **Configure resource limits** appropriately
2. **Use health checks** to ensure availability
3. **Enable container restart policies**
4. **Monitor container metrics**
   ```bash
   docker stats
   ```

### Monitoring

1. **Setup logging aggregation** (ELK stack, Splunk)
2. **Configure monitoring** (Prometheus, Grafana)
3. **Set up alerts** for service health
4. **Track resource usage**

### Backup

1. **Backup PostgreSQL data** regularly
   ```bash
   docker exec gdg-postgres pg_dump -U postgres postgres > backup.sql
   ```

2. **Use volume backups**
   ```bash
   docker run --rm -v pgdata:/data -v $(pwd):/backup alpine tar czf /backup/pgdata-backup.tar.gz /data
   ```

### High Availability

1. **Use Docker Swarm or Kubernetes** for orchestration
2. **Configure replica sets** for PostgreSQL
3. **Setup load balancing** for API instances
4. **Use health checks** for automatic recovery

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 🔗 Related Documentation

- [API Documentation](../api/README.md)
- [Frontend Documentation](../frontend/README.md)
- [Database Setup](../database/README.md)
- [Quick Start Guide](../QUICK_START.md)

---

For development without Docker, see the [Development Guide](../README.md).
