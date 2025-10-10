/**
 * Restaurant Details Modal Component
 * Displays full inspection history for a selected restaurant
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  Text,
  HStack,
  VStack,
  Heading,
  Separator,
  Group,
} from '@chakra-ui/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DrawerRoot,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerBackdrop,
  DrawerCloseTrigger,
} from './ui/drawer';
import { FaMapMarkerAlt, FaPhone, FaExternalLinkAlt, FaCalendarAlt, FaClipboardCheck } from 'react-icons/fa';
import restaurantApi from '../services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

const getGradeBadgeColor = (grade) => {
  switch (grade?.toUpperCase()) {
    case 'A':
      return 'green';
    case 'B':
      return 'blue';
    case 'C':
      return 'orange';
    case 'P':
    case 'Z':
      return 'red';
    default:
      return 'gray';
  }
};

const InspectionCard = ({ inspection, index }) => {
  const getScoreColor = (score) => {
    if (score === undefined || score === null) return 'gray.600';
    if (score <= 13) return 'green.600';
    if (score <= 27) return 'blue.600';
    return 'orange.600';
  };

  const getScoreBg = (score) => {
    if (score === undefined || score === null) return 'gray.50';
    if (score <= 13) return 'green.50';
    if (score <= 27) return 'blue.50';
    return 'orange.50';
  };

  const getScoreBorder = (score) => {
    if (score === undefined || score === null) return 'gray.300';
    if (score <= 13) return 'green.400';
    if (score <= 27) return 'blue.400';
    return 'orange.400';
  };

  return (
    <Box 
      p={5} 
      bg="white" 
      borderRadius="xl" 
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="md"
      _hover={{ 
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
        borderColor: 'blue.300'
      }}
      transition="all 0.3s ease"
    >
      <Stack gap={4}>
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={2}>
            <HStack gap={2}>
              <Box 
                bg="blue.100" 
                p={2} 
                borderRadius="md"
                display="flex"
                alignItems="center"
              >
                <FaCalendarAlt color="#2563eb" size={14} />
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="md" color="gray.900">
                  {new Date(inspection.inspection_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
                {inspection.inspection_type && (
                  <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                    {inspection.inspection_type.replace(/_/g, ' ').toLowerCase()}
                  </Text>
                )}
              </Box>
            </HStack>
          </VStack>
          {inspection.grade && (
            <Badge 
              colorScheme={getGradeBadgeColor(inspection.grade)}
              fontSize="lg"
              fontWeight="extrabold"
              px={4}
              py={2}
              borderRadius="lg"
              boxShadow="sm"
            >
              {inspection.grade}
            </Badge>
          )}
        </HStack>

        {inspection.score !== undefined && inspection.score !== null && (
          <Box 
            p={4} 
            bg={getScoreBg(inspection.score)}
            borderRadius="lg"
            borderLeftWidth="4px"
            borderLeftColor={getScoreBorder(inspection.score)}
            boxShadow="sm"
          >
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Inspection Score
              </Text>
              <Text fontSize="2xl" fontWeight="extrabold" color={getScoreColor(inspection.score)}>
                {inspection.score}
              </Text>
            </HStack>
            <HStack gap={1}>
              <Text fontSize="xs" fontWeight="bold" color={getScoreColor(inspection.score)}>
                {inspection.score <= 13 ? '★ Excellent' : inspection.score <= 27 ? '✓ Good' : '⚠ Needs Improvement'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                • {inspection.score <= 13 ? 'A rating' : inspection.score <= 27 ? 'B rating' : 'C rating or below'}
              </Text>
            </HStack>
          </Box>
        )}

        {inspection.action && (
          <Box p={3} bg="blue.50" borderRadius="lg" borderWidth="1px" borderColor="blue.200">
            <HStack gap={2}>
              <Box 
                bg="blue.500" 
                p={1.5} 
                borderRadius="md"
                display="flex"
                alignItems="center"
              >
                <FaClipboardCheck color="white" size={12} />
              </Box>
              <Text fontSize="sm" color="blue.900" fontWeight="medium">
                {inspection.action}
              </Text>
            </HStack>
          </Box>
        )}

        {inspection.violation_code && (
          <Box 
            p={4} 
            bg={inspection.critical_flag === 'CRITICAL' ? 'red.50' : 'gray.50'}
            borderRadius="lg" 
            borderLeftWidth="4px" 
            borderLeftColor={inspection.critical_flag === 'CRITICAL' ? 'red.500' : 'gray.400'}
            borderWidth="1px"
            borderColor={inspection.critical_flag === 'CRITICAL' ? 'red.200' : 'gray.200'}
          >
            <HStack gap={2} mb={3} wrap="wrap">
              <Badge
                colorScheme={inspection.critical_flag === 'CRITICAL' ? 'red' : 'gray'}
                size="sm"
                variant="solid"
                fontWeight="bold"
                px={2}
                py={1}
              >
                Code {inspection.violation_code}
              </Badge>
              {inspection.critical_flag && (
                <Badge
                  colorScheme={inspection.critical_flag === 'CRITICAL' ? 'red' : 'gray'}
                  size="sm"
                  px={2}
                  py={1}
                  fontWeight="semibold"
                >
                  {inspection.critical_flag === 'CRITICAL' ? '⚠️ CRITICAL' : inspection.critical_flag.replace(/_/g, ' ')}
                </Badge>
              )}
            </HStack>
            {inspection.violation_description && (
              <Text fontSize="sm" color="gray.800" lineHeight="tall">
                {inspection.violation_description}
              </Text>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

InspectionCard.propTypes = {
  inspection: PropTypes.shape({
    inspection_date: PropTypes.string,
    grade: PropTypes.string,
    score: PropTypes.number,
    inspection_type: PropTypes.string,
    action: PropTypes.string,
    violation_code: PropTypes.string,
    violation_description: PropTypes.string,
    critical_flag: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const RestaurantDetailsModal = ({ isOpen, onClose, restaurant }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && restaurant) {
      loadDetails();
    }
  }, [isOpen, restaurant]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantApi.getRestaurantDetails({
        restaurantName: restaurant.dba,
        borough: restaurant.boro?.toUpperCase(),
      });
      setDetails(response);
    } catch (err) {
      setError(err.message || 'Failed to load restaurant details');
      console.error('Error loading details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) return null;

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.200" bg="gradient-to-r from-blue-50 to-white">
          <DrawerTitle>
            <VStack align="start" gap={2}>
              <HStack gap={2}>
                <Text fontSize="3xl">🍽️</Text>
                <Heading size="xl" color="gray.900" fontWeight="extrabold">
                  {restaurant.dba}
                </Heading>
              </HStack>
              <HStack gap={2} wrap="wrap">
                <Badge colorScheme="blue" px={3} py={1} fontSize="sm" borderRadius="full">
                  {restaurant.cuisine_description}
                </Badge>
                {restaurant.boro && (
                  <Badge colorScheme="gray" px={3} py={1} fontSize="sm" borderRadius="full">
                    📍 {restaurant.boro}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </DrawerTitle>
          <DrawerCloseTrigger top={4} right={4} />
        </DrawerHeader>

        <DrawerBody bg="gray.50">
          <Stack gap={6}>
            {/* Location Information */}
            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack gap={3} mb={5}>
                <Box 
                  bg="blue.500" 
                  p={3} 
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  boxShadow="md"
                >
                  <FaMapMarkerAlt color="white" size={20} />
                </Box>
                <Heading size="lg" color="gray.900">
                  Location & Contact
                </Heading>
              </HStack>
              
              <Stack gap={4}>
                <Box 
                  p={5} 
                  bg="gradient-to-br from-blue-50 to-blue-100" 
                  borderRadius="xl" 
                  borderWidth="2px"
                  borderColor="blue.200"
                  boxShadow="sm"
                >
                  <VStack align="start" gap={3}>
                    <HStack gap={3} align="start">
                      <Box 
                        bg="blue.500" 
                        p={2} 
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        mt={0.5}
                      >
                        <FaMapMarkerAlt color="white" size={16} />
                      </Box>
                      <Box flex={1}>
                        <Text fontWeight="bold" fontSize="md" color="gray.900" mb={1}>
                          {restaurant.building} {restaurant.street}
                        </Text>
                        <Text color="gray.700" fontSize="sm">
                          {restaurant.boro}, NY {restaurant.zipcode}
                        </Text>
                      </Box>
                    </HStack>
                    
                    {restaurant.phone && (
                      <HStack gap={3}>
                        <Box 
                          bg="green.500" 
                          p={2} 
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                        >
                          <FaPhone color="white" size={14} />
                        </Box>
                        <Text color="gray.900" fontWeight="semibold" fontSize="md">
                          {restaurant.phone}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                {/* Google Maps Integration */}
                {restaurant.latitude && restaurant.longitude && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' && (
                  <Box>
                    {/* Static Map Preview */}
                    <Box 
                      borderRadius="xl" 
                      overflow="hidden" 
                      borderWidth="2px"
                      borderColor="gray.300"
                      boxShadow="lg"
                      mb={4}
                      _hover={{ 
                        borderColor: 'blue.400',
                        boxShadow: 'xl'
                      }}
                      transition="all 0.3s"
                    >
                      <img
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${restaurant.latitude},${restaurant.longitude}&zoom=16&size=600x250&markers=color:red%7Csize:mid%7C${restaurant.latitude},${restaurant.longitude}&key=${GOOGLE_MAPS_API_KEY}&style=feature:poi|element:labels|visibility:off`}
                        alt="Restaurant location"
                        style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }}
                      />
                    </Box>
                    
                    {/* Action Buttons */}
                    <HStack gap={3} wrap="wrap">
                      <Button
                        size="md"
                        colorScheme="blue"
                        variant="solid"
                        flex={1}
                        minW="fit-content"
                        boxShadow="sm"
                        onClick={() => window.open(
                          `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`,
                          '_blank'
                        )}
                      >
                        <FaExternalLinkAlt size={14} />
                        <span style={{ marginLeft: '8px' }}>Open in Google Maps</span>
                      </Button>
                      <Button
                        size="md"
                        colorScheme="green"
                        variant="solid"
                        flex={1}
                        minW="fit-content"
                        boxShadow="sm"
                        onClick={() => window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`,
                          '_blank'
                        )}
                      >
                        <FaMapMarkerAlt size={14} />
                        <span style={{ marginLeft: '8px' }}>Get Directions</span>
                      </Button>
                    </HStack>
                  </Box>
                )}

                {/* Street View */}
                {restaurant.latitude && restaurant.longitude && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' && (
                  <Box>
                    <HStack gap={2} mb={3}>
                      <Text fontSize="md" fontWeight="bold" color="gray.800">
                        🏙️ Street View
                      </Text>
                    </HStack>
                    <Box 
                      borderRadius="xl" 
                      overflow="hidden" 
                      borderWidth="2px"
                      borderColor="gray.300"
                      boxShadow="lg"
                      _hover={{ 
                        borderColor: 'blue.400',
                        boxShadow: 'xl'
                      }}
                      transition="all 0.3s"
                    >
                      <img
                        src={`https://maps.googleapis.com/maps/api/streetview?size=600x250&location=${restaurant.latitude},${restaurant.longitude}&fov=90&pitch=0&key=${GOOGLE_MAPS_API_KEY}`}
                        alt="Street view"
                        style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Inspection History */}
            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack gap={3} mb={5}>
                <Box 
                  bg="green.500" 
                  p={3} 
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  boxShadow="md"
                >
                  <FaClipboardCheck color="white" size={20} />
                </Box>
                <Heading size="lg" color="gray.900">
                  Inspection History
                </Heading>
              </HStack>

              {loading && (
                <Box 
                  p={12} 
                  textAlign="center"
                  bg="gray.50"
                  borderRadius="xl"
                >
                  <Text fontSize="4xl" mb={3}>⏳</Text>
                  <Text fontSize="md" color="gray.600" fontWeight="medium">
                    Loading inspection history...
                  </Text>
                </Box>
              )}

              {error && (
                <Box 
                  p={6} 
                  bg="red.50" 
                  borderRadius="xl" 
                  borderWidth="2px" 
                  borderColor="red.300"
                  boxShadow="md"
                >
                  <HStack gap={3}>
                    <Text fontSize="2xl">⚠️</Text>
                    <Box>
                      <Text fontSize="md" color="red.900" fontWeight="bold" mb={1}>
                        Error Loading Data
                      </Text>
                      <Text fontSize="sm" color="red.700">
                        {error}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              )}

              {details && !loading && !error && (
                <Stack gap={5}>
                  <Box 
                    p={5} 
                    bg="gradient-to-r from-blue-50 to-blue-100" 
                    borderRadius="xl" 
                    borderLeftWidth="5px"
                    borderLeftColor="blue.500"
                    boxShadow="md"
                  >
                    <HStack justify="space-between" align="center">
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Total Inspections
                        </Text>
                        <Text fontSize="3xl" fontWeight="extrabold" color="blue.700">
                          {details.totalInspections || details.inspections?.length || 0}
                        </Text>
                      </VStack>
                      <Text fontSize="4xl">📊</Text>
                    </HStack>
                  </Box>
                  
                  {details.inspections && details.inspections.length > 0 ? (
                    <Stack gap={4} maxH="700px" overflowY="auto" pr={2} css={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '10px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#cbd5e0',
                        borderRadius: '10px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a0aec0',
                      },
                    }}>
                      {details.inspections.map((inspection, index) => (
                        <InspectionCard
                          key={`${inspection.camis}-${inspection.inspection_date}-${index}`}
                          inspection={inspection}
                          index={index}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Box 
                      p={12} 
                      textAlign="center" 
                      bg="gray.50" 
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor="gray.200"
                      borderStyle="dashed"
                    >
                      <Text fontSize="4xl" mb={3}>📋</Text>
                      <Text fontSize="md" color="gray.600" fontWeight="medium">
                        No inspection history available
                      </Text>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter 
          borderTopWidth="1px" 
          borderColor="gray.200"
          bg="white"
          boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
        >
          <Button 
            variant="solid" 
            colorScheme="gray"
            onClick={onClose} 
            width="100%"
            size="lg"
            fontWeight="bold"
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};

RestaurantDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  restaurant: PropTypes.shape({
    camis: PropTypes.string,
    dba: PropTypes.string,
    boro: PropTypes.string,
    building: PropTypes.string,
    street: PropTypes.string,
    zipcode: PropTypes.string,
    phone: PropTypes.string,
    cuisine_description: PropTypes.string,
  }),
};

export default RestaurantDetailsModal;
