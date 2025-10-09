# NYC Restaurants Frontend

> **📚 Docker setup documentation is available at [`docs/frontend/DOCKER_SETUP.md`](../docs/frontend/DOCKER_SETUP.md)**

React + Vite frontend for querying NYC restaurant health inspection data.

## Quick Start

### Development Mode

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
# Build
bun run build

# Preview
bun run preview
```

### Docker

```bash
# Using management script
../scripts/frontend.sh start

# Or manually
docker build -t gdg-frontend:latest .
docker run -d -p 3000:3000 --name frontend gdg-frontend:latest
```

## Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

## Documentation

- **[Docker Setup Guide](../docs/frontend/DOCKER_SETUP.md)** - Complete Docker configuration
- **[Scripts Guide](../docs/scripts/README.md)** - Management scripts

## Tech Stack

- React
- Vite
- TailwindCSS
- Chakra UI
- Bun (package manager)

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Lint code

For more details, see the [Docker Setup Guide](../docs/frontend/DOCKER_SETUP.md).
