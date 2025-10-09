# Docker Deployment Guide# Docker Setup



This comprehensive guide explains how to containerize and run the GDG FSC x BC Cloud Workshop application using Docker.## Overview

This demo runs PostgreSQL in Docker on a user-defined bridge network so other containers can connect to it by name. User-defined bridge networks are recommended for standalone containers.

## Table of Contents

- [Quick Start](#quick-start)## Prerequisites

- [Prerequisites](#prerequisites)- Docker installed

- [Docker Compose (Recommended)](#docker-compose-recommended)- (Optional) `curl` and `jq` if you plan to run the data loader

- [Manual PostgreSQL Setup](#manual-postgresql-setup)

- [Individual Container Builds](#individual-container-builds)## 1) Create a Docker network

- [Environment Variables](#environment-variables)```bash

- [Architecture](#architecture)docker network create pgnetwork

- [Multi-Stage Builds](#multi-stage-builds)````

- [Data Persistence](#data-persistence)

- [Health Checks](#health-checks)User-defined bridge networks let containers communicate via container names. ([Docker Documentation][1])

- [Troubleshooting](#troubleshooting)

- [Production Considerations](#production-considerations)## 2) Create a persistent data volume (recommended)



## Quick Start```bash

docker volume create pgdata

### Using Docker Compose (Recommended)```



Start all services (PostgreSQL, API, Frontend):The official Postgres image stores data at `/var/lib/postgresql/data`; a named volume preserves it across restarts. ([Docker Hub][2])



```bash## 3) Run Postgres

docker-compose up -d

``````bash

docker run --name postgres --network pgnetwork \

View logs:  -e POSTGRES_PASSWORD=brooklyn \

  -v pgdata:/var/lib/postgresql/data \

```bash  -p 5432:5432 -d --restart unless-stopped postgres

docker-compose logs -f```

```

`POSTGRES_PASSWORD` initializes the default superuser (`postgres`). You can also set `POSTGRES_USER` and `POSTGRES_DB`. ([Docker Hub][2])

Stop all services:

> Tip: If you forget a network name or want the default, Docker also provides a built-in `bridge` network. ([Docker Documentation][3])

```bash

docker-compose down## 4) Verify the container

```

```bash

Stop and remove volumes (clean slate):docker ps

docker logs -f postgres   # Ctrl+C to stop following logs

```bash```

docker-compose down -v

```## 5) Connect with `psql`



### Access the Application* From the host:



- **Frontend**: http://localhost:3000  ```bash

- **API**: http://localhost:8080  psql -h 127.0.0.1 -p 5432 -U postgres

- **API Health**: http://localhost:8080/actuator/health  ```

- **PostgreSQL**: localhost:5432* From another container on the same network:



## Prerequisites  ```bash

  docker run -it --rm --network pgnetwork postgres \

- Docker Engine 20.10+    psql -h postgres -U postgres

- Docker Compose V2+  ```

- At least 4GB of available RAM

- (Optional) `curl` and `jq` if you plan to run the data loader`psql` is PostgreSQL’s interactive terminal and supports handy meta-commands for exploration. ([PostgreSQL][4])



## Docker Compose (Recommended)## Troubleshooting



The application consists of three services defined in `docker-compose.yml`:* **Network not found** → create it: `docker network create pgnetwork`. ([Docker Documentation][5])

* **Password required** → ensure `-e POSTGRES_PASSWORD=...` is set. ([Docker Hub][2])

1. **postgres** - PostgreSQL 15 database

2. **api** - Spring Boot REST API[1]: https://docs.docker.com/engine/network/?utm_source=chatgpt.com "Networking | Docker Docs"

3. **frontend** - React/Vite SPA[2]: https://hub.docker.com/_/postgres?utm_source=chatgpt.com "postgres - Official Image"

[3]: https://docs.docker.com/reference/cli/docker/network/create/?utm_source=chatgpt.com "docker network create"

### Network Architecture[4]: https://www.postgresql.org/docs/current/app-psql.html?utm_source=chatgpt.com "PostgreSQL: Documentation: 18: psql"

[5]: https://docs.docker.com/engine/network/tutorials/standalone/?utm_source=chatgpt.com "Networking with standalone containers"
```
┌─────────────────────────────────────────────┐
│             Docker Network (pgnetwork)       │
│                                             │
│  ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │Frontend  │───▶│   API    │───▶│PostgreSQL│
│  │  :3000   │    │  :8080   │    │  :5432  ││
│  └──────────┘    └──────────┘    └────────┘│
└─────────────────────────────────────────────┘
         │              │              │
         │              │              │
      localhost      localhost      localhost
       :3000          :8080          :5432
```

## Manual PostgreSQL Setup

If you prefer to run PostgreSQL manually without Docker Compose:

### 1) Create a Docker network
```bash
docker network create pgnetwork
```

User-defined bridge networks let containers communicate via container names. ([Docker Documentation][1])

### 2) Create a persistent data volume (recommended)

```bash
docker volume create pgdata
```

The official Postgres image stores data at `/var/lib/postgresql/data`; a named volume preserves it across restarts. ([Docker Hub][2])

### 3) Run Postgres

```bash
docker run --name postgres --network pgnetwork \
  -e POSTGRES_PASSWORD=brooklyn \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 -d --restart unless-stopped postgres
```

`POSTGRES_PASSWORD` initializes the default superuser (`postgres`). You can also set `POSTGRES_USER` and `POSTGRES_DB`. ([Docker Hub][2])

> Tip: If you forget a network name or want the default, Docker also provides a built-in `bridge` network. ([Docker Documentation][3])

### 4) Verify the container

```bash
docker ps
docker logs -f postgres   # Ctrl+C to stop following logs
```

### 5) Connect with `psql`

* From the host:

  ```bash
  psql -h 127.0.0.1 -p 5432 -U postgres
  ```
* From another container on the same network:

  ```bash
  docker run -it --rm --network pgnetwork postgres \
    psql -h postgres -U postgres
  ```

`psql` is PostgreSQL's interactive terminal and supports handy meta-commands for exploration. ([PostgreSQL][4])

## Individual Container Builds

### Build API Container

```bash
cd api
docker build -t gdg-api:latest .
```

Run API container (requires PostgreSQL):

```bash
docker run -d \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/postgres \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=brooklyn \
  --network pgnetwork \
  --name api \
  gdg-api:latest
```

### Build Frontend Container

```bash
cd frontend
docker build -t gdg-frontend:latest .
```

Run frontend container:

```bash
docker run -d \
  -p 3000:3000 \
  -e VITE_API_URL=http://localhost:8080 \
  --name frontend \
  gdg-frontend:latest
```

### Using Management Scripts

```bash
# Frontend management
./scripts/frontend.sh start    # Build and run
./scripts/frontend.sh logs     # View logs
./scripts/frontend.sh status   # Check status
./scripts/frontend.sh stop     # Stop container

# API testing
./scripts/test-api.sh         # Test all API endpoints
```

## Environment Variables

### API Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://postgres:5432/postgres` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `brooklyn` |
| `SERVER_PORT` | API server port | `8080` |

### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |
| `PORT` | Server port | `3000` |

### Database Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | `brooklyn` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_DB` | Database name | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |

## Architecture

The application uses a three-tier architecture:

1. **Frontend (React/Vite)** - User interface
2. **API (Spring Boot)** - REST API layer
3. **Database (PostgreSQL)** - Data persistence

All services communicate over a Docker bridge network (`pgnetwork`) for isolation and security.

## Multi-Stage Builds

Both the API and frontend use multi-stage Docker builds for optimization:

### API (Java/Gradle)
- **Stage 1**: Build with Gradle 8.14 + JDK 21
- **Stage 2**: Runtime with Eclipse Temurin JRE 21 (Alpine)

### Frontend (React/Vite)
- **Stage 1**: Build with Bun 1.0 (Alpine)
- **Stage 2**: Serve with Node.js 20 (Alpine)

This approach reduces final image sizes significantly:

| Service | Build Stage | Final Image |
|---------|-------------|-------------|
| API | ~1.5GB | ~200MB |
| Frontend | ~1.2GB | ~150MB |

## Data Persistence

PostgreSQL data is persisted in a named Docker volume (`pgdata`). To populate the database:

```bash
# Ensure the database is running
docker-compose up -d postgres

# Run the population script
./scripts/db-seed.sh
```

## Health Checks

All services include health checks:

- **postgres**: `pg_isready` check every 10s
- **api**: HTTP check on `/actuator/health` every 30s
- **frontend**: HTTP check on port 3000 every 30s

Check service health:

```bash
docker-compose ps
```

## Troubleshooting

### View container logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart a service

```bash
docker-compose restart api
```

### Rebuild after code changes

```bash
docker-compose up -d --build
```

### Clean rebuild

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues

```bash
# Check if PostgreSQL is ready
docker exec postgres pg_isready -U postgres

# Connect to database
docker exec -it postgres psql -U postgres
```

### Common Issues

* **Network not found** → Create it: `docker network create pgnetwork`. ([Docker Documentation][5])
* **Password required** → Ensure `-e POSTGRES_PASSWORD=...` is set. ([Docker Hub][2])
* **Port already in use** → Stop the conflicting service or change the port mapping
* **Container won't start** → Check logs with `docker logs <container_name>`

## Production Considerations

For production deployments, consider:

1. **Use secrets management** for sensitive environment variables
2. **Enable TLS/SSL** for database connections
3. **Configure proper resource limits** in docker-compose.yml
4. **Use specific image tags** instead of `latest`
5. **Set up proper logging** with a logging driver
6. **Implement backup strategy** for the PostgreSQL volume
7. **Use reverse proxy** (nginx/traefik) for the frontend
8. **Enable Spring Security** properly in production mode
9. **Configure container restart policies** appropriately
10. **Monitor container health** and set up alerts

## Development Mode

For development with hot-reload:

```bash
# Frontend with Vite dev server
cd frontend
bun run dev

# API with Spring Boot DevTools
cd api
./gradlew bootRun
```

Then use the `db-setup.sh` script for just the database:

```bash
./scripts/db-setup.sh
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## References

[1]: https://docs.docker.com/engine/network/?utm_source=chatgpt.com "Networking | Docker Docs"
[2]: https://hub.docker.com/_/postgres?utm_source=chatgpt.com "postgres - Official Image"
[3]: https://docs.docker.com/reference/cli/docker/network/create/?utm_source=chatgpt.com "docker network create"
[4]: https://www.postgresql.org/docs/current/app-psql.html?utm_source=chatgpt.com "PostgreSQL: Documentation: 18: psql"
[5]: https://docs.docker.com/engine/network/tutorials/standalone/?utm_source=chatgpt.com "Networking with standalone containers"
