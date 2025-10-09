#!/usr/bin/env bash
set -euo pipefail

# --- Config (override via env) ---
NETWORK_NAME="${NETWORK_NAME:-pgnetwork}"
VOLUME_NAME="${VOLUME_NAME:-pgdata}"
CONTAINER_NAME="${CONTAINER_NAME:-postgres}"
IMAGE="${IMAGE:-postgres:latest}"

DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
DB_PORT="${DB_PORT:-5432}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-brooklyn}"

# Path to your loader script
POPULATE_SCRIPT="${POPULATE_SCRIPT:-./scripts/db-seed.sh}"

# --- Helpers ---
log() { printf "\n\033[1;32m▶ %s\033[0m\n" "$*"; }
warn() { printf "\n\033[1;33m⚠ %s\033[0m\n" "$*"; }
die() { printf "\n\033[1;31m✖ %s\033[0m\n" "$*"; exit 1; }

require() {
  command -v "$1" >/dev/null 2>&1 || die "Missing dependency: $1"
}

# --- Pre-flight checks ---
require docker
# populate.sh needs curl & jq on host
require curl
require jq

# --- Network ---
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  log "Creating Docker network: $NETWORK_NAME"
  docker network create "$NETWORK_NAME"
else
  log "Network exists: $NETWORK_NAME"
fi
# (User-defined bridge networks let containers talk via names.) :contentReference[oaicite:0]{index=0}

# --- Volume ---
if ! docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
  log "Creating Docker volume: $VOLUME_NAME"
  docker volume create "$VOLUME_NAME" >/dev/null
else
  log "Volume exists: $VOLUME_NAME"
fi
# (Named volumes persist data at /var/lib/postgresql/data.) :contentReference[oaicite:1]{index=1}

# --- Container (start or recreate) ---
if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  # If it's exited or misconfigured, recreate it; if running, keep it
  state=$(docker inspect -f '{{.State.Status}}' "$CONTAINER_NAME")
  if [[ "$state" != "running" ]]; then
    warn "Container '$CONTAINER_NAME' exists but is '$state' — recreating"
    docker rm -f "$CONTAINER_NAME" >/dev/null
  else
    log "Container already running: $CONTAINER_NAME"
  fi
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  log "Starting PostgreSQL container: $CONTAINER_NAME"
  docker run --name "$CONTAINER_NAME" --network "$NETWORK_NAME" \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -v "$VOLUME_NAME":/var/lib/postgresql/data \
    -p "$DB_PORT":5432 -d --restart unless-stopped "$IMAGE"
  # POSTGRES_PASSWORD initializes the default superuser. :contentReference[oaicite:2]{index=2}
fi

# --- Wait for readiness (pg_isready exit code) ---
log "Waiting for database to be ready..."
# pg_isready returns 0 when accepting connections. :contentReference[oaicite:3]{index=3}
until docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" -h 127.0.0.1 -p 5432 >/dev/null 2>&1; do
  sleep 1
done
log "PostgreSQL is ready."

# --- Populate data (optional) ---
if [[ -f "$POPULATE_SCRIPT" ]]; then
  log "Running data loader: $POPULATE_SCRIPT"
  # populate.sh uses docker exec + psql + curl/jq on host
  bash "$POPULATE_SCRIPT"
else
  warn "Skipping population; loader not found at '$POPULATE_SCRIPT'"
fi

# --- Quick sanity checks ---
log "Verifying connectivity and row count..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA IF NOT EXISTS public;
-- Show table if present
\dt public.*
-- Count rows if our demo table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='nyc_restaurant_inspections') THEN
    RAISE NOTICE 'nyc_restaurant_inspections rows:';
    PERFORM 1;
  END IF;
END$$;
SQL

# If the table exists, print count (separate command to avoid failing the DO block above)
if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='nyc_restaurant_inspections';" | grep -q 1; then
  docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) AS total_rows FROM public.nyc_restaurant_inspections;"
fi

log "Done. Connect with: psql -h 127.0.0.1 -p ${DB_PORT} -U ${DB_USER}"
