/**
 * @fileoverview Restaurant map component with Google Maps integration.
 * Displays NYC restaurant locations with clustering, filtering, and interactive markers.
 * Transforms restaurant inspection data into map-compatible format with grade-based coloring.
 * 
 * @module components/RestaurantMap
 * @requires react
 * @requires prop-types
 * @requires @chakra-ui/react
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { GoogleMaps } from './map';
import { Box, Text } from '@chakra-ui/react';

/**
 * Google Maps API key from environment variables.
 * @constant {string}
 */
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

/**
 * Geographic bounds for New York City.
 * @constant {Object}
 * @property {number} north - Northern latitude boundary
 * @property {number} south - Southern latitude boundary
 * @property {number} west - Western longitude boundary
 * @property {number} east - Eastern longitude boundary
 */
const NYC_BOUNDS = {
  north: 40.9176,
  south: 40.4774,
  west: -74.2591,
  east: -73.7004,
};

/**
 * Center coordinates for New York City (Manhattan).
 * @constant {Object}
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 */
const NYC_CENTER = { lat: 40.7128, lng: -74.0060 };

/**
 * Converts restaurant health grade to map marker status.
 * Maps letter grades to visual marker categories for the GoogleMaps component.
 * 
 * @function
 * @param {string} grade - Health inspection grade (A, B, C, P, Z)
 * @returns {string} Status category ('Active' for A, 'Special' for B, 'Inactive' for C/P/Z)
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
 * Transforms restaurant data into GoogleMaps component-compatible format.
 * Categorizes restaurants by grade status and enriches with location metadata.
 * Filters out restaurants without valid coordinates.
 * 
 * @function
 * @param {Array<Object>} restaurants - Array of restaurant objects with inspection data
 * @returns {Object} Categorized locations object with active, inactive, and special arrays
 * @property {Array<Object>} active - Grade A restaurants (green markers)
 * @property {Array<Object>} inactive - Grade C/P/Z restaurants (gray/red markers)
 * @property {Array<Object>} special - Grade B restaurants (orange markers)
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

/**
 * Restaurant map component with interactive markers and clustering.
 * Displays restaurant locations on Google Maps with grade-based coloring,
 * automatic centering, and zoom level optimization.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.restaurants - Array of restaurant objects with lat/lng coordinates
 * @param {Function} props.onViewDetails - Callback invoked when a restaurant marker is clicked
 * @returns {JSX.Element} Google Maps UI or API key error message
 * 
 * @example
 * <RestaurantMap 
 *   restaurants={searchResults} 
 *   onViewDetails={(restaurant) => setSelectedRestaurant(restaurant)}
 * />
 */
const RestaurantMap = ({ restaurants, onViewDetails }) => {
  /**
   * Transformed restaurant locations categorized by grade status.
   * Memoized to prevent unnecessary recalculations.
   * @type {Object}
   */
  const locations = useMemo(() => 
    transformRestaurantsToLocations(restaurants),
    [restaurants]
  );

  /**
   * Calculated map center based on restaurant positions.
   * Falls back to NYC center if no valid coordinates exist.
   * @type {Object}
   */
  const center = useMemo(() => {
    const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);
    if (validRestaurants.length === 0) return NYC_CENTER;
    
    const avgLat = validRestaurants.reduce((sum, r) => sum + r.latitude, 0) / validRestaurants.length;
    const avgLng = validRestaurants.reduce((sum, r) => sum + r.longitude, 0) / validRestaurants.length;
    return { lat: avgLat, lng: avgLng };
  }, [restaurants]);

  /**
   * Dynamic zoom level based on number of restaurants.
   * More restaurants = zoomed out, fewer = zoomed in.
   * @type {number}
   */
  const defaultZoom = useMemo(() => {
    const validCount = restaurants.filter(r => r.latitude && r.longitude).length;
    if (validCount === 0) return 11;
    if (validCount === 1) return 15;
    if (validCount < 10) return 13;
    return 12;
  }, [restaurants]);

  /**
   * Custom Google Maps styles to hide competing POI markers.
   * Reduces visual clutter by hiding business markers and labels.
   * @type {Array<Object>}
   */
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
