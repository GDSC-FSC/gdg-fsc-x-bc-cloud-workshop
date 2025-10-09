import { useState, useEffect } from 'react';
import { Container, Box, Stack, Text, Heading, VStack } from '@chakra-ui/react';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import RestaurantDetailsModal from './components/RestaurantDetailsModal';
import restaurantApi from './services/api';

function App() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [notification, setNotification] = useState(null);

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

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="blue.600" color="white" py={6} boxShadow="md">
        <Container maxW="7xl">
          <VStack gap={2} align="start">
            <Heading size="2xl">🍕 NYC Restaurants Inspector</Heading>
            <Text fontSize="lg" opacity={0.9}>
              Search 200,000+ NYC restaurant health inspection records
            </Text>
            <Text fontSize="sm" opacity={0.8}>
              API Status:{' '}
              <Box
                as="span"
                display="inline-block"
                w={2}
                h={2}
                borderRadius="full"
                bg={apiStatus === 'connected' ? 'green.400' : apiStatus === 'disconnected' ? 'red.400' : 'yellow.400'}
                mr={1}
              />
              {apiStatus === 'connected' ? 'Connected' : apiStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <Stack gap={8}>
          {/* Notification Banner */}
          {notification && (
            <Box
              p={4}
              borderRadius="md"
              bg={notification.type === 'success' ? 'green.50' : 'red.50'}
              borderWidth="1px"
              borderColor={notification.type === 'success' ? 'green.200' : 'red.200'}
              color={notification.type === 'success' ? 'green.800' : 'red.800'}
            >
              <Text fontWeight="medium">
                {notification.type === 'success' ? '✅ ' : '❌ '}
                {notification.message}
              </Text>
            </Box>
          )}

          {/* Search Form */}
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          {/* Results */}
          <ResultsList
            results={results}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </Stack>
      </Container>

      {/* Details Modal */}
      <RestaurantDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        restaurant={selectedRestaurant}
      />

      {/* Footer */}
      <Box as="footer" bg="gray.800" color="white" py={6} mt={12}>
        <Container maxW="7xl">
          <VStack gap={2}>
            <Text fontSize="sm">
              Data sourced from NYC Department of Health and Mental Hygiene
            </Text>
            <Text fontSize="xs" opacity={0.7}>
              Built with React, Vite, Spring Boot & PostgreSQL | GDSC FSC Workshop
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
