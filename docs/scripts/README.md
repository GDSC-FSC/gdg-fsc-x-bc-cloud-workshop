# Scripts

Utility scripts for managing the GDG FSC x BC Cloud Workshop project.

## 🚀 Quick Start

```bash
./scripts/install.sh    # Install dependencies
./scripts/dev.sh        # Start development environment
```

## 📋 Available Scripts

### Development
- **`dev.sh`** - Start full development environment (database, API, frontend)
- **`build.sh`** - Build both API and frontend
- **`format.sh`** - Format Java and JavaScript/JSX code
- **`clean.sh`** - Clean build artifacts and Docker resources

### Database
- **`db-setup.sh`** - Setup PostgreSQL database in Docker
- **`db-seed.sh`** - Populate database with NYC restaurant data

### Frontend
- **`frontend.sh`** - Manage frontend Docker container
  - `./scripts/frontend.sh start` - Build and run
  - `./scripts/frontend.sh stop` - Stop container
  - `./scripts/frontend.sh logs` - View logs
  - `./scripts/frontend.sh status` - Check status

### Testing & Setup
- **`test-api.sh`** - Test all API endpoints
- **`install.sh`** - Install dependencies (Docker, Bun, etc.)

## 💡 Usage Examples

### Full Development Setup
```bash
# 1. Install dependencies
./scripts/install.sh

# 2. Start everything
./scripts/dev.sh
```

### Production Build
```bash
# Build everything
./scripts/build.sh

# Or use Docker Compose
docker-compose up -d
```

### Database Management
```bash
# Setup database
./scripts/db-setup.sh

# Seed with data
./scripts/db-seed.sh
```

### Code Quality
```bash
# Format all code
./scripts/format.sh

# Clean everything
./scripts/clean.sh
```

## 🔧 Environment Variables

### Database Scripts
- `POSTGRES_PASSWORD` - Database password (default: `brooklyn`)
- `DB_PORT` - PostgreSQL port (default: `5432`)
- `DB_USER` - Database user (default: `postgres`)

### Frontend Script
- `PORT` - Frontend port (default: `3000`)
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8080`)

## 📝 Notes

- All scripts must be run from the project root or will auto-navigate
- Scripts use `set -euo pipefail` for safe error handling
- Docker is required for most operations
