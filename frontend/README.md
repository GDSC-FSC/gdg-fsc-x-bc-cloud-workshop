# NYC Restaurants Frontend 🍕

> **📚 Full documentation is available at [`docs/frontend/README.md`](../docs/frontend/README.md)**

Modern React + Vite frontend for querying NYC restaurant health inspection data with **Google Maps integration** and enhanced UI/UX.

## ✨ New Features

- 🗺️ **Interactive Map View** - See restaurants on Google Maps with color-coded markers
- 🎨 **Modern Card Design** - Enhanced visual hierarchy with gradients and icons
- 📍 **Location Integration** - Static maps, street view, and direct links to Google Maps
- 🔄 **View Toggle** - Switch between list and map views instantly
- ⚡ **Smooth Animations** - Professional hover effects and transitions
- 🎯 **Better Information Display** - Color-coded scores and enhanced inspection history

## 🚀 Quick Start

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

## ⚙️ Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Get Google Maps API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable these APIs:
   - Maps JavaScript API
   - Maps Static API
   - Street View Static API
3. Create API Key and add to `.env`

📖 See [Google Maps Setup Guide](../docs/frontend/GOOGLE_MAPS_SETUP.md) for detailed instructions.

## 📖 Documentation

- **[Quick Reference](../docs/frontend/QUICK_REFERENCE.md)** - Quick setup and usage guide
- **[Google Maps Setup](../docs/frontend/GOOGLE_MAPS_SETUP.md)** - Complete Maps integration guide
- **[Design Improvements](../docs/frontend/DESIGN_IMPROVEMENTS.md)** - All UI/UX enhancements
- **[Visual Changelog](../docs/frontend/VISUAL_CHANGELOG.md)** - Before/after comparison
- **[Frontend Guide](../docs/frontend/README.md)** - Complete documentation
- **[Scripts Guide](../docs/scripts/README.md)** - Management scripts
- **[Docker Guide](../docs/docker/README.md)** - Docker setup

## 🛠️ Tech Stack

- ⚛️ React 19
- ⚡ Vite (Rolldown)
- 🎨 Chakra UI
- 🗺️ Google Maps (@vis.gl/react-google-maps)
- 🎭 Framer Motion
- 📱 React Icons
- 🟦 Bun (package manager)

## 📜 Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Lint code

## 🎯 Features Overview

### Search & Filter
- Borough selection
- Cuisine type search
- Grade filtering
- Results limit control

### List View
- Enhanced restaurant cards
- Color-coded grades
- Score indicators
- Critical violation warnings
- Hover animations

### Map View 🗺️
- Interactive Google Maps
- Color-coded markers (Green=A, Blue=B, Orange=C, Red=P/Z)
- Click markers for details
- Auto-center on results
- Grade legend

### Restaurant Details
- Full inspection history
- Static map preview
- Street view imagery
- Direct Google Maps links
- Get directions button
- Enhanced timeline display

For more details, see the [Quick Reference](../docs/frontend/QUICK_REFERENCE.md) or [Frontend Guide](../docs/frontend/README.md).
