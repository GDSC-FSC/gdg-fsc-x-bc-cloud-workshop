# Google Maps API Troubleshooting Guide

## Current Error: InvalidKeyMapError

This error means your Google Maps API key needs to be properly configured in Google Cloud Console.

## Required Steps

### 1. Enable Required APIs in Google Cloud Console

Your API key (`AIzaSyCzPLwK8NXw52fx7s0y6qpyhUprF3OF6G8`) needs these APIs enabled:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable each of these APIs:
   - ✅ **Maps JavaScript API** (REQUIRED - this is likely missing!)
   - ✅ **Maps Static API** (for RestaurantDetailsModal static maps)
   - ✅ **Street View Static API** (for street view images)
   - ✅ **Geocoding API** (for address lookups)
   - ✅ **Places API** (for place details)

### 2. Configure API Key Restrictions (Optional but Recommended)

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **Application restrictions**:
   - Select **HTTP referrers (websites)**
   - Add: `http://localhost:5173/*` (for development)
   - Add: `https://yourdomain.com/*` (for production)
4. Under **API restrictions**:
   - Select **Restrict key**
   - Select the APIs listed above
5. Click **Save**

### 3. Check for Ad Blockers

The error `ERR_BLOCKED_BY_CLIENT` indicates an ad blocker is blocking Google Maps requests.

**Solution:**
- Disable ad blockers (uBlock Origin, Adblock Plus, etc.) for `localhost:5173`
- Or whitelist `googleapis.com` in your ad blocker settings

### 4. Restart Vite Dev Server

After updating your `.env` file, you MUST restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd /home/wombocombo/github/wrk/gdg-fsc-x-bc-cloud-workshop/frontend
bun run dev
```

## Quick Verification Checklist

- [ ] Maps JavaScript API is enabled in Google Cloud Console
- [ ] API key is correctly set in `.env` file
- [ ] Dev server has been restarted after `.env` changes
- [ ] Ad blocker is disabled for localhost
- [ ] Browser console shows the actual API key (not "GOOGLE_MAPS_API_KEY" string)

## Testing Your API Key

You can test if your API key works by visiting this URL in your browser:

```
https://maps.googleapis.com/maps/api/js?key=AIzaSyCzPLwK8NXw52fx7s0y6qpyhUprF3OF6G8&callback=console.log
```

**Expected Result:**
- Should load without errors
- Console should show the Google Maps object

**If you see errors:**
- "RefererNotAllowedMapError" → Add localhost to HTTP referrer restrictions
- "ApiNotActivatedMapError" → Enable Maps JavaScript API
- "InvalidKeyMapError" → Check if the API key is correct

## Cost Considerations

All the APIs used have generous free tiers:
- **Maps JavaScript API**: $200 free credit/month (≈28,000 map loads)
- **Static Maps API**: $200 free credit/month (≈28,000 requests)
- **Street View Static API**: $200 free credit/month (≈28,000 requests)

For this development project, you won't exceed the free tier.

## Still Having Issues?

1. **Check the browser console** for specific error messages
2. **Verify environment variables** are loading:
   ```javascript
   console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
   ```
3. **Check Google Cloud Console billing** - Make sure billing is enabled (required even for free tier)
4. **Create a new API key** if all else fails

## Additional Resources

- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript/overview)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Error Messages Reference](https://developers.google.com/maps/documentation/javascript/error-messages)
