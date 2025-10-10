/**
 * Restaurant Map Component
 * Displays NYC restaurant locations on Google Maps with interactive markers
 * Uses the comprehensive GoogleMaps component with clustering and filtering
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { GoogleMaps } from './map';
import { Box, Text } from '@chakra-ui/react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

// NYC bounds
const NYC_BOUNDS = {
  north: 40.9176,
  south: 40.4774,
  west: -74.2591,
  east: -73.7004,
};

// NYC center coordinates
const NYC_CENTER = { lat: 40.7128, lng: -74.0060 };

/**
 * Convert restaurant grade to status for the GoogleMaps component
 */
const gradeToStatus = (grade) => {
  switch (grade?.toUpperCase()) {
    case 'A':
      return 'Active'; // Green
    case 'B':
      return 'Special'; // Amber/Orange
    case 'C':
    case 'P':
    case 'Z':
      return 'Inactive'; // Gray/Red
    default:
      return 'Inactive';
  }
};

/**
 * Transform restaurants into the format expected by GoogleMaps component
 */
const transformRestaurantsToLocations = (restaurants) => {
  const locations = {
    active: [],
    inactive: [],
    special: [],
  };

  restaurants.forEach((restaurant) => {
    if (!restaurant.latitude || !restaurant.longitude) return;

    const status = gradeToStatus(restaurant.grade);
    const location = {
      id: `${restaurant.camis}-${restaurant.inspection_date}`,
      name: restaurant.dba || 'Unknown Restaurant',
      coordinates: [restaurant.latitude, restaurant.longitude],
      status,
      establishedDate: restaurant.grade_date ? new Date(restaurant.grade_date).getFullYear().toString() : null,
      description: restaurant.cuisine_description || 'Unknown Cuisine',
      address: `${restaurant.building} ${restaurant.street}`,
      city: restaurant.boro,
      state: 'NY',
      country: 'USA',
      notes: restaurant.violation_description,
      category: `Grade ${restaurant.grade || 'N/A'} | Score: ${restaurant.score || 'N/A'}`,
      // Keep original restaurant data for details modal
      _originalData: restaurant,
    };

    // Map to correct category
    if (status === 'Active') {
      locations.active.push(location);
    } else if (status === 'Special') {
      locations.special.push(location);
    } else {
      locations.inactive.push(location);
    }
  });

  return locations;
};

const RestaurantMap = ({ restaurants, onViewDetails }) => {
  // Transform restaurants to location format
  const locations = useMemo(() => 
    transformRestaurantsToLocations(restaurants),
    [restaurants]
  );

  // Calculate center from restaurants
  const center = useMemo(() => {
    const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);
    if (validRestaurants.length === 0) return NYC_CENTER;
    
    const avgLat = validRestaurants.reduce((sum, r) => sum + r.latitude, 0) / validRestaurants.length;
    const avgLng = validRestaurants.reduce((sum, r) => sum + r.longitude, 0) / validRestaurants.length;
    return { lat: avgLat, lng: avgLng };
  }, [restaurants]);

  // Determine zoom based on restaurant count
  const defaultZoom = useMemo(() => {
    const validCount = restaurants.filter(r => r.latitude && r.longitude).length;
    if (validCount === 0) return 11;
    if (validCount === 1) return 15;
    if (validCount < 10) return 13;
    return 12;
  }, [restaurants]);

  // Custom map styles for restaurant view
  const mapStyles = useMemo(() => [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.business",
      elementType: "all",
      stylers: [{ visibility: "off" }]
    }
  ], []);

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY') {
    return (
      <Box 
        p={8} 
        bg="yellow.50" 
        borderRadius="lg" 
        borderWidth="1px" 
        borderColor="yellow.200"
        textAlign="center"
      >
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          🗺️ Google Maps API Key Required
        </Text>
        <Text fontSize="sm" color="gray.600">
          Please add your Google Maps API key to the .env file as VITE_GOOGLE_MAPS_API_KEY
        </Text>
        <Text fontSize="xs" color="gray.500" mt={2}>
          See docs/frontend/GOOGLE_MAPS_SETUP.md for instructions
        </Text>
      </Box>
    );
  }

  return (
    <GoogleMaps
      locations={locations}
      center={center}
      bounds={NYC_BOUNDS}
      mapStyles={mapStyles}
      minZoom={10}
      maxZoom={18}
      defaultZoom={defaultZoom}
      onViewDetails={onViewDetails}
    />
  );
};

RestaurantMap.propTypes = {
  restaurants: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDetails: PropTypes.func.isRequired,
};

export default RestaurantMap;
