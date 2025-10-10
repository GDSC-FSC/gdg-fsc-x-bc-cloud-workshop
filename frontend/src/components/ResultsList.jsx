/**
 * @fileoverview Restaurant search results list component.
 * Displays search results in a responsive grid layout with loading and empty states.
 * 
 * @module components/ResultsList
 * @requires react
 * @requires prop-types
 * @requires @chakra-ui/react
 */

import PropTypes from 'prop-types';
import { Box, Grid, Text, Stack } from '@chakra-ui/react';
import RestaurantCard from './RestaurantCard';

/**
 * Displays a responsive grid of restaurant search results.
 * Handles loading states and empty results with appropriate UI feedback.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.results=[]] - Array of restaurant objects to display
 * @param {Function} props.onViewDetails - Callback invoked when user clicks on a restaurant
 * @param {boolean} [props.isLoading=false] - Loading state for search operation
 * @returns {JSX.Element} Results list UI with loading, empty, or populated states
 * 
 * @example
 * <ResultsList 
 *   results={restaurants} 
 *   onViewDetails={(restaurant) => console.log(restaurant)} 
 *   isLoading={false}
 * />
 */
const ResultsList = ({ results, onViewDetails, isLoading }) => {
  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="lg" color="gray.600">
          Loading restaurants...
        </Text>
      </Box>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box p={8} textAlign="center" bg="gray.50" borderRadius="lg">
        <Stack gap={2}>
          <Text fontSize="2xl">🍽️</Text>
          <Text fontSize="lg" fontWeight="medium" color="gray.700">
            No restaurants found
          </Text>
          <Text fontSize="sm" color="gray.600">
            Try adjusting your search filters
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontSize="lg" fontWeight="medium" mb={4} color="gray.700">
        Found {results.length} restaurant{results.length !== 1 ? 's' : ''}
      </Text>
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={4}
      >
        {results.map((restaurant, index) => (
          <RestaurantCard
            key={`${restaurant.camis}-${index}`}
            restaurant={restaurant}
            onViewDetails={onViewDetails}
          />
        ))}
      </Grid>
    </Box>
  );
};

ResultsList.propTypes = {
  results: PropTypes.array,
  onViewDetails: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ResultsList.defaultProps = {
  results: [],
  isLoading: false,
};

export default ResultsList;
