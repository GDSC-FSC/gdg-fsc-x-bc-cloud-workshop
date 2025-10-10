import { useState, useEffect } from 'react';
import { Container, Box, Stack, Text, Heading, VStack, HStack, Group } from '@chakra-ui/react';
import { FaList, FaMapMarkedAlt, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import RestaurantMap from './components/RestaurantMap';
import RestaurantDetailsModal from './components/RestaurantDetailsModal';
import { EnvDebug } from './components/EnvDebug';
import { Button } from './components/ui/button';
import restaurantApi from './services/api';

function App() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await restaurantApi.healthCheck();
      setApiStatus('connected');
      console.log('✅ API Connected: Successfully connected to NYC Restaurants API');
    } catch (error) {
      setApiStatus('disconnected');
      console.error('❌ API Connection Failed: Could not connect to the backend API. Please ensure it is running on port 8080.');
    }
  };

  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    setNotification(null);
    try {
      const response = await restaurantApi.searchRestaurants(searchParams);
      setResults(response.restaurants || []);
      setNotification({
        type: 'success',
        message: `Found ${response.count || 0} restaurant${response.count !== 1 ? 's' : ''}`
      });
      console.log(`✅ Search Complete: Found ${response.count || 0} restaurant${response.count !== 1 ? 's' : ''}`);

      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('❌ Search Failed:', error.message || 'An error occurred while searching');
      setResults([]);
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while searching'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRestaurant(null);
  };

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
