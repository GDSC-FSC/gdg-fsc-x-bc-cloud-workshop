/**
 * Results List Component
 * Displays a grid of restaurant search results
 */

import PropTypes from 'prop-types';
import { Box, Grid, Text, Stack } from '@chakra-ui/react';
import RestaurantCard from './RestaurantCard';

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
