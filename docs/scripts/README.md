# Scripts

Utility scripts for managing the GDG FSC x BC Cloud Workshop project.

## 🚀 Quick Start

### Using Bash Scripts
```bash
./scripts/install.sh    # Install dependencies
./scripts/dev.sh        # Start development environment
```

### Using npm Scripts
```bash
npm run install:all     # Install dependencies
npm run dev             # Start development environment
```

### Using Bash Aliases (After sourcing .bashrc)
```bash
source .bashrc          # Load aliases
install                 # Install dependencies
dev                     # Start development environment
```

## 📋 Available Scripts

All scripts are available in three ways:
1. **Direct execution**: `./scripts/script-name.sh`
2. **npm scripts**: `npm run script-name`
3. **Bash aliases**: `script-name` (after sourcing .bashrc)

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

**Option 1: Direct Scripts**
```bash
# 1. Install dependencies
./scripts/install.sh

# 2. Start everything
./scripts/dev.sh
```

**Option 2: npm Scripts**
```bash
# 1. Install dependencies
npm run install:all

# 2. Start everything
npm run dev
```

**Option 3: Bash Aliases** (after `source .bashrc`)
```bash
# 1. Install dependencies
install

# 2. Start everything
dev
```

### Production Build

**Direct Scripts**
```bash
./scripts/build.sh
```

**npm**
```bash
npm run build
```

**Docker Compose**
```bash
docker-compose up -d
# Or with npm
npm run docker:up
```

### Database Management

**Direct Scripts**
```bash
./scripts/db-setup.sh
./scripts/db-seed.sh
```

**npm**
```bash
npm run db:setup
npm run db:seed
```

**Bash Aliases**
```bash
db-setup
db-seed
```

### Code Quality

**Direct Scripts**
```bash
./scripts/format.sh
./scripts/clean.sh
```

**npm**
```bash
npm run format
npm run clean
```

**Bash Aliases**
```bash
format
clean
```

### Concurrent Development

**Run API and Frontend Together**
```bash
npm run start:all
```

This uses `concurrently` to run both the API and frontend dev servers in parallel with colored output.

## 🔧 Environment Variables

### Database Scripts
- `POSTGRES_PASSWORD` - Database password (default: `brooklyn`)
- `DB_PORT` - PostgreSQL port (default: `5432`)
- `DB_USER` - Database user (default: `postgres`)

### Frontend Script
- `PORT` - Frontend port (default: `3000`)
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8080`)

## � npm Scripts Reference

Complete list of available npm scripts defined in `package.json`:

### Development Scripts
| npm Script | Equivalent Bash | Description |
|-----------|----------------|-------------|
| `npm run dev` | `./scripts/dev.sh` | Start full dev environment |
| `npm run start:all` | N/A | Run API + frontend concurrently |
| `npm run api:dev` | `cd api && ./gradlew bootRun` | Run API dev server |
| `npm run frontend:dev` | `cd frontend && bun run dev` | Run frontend dev server |

### Build Scripts
| npm Script | Equivalent Bash | Description |
|-----------|----------------|-------------|
| `npm run build` | `./scripts/build.sh` | Build all components |
| `npm run build:api` | `cd api && ./gradlew clean build` | Build API only |
| `npm run build:frontend` | `cd frontend && bun run build` | Build frontend only |

### Database Scripts
| npm Script | Equivalent Bash | Description |
|-----------|----------------|-------------|
| `npm run db:setup` | `./scripts/db-setup.sh` | Setup PostgreSQL in Docker |
| `npm run db:seed` | `./scripts/db-seed.sh` | Seed database with NYC data |

### Docker Scripts
| npm Script | Equivalent Bash | Description |
|-----------|----------------|-------------|
| `npm run docker:up` | `docker-compose up -d` | Start all containers |
| `npm run docker:down` | `docker-compose down` | Stop all containers |
| `npm run docker:logs` | `docker-compose logs -f` | View container logs |
| `npm run docker:restart` | `docker-compose restart` | Restart all containers |

### Utility Scripts
| npm Script | Equivalent Bash | Description |
|-----------|----------------|-------------|
| `npm run clean` | `./scripts/clean.sh` | Clean build artifacts |
| `npm run format` | `./scripts/format.sh` | Format all code |
| `npm run test:api` | `./scripts/test-api.sh` | Test API endpoints |
| `npm run install:all` | `./scripts/install.sh` | Install dependencies |
| `npm run frontend` | `./scripts/frontend.sh` | Manage frontend container |

### Special Features

**Concurrent Execution**
The `start:all` script uses the `concurrently` package to run multiple processes:
```bash
npm run start:all
```
This runs both `api:dev` and `frontend:dev` with:
- Color-coded output (blue for API, green for frontend)
- Named prefixes for easy identification
- Single command to start entire development environment

## �📝 Notes

- All scripts must be run from the project root or will auto-navigate
- Scripts use `set -euo pipefail` for safe error handling
- Docker is required for most operations
- npm scripts work on all platforms (Windows, macOS, Linux)
- Bash aliases require sourcing `.bashrc` first: `source .bashrc`
