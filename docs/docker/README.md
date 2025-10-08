# Docker Setup

## Overview
This demo runs PostgreSQL in Docker on a user-defined bridge network so other containers can connect to it by name. User-defined bridge networks are recommended for standalone containers.

## Prerequisites
- Docker installed
- (Optional) `curl` and `jq` if you plan to run the data loader

## 1) Create a Docker network
```bash
docker network create pgnetwork
````

User-defined bridge networks let containers communicate via container names. ([Docker Documentation][1])

## 2) Create a persistent data volume (recommended)

```bash
docker volume create pgdata
```

The official Postgres image stores data at `/var/lib/postgresql/data`; a named volume preserves it across restarts. ([Docker Hub][2])

## 3) Run Postgres

```bash
docker run --name postgres --network pgnetwork \
  -e POSTGRES_PASSWORD=brooklyn \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 -d --restart unless-stopped postgres
```

`POSTGRES_PASSWORD` initializes the default superuser (`postgres`). You can also set `POSTGRES_USER` and `POSTGRES_DB`. ([Docker Hub][2])

> Tip: If you forget a network name or want the default, Docker also provides a built-in `bridge` network. ([Docker Documentation][3])

## 4) Verify the container

```bash
docker ps
docker logs -f postgres   # Ctrl+C to stop following logs
```

## 5) Connect with `psql`

* From the host:

  ```bash
  psql -h 127.0.0.1 -p 5432 -U postgres
  ```
* From another container on the same network:

  ```bash
  docker run -it --rm --network pgnetwork postgres \
    psql -h postgres -U postgres
  ```

`psql` is PostgreSQL’s interactive terminal and supports handy meta-commands for exploration. ([PostgreSQL][4])

## Troubleshooting

* **Network not found** → create it: `docker network create pgnetwork`. ([Docker Documentation][5])
* **Password required** → ensure `-e POSTGRES_PASSWORD=...` is set. ([Docker Hub][2])

[1]: https://docs.docker.com/engine/network/?utm_source=chatgpt.com "Networking | Docker Docs"
[2]: https://hub.docker.com/_/postgres?utm_source=chatgpt.com "postgres - Official Image"
[3]: https://docs.docker.com/reference/cli/docker/network/create/?utm_source=chatgpt.com "docker network create"
[4]: https://www.postgresql.org/docs/current/app-psql.html?utm_source=chatgpt.com "PostgreSQL: Documentation: 18: psql"
[5]: https://docs.docker.com/engine/network/tutorials/standalone/?utm_source=chatgpt.com "Networking with standalone containers"