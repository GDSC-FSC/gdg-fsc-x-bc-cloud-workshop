# Frontend - React + Vite

A modern React frontend built with Vite, using Bun for fast builds and Chakra UI for components.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Bun** - Fast JavaScript runtime for development
- **Chakra UI** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Google Maps** - Map integration
- **Axios** - HTTP client

## Prerequisites

- [Bun](https://bun.sh) v1.0+ (for development)
- Node.js 20+ (for production/Docker)
- Docker (optional, for containerized deployment)

## Development Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
VITE_API_URL=http://localhost:8080
```

### 3. Run Development Server

```bash
bun run dev
```

The app will be available at http://localhost:3000 with hot module replacement (HMR).

## Production Build

### Local Build

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

### Production Server

The app includes a custom Express server (`server.js`) for production:

```bash
# Build first
bun run build

# Start production server
npm run start
```

## Docker Deployment

### Quick Start with Management Script

```bash
# Build and run
./scripts/frontend.sh start

# View logs
./scripts/frontend.sh logs

# Check status
./scripts/frontend.sh status

# Stop
./scripts/frontend.sh stop
```

### Using Docker Compose (Recommended)

From the project root:

```bash
docker-compose up -d frontend
```

### Manual Docker Commands

```bash
# Build
docker build -t gdg-frontend:latest frontend/

# Run
docker run -d \
  -p 3000:3000 \
  -e VITE_API_URL=http://localhost:8080 \
  --name frontend \
  gdg-frontend:latest
```

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, icons, etc.
│   ├── components/  # React components
│   │   └── ui/      # UI components (Chakra)
│   ├── lib/         # Third-party library configs
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Main app component
│   └── main.jsx     # Entry point
├── server.js        # Production Express server
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies
```

## Available Scripts

- `bun run dev` - Start development server with HMR
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `npm run start` - Start production server (after build)
- `bun run lint` - Run ESLint

## API Integration

The frontend connects to the backend API via:

- **Development**: Vite proxy at `/api` → `http://localhost:8080`
- **Production**: Direct calls to `VITE_API_URL`

Configure the API URL in `.env`:

```env
VITE_API_URL=http://localhost:8080
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | - |

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses an optimized two-stage build:

1. **Build Stage** (Bun 1.0 Alpine)
   - Install dependencies with Bun
   - Build production bundle
   - Output to `dist/`

2. **Runtime Stage** (Node.js 20 Alpine)
   - Install production dependencies only
   - Copy built assets from stage 1
   - Run Express server as non-root user
   - Health checks enabled

### Benefits
- **Small image size**: ~150MB final image (vs ~1.2GB build stage)
- **Fast builds**: Bun for dependency installation
- **Secure**: Non-root user, minimal attack surface
- **Production-ready**: Express server with SPA routing

## Troubleshooting

### Port already in use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### Clear Bun cache

```bash
rm -rf node_modules bun.lockb
bun install
```

### Docker build issues

```bash
# Clean rebuild
docker build --no-cache -t gdg-frontend:latest .
```

## Production Considerations

- ✅ Environment variables properly configured
- ✅ API URLs use environment variables
- ✅ Static assets optimized
- ✅ Gzip compression enabled (via Express)
- ✅ SPA routing handled (fallback to index.html)
- ✅ Security headers configured
- ✅ Non-root user in Docker
- ✅ Health checks enabled

## React + Vite Notes

This project uses [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) for Fast Refresh with SWC.

For TypeScript integration, see the [Vite TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).
