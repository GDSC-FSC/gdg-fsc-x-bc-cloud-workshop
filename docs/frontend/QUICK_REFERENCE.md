# Quick Reference Guide 🚀

## Setup in 3 Steps

### 1️⃣ Get Google Maps API Key
```
1. Visit: https://console.cloud.google.com/
2. Create/Select Project
3. Enable APIs:
   - Maps JavaScript API
   - Maps Static API  
   - Street View Static API
4. Create API Key
5. (Optional) Restrict to localhost for development
```

### 2️⃣ Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your key
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_KEY_HERE
```

### 3️⃣ Run the App
```bash
# Install dependencies (if needed)
bun install

# Start development server
bun run dev

# App will open at http://localhost:5173
```

## Features at a Glance

| Feature | Description | Icon |
|---------|-------------|------|
| **List View** | Traditional card layout with enhanced design | 📋 |
| **Map View** | Interactive Google Maps with color-coded markers | 🗺️ |
| **Restaurant Cards** | Modern gradient design with icons | 🎴 |
| **Details Modal** | Maps, street view, inspection history | 📊 |
| **Live Status** | Real-time API connection indicator | 🟢 |

## Color Legend

| Grade | Color | Meaning |
|-------|-------|---------|
| **A** | 🟢 Green | Excellent |
| **B** | 🔵 Blue | Good |
| **C** | 🟠 Orange | Fair |
| **P/Z** | 🔴 Red | Needs Improvement |

## Score Guide

| Score Range | Status | Color |
|-------------|--------|-------|
| **0-13** | ✅ Excellent | Green |
| **14-27** | ⚡ Good | Blue |
| **28+** | ⚠️ Needs Improvement | Orange |

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search (browser default)
- `Esc` - Close modal
- Click outside modal - Close modal

## API Integration

### Backend API (Port 8080)
- Health Check: `GET /api/health`
- Search: `GET /api/restaurants/search`
- Details: `GET /api/restaurants/details`
- Boroughs: `GET /api/restaurants/boroughs`
- Cuisines: `GET /api/restaurants/cuisines`

### Google Maps APIs Used
- Maps JavaScript API - Interactive maps
- Static Maps API - Location previews
- Street View Static API - Street imagery

## File Structure

```
frontend/src/
├── App.jsx                           # Main app with view toggle
├── components/
│   ├── RestaurantCard.jsx           # Enhanced card design
│   ├── RestaurantDetailsModal.jsx   # Modal with maps
│   ├── RestaurantMap.jsx            # New map component
│   ├── SearchForm.jsx               # Search interface
│   └── ResultsList.jsx              # List container
└── services/
    └── api.js                        # API service
```

## Common Tasks

### Search for Restaurants
1. Select borough (optional)
2. Enter cuisine type (optional)
3. Choose minimum grade (optional)
4. Set result limit (1-1000)
5. Click "🔍 Search"

### View on Map
1. Perform a search
2. Click "Map View" button
3. Click markers for details
4. Click "View Details" for full info

### Get Directions
1. Click restaurant card or marker
2. In modal, click "Get Directions"
3. Opens Google Maps with navigation

## Troubleshooting

### Map Not Loading
✅ Check `.env` has correct API key  
✅ Restart dev server  
✅ Check browser console for errors  
✅ Verify APIs enabled in Google Cloud  

### No Results Found
✅ Check backend is running on port 8080  
✅ Verify database is populated  
✅ Try broader search criteria  
✅ Check API Status indicator in header  

### Street View Not Showing
✅ Some locations lack street view coverage  
✅ Verify Street View API is enabled  
✅ Images will hide if unavailable (normal)  

## Pro Tips 💡

1. **Start Broad** - Search without filters first
2. **Use Map View** - Great for exploring neighborhoods
3. **Check Scores** - Lower is better (0-13 = excellent)
4. **Watch for Critical** - Red badges indicate serious violations
5. **Review History** - See improvement/decline over time

## Support

- 📖 [Full Setup Guide](./GOOGLE_MAPS_SETUP.md)
- 🎨 [Design Improvements](./DESIGN_IMPROVEMENTS.md)
- 📚 [Frontend README](../../frontend/README.md)
- 📚 [Main Docs](../README.md)
- 🐛 Issues? Check browser console first

## Tech Stack

- ⚛️ React 19
- 🎨 Chakra UI
- 🗺️ Google Maps (via @vis.gl/react-google-maps)
- ⚡ Vite
- 🟦 Bun
- 🎭 Framer Motion
- 📱 React Icons

---

**Remember**: The app works without Google Maps API (list view only), but maps features require the API key! 🗝️
