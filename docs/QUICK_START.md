# 🚀 Quick Start Guide

Get up and running with the NYC Restaurant Safety Finder in minutes!

## Prerequisites

- **Java 21+**
- **Docker & Docker Compose**
- **Node.js 18+** or **Bun 1.0+**
- **PostgreSQL** (via Docker)

## Three Ways to Run Commands

Every script can be executed in three different ways:

### 1. Direct Bash Scripts
```bash
./scripts/dev.sh
```

### 2. npm Scripts (Cross-platform)
```bash
npm run dev
```

### 3. Bash Aliases (After sourcing .bashrc)
```bash
source .bashrc
dev
```

---

## 🎯 Quick Setup (5 Minutes)

### Option A: Using npm (Recommended)

```bash
# 1. Install dependencies
npm run install:all

# 2. Setup database
npm run db:setup

# 3. Seed database with NYC data
npm run db:seed

# 4. Start everything (API + Frontend)
npm run start:all
```

### Option B: Using Direct Scripts

```bash
# 1. Install dependencies
./scripts/install.sh

# 2. Setup database
./scripts/db-setup.sh

# 3. Seed database
./scripts/db-seed.sh

# 4. Start dev environment
./scripts/dev.sh
```

### Option C: Using Bash Aliases

```bash
# Load aliases
source .bashrc

# Setup everything
install && db-setup && db-seed && dev
```

---

## 🎨 Development Workflow

### Start Development Servers

**Run API + Frontend Together** (Recommended)
```bash
npm run start:all
```

**Run Individually**
```bash
# Terminal 1: API
npm run api:dev

# Terminal 2: Frontend
npm run frontend:dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8080
- **API Health**: http://localhost:8080/api/restaurants/health

### Test the API

```bash
# Run all endpoint tests
npm run test:api

# Or manually
curl http://localhost:8080/api/restaurants/health
```

---

## 🛠️ Common Commands

### Development
```bash
npm run dev              # Start full environment
npm run start:all        # API + Frontend concurrently
npm run api:dev          # API only
npm run frontend:dev     # Frontend only
```

### Building
```bash
npm run build            # Build everything
npm run build:api        # Build API
npm run build:frontend   # Build frontend
```

### Database
```bash
npm run db:setup         # Setup PostgreSQL
npm run db:seed          # Load NYC data
```

### Docker
```bash
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View logs
npm run docker:restart   # Restart
```

### Utilities
```bash
npm run format           # Format code
npm run clean            # Clean builds
npm run test:api         # Test API
```

---

## 🔍 Testing Examples

### Health Check
```bash
curl http://localhost:8080/api/restaurants/health
```

### Query Restaurants
```bash
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{
    "borough": "MANHATTAN",
    "cuisine": "Pizza",
    "limit": 10
  }'
```

### Get Restaurant by ID
```bash
curl http://localhost:8080/api/restaurants/12345
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Stop and restart database
npm run docker:down
npm run db:setup
```

### Port Already in Use
```bash
# Check what's using port 8080
lsof -i :8080

# Check what's using port 5173
lsof -i :5173
```

### Clear Everything and Start Fresh
```bash
npm run clean
npm run docker:down
npm run db:setup
npm run db:seed
npm run start:all
```

---

## 📚 Next Steps

- **[Full Documentation](README.md)** - Complete project documentation
- **[API Documentation](api/README.md)** - REST API endpoints and usage
- **[Security Guide](api/SECURITY.md)** - Security features and configuration
- **[Scripts Reference](scripts/README.md)** - Detailed script documentation
- **[Database Guide](database/README.md)** - Schema and query reference

---

## 🎓 Learning Path

1. **Start Here** → Get the app running (this guide)
2. **Explore API** → [API Documentation](api/README.md)
3. **Understand Security** → [Security Quick Reference](api/SECURITY_QUICK_REFERENCE.md)
4. **Study Architecture** → [Package Structure](api/PACKAGE_STRUCTURE.md)
5. **Deep Dive** → [Full Security Guide](api/SECURITY.md)

---

## 💡 Tips

- Use `npm run start:all` for the best development experience
- All npm scripts work on Windows, macOS, and Linux
- Bash aliases only work after sourcing `.bashrc`
- Use `npm run` to see all available scripts
- Check `docs/scripts/README.md` for detailed command reference
