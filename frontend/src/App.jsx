/**
 * @fileoverview Main application component for NYC Restaurants Inspector.
 * Manages application state, API connectivity, search functionality, and view modes.
 * 
 * @module App
 * @requires react
 * @requires @chakra-ui/react
 * @requires react-icons/fa
 */

import { useState, useEffect } from 'react';
import { Container, Box, Stack, Text, Heading, VStack, HStack, Group } from '@chakra-ui/react';
import { FaList, FaMapMarkedAlt, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import RestaurantMap from './components/RestaurantMap';
import RestaurantDetailsModal from './components/RestaurantDetailsModal';
import { EnvDebug } from './components/EnvDebug';
import { Button } from './components/ui/button';
import { restaurantApi } from './services/api';

/**
 * Main application component that orchestrates the NYC Restaurants Inspector.
 * Provides search functionality, API health monitoring, and toggleable view modes (list/map).
 * 
 * @component
 * @returns {JSX.Element} The main application UI
 * 
 * @example
 * // Rendered in main.jsx
 * <App />
 */
function App() {
  /**
   * @type {[Array<Object>, Function]} Search results from the API
   */
  const [results, setResults] = useState([]);
  
  /**
   * @type {[boolean, Function]} Loading state for search operations
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * @type {[Object|null, Function]} Currently selected restaurant for details view
   */
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  /**
   * @type {[boolean, Function]} Details modal visibility state
   */
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  /**
   * @type {[string, Function]} API connection status ('checking' | 'connected' | 'disconnected')
   */
  const [apiStatus, setApiStatus] = useState('checking');
  
  /**
   * @type {[Object|null, Function]} Notification message with type and text
   */
  const [notification, setNotification] = useState(null);
  
  /**
   * @type {[string, Function]} Current view mode ('list' | 'map')
   */
  const [viewMode, setViewMode] = useState('list');

  /**
   * Check API health status on component mount.
   * Runs once when the component is first rendered.
   */
  useEffect(() => {
    checkApiHealth();
  }, []);

  /**
   * Checks the health status of the backend API.
   * Updates apiStatus state based on the response.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const checkApiHealth = async () => {
    console.log('🏥 [App] Starting API health check...');
    try {
      const healthData = await restaurantApi.healthCheck();
      setApiStatus('connected');
      console.log('✅ [App] API Connected:', {
        status: 'connected',
        apiHealth: healthData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setApiStatus('disconnected');
      console.error('❌ [App] API Connection Failed:', {
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Filters and sorts restaurants based on grade criteria.
   * Uses an efficient O(n) algorithm to filter by grade and sort by grade value.
   * 
   * Grade hierarchy: A (best) > B > C > P > Z (worst)
   * When filtering by minGrade 'C', only restaurants with grade C, P, or Z are included.
   * 
   * @function
   * @param {Array<Object>} restaurants - Raw restaurant data from API
   * @param {string} [minGrade] - Minimum grade filter (e.g., 'C')
   * @returns {Array<Object>} Filtered and sorted restaurants
   */
  const filterAndSortByGrade = (restaurants, minGrade) => {
    if (!minGrade || minGrade === 'All') {
      console.log('🔧 [App] No grade filter applied, returning all results');
      return restaurants;
    }

    // Define grade hierarchy (lower index = better grade)
    const gradeOrder = ['A', 'B', 'C', 'P', 'Z'];
    const minGradeIndex = gradeOrder.indexOf(minGrade);

    if (minGradeIndex === -1) {
      console.warn('⚠️ [App] Invalid grade filter:', minGrade);
      return restaurants;
    }

    console.log(`🔧 [App] ===== GRADE FILTERING START =====`);
    console.log(`🔧 [App] Filter: Grade ${minGrade} or LOWER (worse grades)`);
    console.log(`🔧 [App] Valid grades for filter: ${gradeOrder.slice(minGradeIndex).join(', ')}`);
    console.log(`📊 [App] Initial restaurant count: ${restaurants.length}`);

    // Log first 3 restaurants to see their grade format
    console.log(`📋 [App] Sample restaurants (first 3):`, 
      restaurants.slice(0, 3).map(r => ({
        name: r.dba,
        grade: r.grade,
        gradeType: typeof r.grade
      }))
    );

    // Filter: O(n) - single pass through array
    let filteredOutCount = 0;
    const filtered = restaurants.filter(restaurant => {
      const restaurantGrade = restaurant.grade?.trim().toUpperCase();
      
      // Skip restaurants without grades
      if (!restaurantGrade) {
        console.log(`⚠️ [App] No grade for: ${restaurant.dba}`);
        return false;
      }

      const restaurantGradeIndex = gradeOrder.indexOf(restaurantGrade);
      
      // Include only if grade is at minGrade level or lower (worse)
      const shouldInclude = restaurantGradeIndex >= minGradeIndex;
      
      if (!shouldInclude) {
        filteredOutCount++;
        if (filteredOutCount <= 5) { // Only log first 5 to avoid spam
          console.log(`❌ [App] Filtered out: ${restaurant.dba} (Grade ${restaurantGrade}) - better than ${minGrade}`);
        }
      } else {
        console.log(`✅ [App] Included: ${restaurant.dba} (Grade ${restaurantGrade})`);
      }
      
      return shouldInclude;
    });

    console.log(`📊 [App] After filtering: ${filtered.length} restaurants (removed ${filteredOutCount})`);

    // Sort: O(n log n) - stable sort by grade quality (best to worst)
    filtered.sort((a, b) => {
      const gradeA = a.grade?.trim().toUpperCase() || 'Z';
      const gradeB = b.grade?.trim().toUpperCase() || 'Z';
      const indexA = gradeOrder.indexOf(gradeA);
      const indexB = gradeOrder.indexOf(gradeB);
      
      // If grade not found, push to end
      const finalIndexA = indexA === -1 ? 999 : indexA;
      const finalIndexB = indexB === -1 ? 999 : indexB;
      
      return finalIndexA - finalIndexB;
    });

    console.log('✅ [App] Filtering and sorting complete');
    const gradeDistribution = filtered.reduce((acc, r) => {
      const grade = r.grade?.trim().toUpperCase() || 'NONE';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 [App] Grade distribution:', gradeDistribution);
    console.log(`🔧 [App] ===== GRADE FILTERING END =====`);

    return filtered;
  };

  /**
   * Handles restaurant search requests from the SearchForm.
   * Makes API call, updates results, and manages loading/notification states.
   * Applies client-side filtering and sorting for grade-based searches.
   * 
   * @async
   * @function
   * @param {Object} searchParams - Search parameters from the form
   * @param {string} [searchParams.borough] - Borough to filter by
   * @param {string} [searchParams.cuisine] - Cuisine type to filter by
   * @param {string} [searchParams.minGrade] - Minimum grade to filter by
   * @param {number} [searchParams.limit] - Maximum number of results
   * @returns {Promise<void>}
   */
  const handleSearch = async (searchParams) => {
    console.log('🔍 [App] Starting search with params:', searchParams);
    setIsLoading(true);
    setNotification(null);
    try {
      const response = await restaurantApi.searchRestaurants(searchParams);
      let restaurants = response.restaurants || [];
      const count = response.count || 0;
      
      console.log(`📦 [App] Received ${restaurants.length} restaurants from API`);
      
      // Apply client-side grade filtering and sorting
      if (searchParams.minGrade && searchParams.minGrade !== 'All') {
        restaurants = filterAndSortByGrade(restaurants, searchParams.minGrade);
      }
      
      setResults(restaurants);
      setNotification({
        type: 'success',
        message: `Found ${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''}`
      });
      console.log('✅ [App] Search Complete:', {
        originalCount: count,
        filteredCount: restaurants.length,
        firstResult: restaurants[0] || null,
        timestamp: new Date().toISOString(),
      });

      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('❌ [App] Search Failed:', {
        error: error.message || 'An error occurred while searching',
        searchParams,
        timestamp: new Date().toISOString(),
      });
      setResults([]);
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while searching'
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 [App] Search operation complete. Loading state:', false);
    }
  };

  /**
   * Opens the details modal for a selected restaurant.
   * 
   * @function
   * @param {Object} restaurant - Restaurant object to display details for
   * @param {string} restaurant.dba - Restaurant name
   * @param {string} restaurant.boro - Borough location
   * @param {string} restaurant.building - Building number
   * @param {string} restaurant.street - Street name
   * @returns {void}
   */
  const handleViewDetails = (restaurant) => {
    console.log('📋 [App] Opening details for restaurant:', {
      name: restaurant.dba,
      borough: restaurant.boro,
      address: `${restaurant.building} ${restaurant.street}`,
    });
    setSelectedRestaurant(restaurant);
    setIsDetailsOpen(true);
  };

  /**
   * Closes the details modal and clears selected restaurant.
   * 
   * @function
   * @returns {void}
   */
  const handleCloseDetails = () => {
    console.log('❌ [App] Closing details modal');
    setIsDetailsOpen(false);
    setSelectedRestaurant(null);
  };

  /**
   * Returns the appropriate icon component based on API status.
   * 
   * @function
   * @returns {JSX.Element} Icon component (CheckCircle, ExclamationCircle, or Clock)
   */
  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'connected':
        return <FaCheckCircle color="#10b981" />;
      case 'disconnected':
        return <FaExclamationCircle color="#ef4444" />;
      default:
        return <FaClock color="#f59e0b" />;
    }
  };

  /**
   * Returns the appropriate color string based on API status.
   * Used for styling the status indicator.
   * 
   * @function
   * @returns {string} Chakra UI color token ('green.500' | 'red.500' | 'yellow.500')
   */
  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'connected':
        return 'green.500';
      case 'disconnected':
        return 'red.500';
      default:
        return 'yellow.500';
    }
  };

  return (
    <Box minH="100vh" bg="gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <Box 
        bg="linear-gradient(135deg, #2563eb 0%, #1e40af 100%)" 
        color="white" 
        py={8} 
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
        borderBottomWidth="4px"
        borderBottomColor="blue.700"
      >
        <Container maxW="7xl">
          <VStack gap={3} align="start">
            <HStack gap={3} align="center">
              <Text fontSize="5xl">🍕</Text>
              <Box>
                <Heading 
                  size="3xl" 
                  fontWeight="extrabold"
                  letterSpacing="tight"
                >
                  NYC Restaurants Inspector
                </Heading>
                <Text fontSize="lg" opacity={0.95} mt={1} fontWeight="medium">
                  Search and explore 200,000+ NYC restaurant health inspection records
                </Text>
              </Box>
            </HStack>
            <HStack 
              gap={2} 
              bg="whiteAlpha.200" 
              px={3} 
              py={2} 
              borderRadius="full"
              backdropFilter="blur(10px)"
            >
              {getApiStatusIcon()}
              <Text fontSize="sm" fontWeight="medium">
                API Status: {apiStatus === 'connected' ? 'Connected' : apiStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={10}>
        <Stack gap={8}>
          {/* Notification Banner */}
          {notification && (
            <Box
              p={4}
              borderRadius="lg"
              bg={notification.type === 'success' ? 'green.50' : 'red.50'}
              borderWidth="2px"
              borderColor={notification.type === 'success' ? 'green.300' : 'red.300'}
              color={notification.type === 'success' ? 'green.800' : 'red.800'}
              boxShadow="md"
              animation="slideInDown 0.3s ease-out"
            >
              <HStack gap={2}>
                <Text fontSize="xl">
                  {notification.type === 'success' ? '✅' : '❌'}
                </Text>
                <Text fontWeight="semibold">
                  {notification.message}
                </Text>
              </HStack>
            </Box>
          )}

          {/* Environment Debug (temporary) */}
          {/* <EnvDebug /> */}

          {/* Search Form */}
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          {/* View Mode Toggle & Results Count */}
          {results.length > 0 && (
            <Box>
              <HStack justify="space-between" mb={4}>
                <HStack gap={3}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.700">
                    {results.length} Result{results.length !== 1 ? 's' : ''}
                  </Text>
                </HStack>
                
                <Group gap={0} borderRadius="lg" overflow="hidden" boxShadow="sm">
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'solid' : 'outline'}
                    colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('list')}
                    borderRadius="0"
                    borderRightWidth="1px"
                  >
                    <FaList />
                    <span style={{ marginLeft: '8px' }}>List View</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'map' ? 'solid' : 'outline'}
                    colorScheme={viewMode === 'map' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('map')}
                    borderRadius="0"
                  >
                    <FaMapMarkedAlt />
                    <span style={{ marginLeft: '8px' }}>Map View</span>
                  </Button>
                </Group>
              </HStack>

              {/* Results Display */}
              {viewMode === 'list' ? (
                <ResultsList
                  results={results}
                  onViewDetails={handleViewDetails}
                  isLoading={isLoading}
                />
              ) : (
                <RestaurantMap
                  restaurants={results}
                  onViewDetails={handleViewDetails}
                />
              )}
            </Box>
          )}

          {/* Empty State - Only when not loading and no results */}
          {!isLoading && results.length === 0 && (
            <Box 
              p={12} 
              textAlign="center" 
              bg="white" 
              borderRadius="xl"
              boxShadow="md"
            >
              <Text fontSize="5xl" mb={4}>🔍</Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.700" mb={2}>
                Start Your Search
              </Text>
              <Text color="gray.500">
                Use the search form above to find NYC restaurants and view their health inspection records
              </Text>
            </Box>
          )}
        </Stack>
      </Container>

      {/* Details Modal */}
      <RestaurantDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        restaurant={selectedRestaurant}
      />

      {/* Footer */}
      <Box 
        as="footer" 
        bg="linear-gradient(135deg, #1f2937 0%, #111827 100%)" 
        color="white" 
        py={8} 
        mt={16}
        borderTopWidth="4px"
        borderTopColor="blue.500"
      >
        <Container maxW="7xl">
          <VStack gap={4}>
            <HStack gap={2} fontSize="2xl">
              <Text>🍕</Text>
              <Text>🗽</Text>
              <Text>📊</Text>
            </HStack>
            <VStack gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                Data sourced from NYC Department of Health and Mental Hygiene
              </Text>
              <Text fontSize="xs" opacity={0.7}>
                Built with React, Vite, Chakra UI, Google Maps & Spring Boot
              </Text>
              <Text fontSize="xs" opacity={0.6}>
                GDSC FSC x BC Cloud Workshop © {new Date().getFullYear()}
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
