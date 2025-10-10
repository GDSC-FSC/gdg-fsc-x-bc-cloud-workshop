# Google Maps Integration Setup Guide

## Overview
This application now includes enhanced Google Maps integration to display restaurant locations, interactive maps, and street view imagery.

## Features Added

### 1. **Interactive Map View**
- Toggle between List View and Map View
- Color-coded markers based on health grades (A=Green, B=Blue, C=Orange, P/Z=Red)
- Click markers to see restaurant details
- Auto-center and zoom based on search results
- Restaurant count display
- Grade legend

### 2. **Restaurant Cards**
- Modern gradient design with better visual hierarchy
- Enhanced icons for location, phone, and inspection info
- Improved hover effects and animations
- Color-coded inspection scores
- Critical violation warnings with icons

### 3. **Restaurant Details Modal**
- Static map preview of restaurant location
- Street view imagery
- "Open in Google Maps" button
- "Get Directions" button
- Enhanced inspection history with timeline
- Better visualization of scores and violations

## Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API** (optional, for future features)
   - **Geocoding API** (optional)
   - **Street View Static API**
   - **Maps Static API**

4. Create credentials:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### Step 2: Configure API Key Restrictions (Important for Security)

1. Click on your API key to edit it
2. Under "Application restrictions":
   - For development: Select "None" or "HTTP referrers" and add `http://localhost:*`
   - For production: Add your production domain

3. Under "API restrictions":
   - Select "Restrict key"
   - Enable only the APIs you need (listed above)

### Step 3: Add API Key to Your Project

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```bash
   VITE_API_URL=http://localhost:8080
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   bun run dev
   ```

## Usage

### Map View
- Use the search form to find restaurants
- Click "Map View" button to see results on an interactive map
- Click any marker to see restaurant details in an info window
- Click "View Details" in the info window for full inspection history

### List View
- Traditional card-based layout
- Enhanced cards with better visual design
- Click any card to open the detailed modal

### Restaurant Details
- View location on a static map
- See street view imagery (if available)
- Quick access to Google Maps for directions
- Browse complete inspection history with enhanced visualization

## Troubleshooting

### Map Not Loading
- Check that your API key is correctly set in `.env`
- Verify that Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for any error messages
- Ensure you're using the correct API key format (no quotes in .env)

### Street View Images Not Showing
- Some locations may not have street view coverage
- Ensure Street View Static API is enabled
- Check API key restrictions

### "API Key Required" Message
- Make sure `.env` file exists and contains your API key
- Restart the development server after adding the key
- Check that the key is named `VITE_GOOGLE_MAPS_API_KEY`

## Cost Considerations

Google Maps APIs have free tiers with generous limits:
- **Maps JavaScript API**: $200 free credit per month
- **Static Maps API**: 28,000 free loads per month
- **Street View Static API**: 28,000 free loads per month

For typical development and small-scale usage, you should stay within the free tier. Consider setting up billing alerts in Google Cloud Console.

## Future Enhancements

Potential features to add:
- Clustering for large result sets
- Heat maps for violation density
- Route planning for food tours
- Place search integration
- Autocomplete for address search
- Nearby restaurants feature
- Custom map styling themes

## Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [vis.gl React Google Maps Documentation](https://visgl.github.io/react-google-maps/)
- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
