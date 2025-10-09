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
import restaurantApi from '../services/api';

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

const InspectionCard = ({ inspection }) => {
  return (
    <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
      <Stack gap={3}>
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="sm">
            {new Date(inspection.inspection_date).toLocaleDateString()}
          </Text>
          {inspection.grade && (
            <Badge colorScheme={getGradeBadgeColor(inspection.grade)}>
              Grade {inspection.grade}
            </Badge>
          )}
        </HStack>

        {inspection.score !== undefined && inspection.score !== null && (
          <Text fontSize="sm">
            <strong>Score:</strong> {inspection.score}
          </Text>
        )}

        {inspection.inspection_type && (
          <Text fontSize="sm">
            <strong>Type:</strong> {inspection.inspection_type.replace(/_/g, ' ')}
          </Text>
        )}

        {inspection.action && (
          <Text fontSize="sm" color="gray.700">
            <strong>Action:</strong> {inspection.action}
          </Text>
        )}

        {inspection.violation_code && (
          <Box>
            <HStack gap={2} mb={1}>
              <Badge
                colorScheme={
                  inspection.critical_flag === 'CRITICAL' ? 'red' : 'gray'
                }
                size="sm"
              >
                {inspection.violation_code}
              </Badge>
              {inspection.critical_flag && (
                <Badge
                  colorScheme={
                    inspection.critical_flag === 'CRITICAL' ? 'red' : 'gray'
                  }
                  size="sm"
                >
                  {inspection.critical_flag.replace(/_/g, ' ')}
                </Badge>
              )}
            </HStack>
            {inspection.violation_description && (
              <Text fontSize="xs" color="gray.600">
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
        borough: restaurant.boro,
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
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="md">
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <VStack align="start" gap={1}>
              <Heading size="lg">{restaurant.dba}</Heading>
              <Text fontSize="sm" color="gray.600" fontWeight="normal">
                {restaurant.cuisine_description}
              </Text>
            </VStack>
          </DrawerTitle>
          <DrawerCloseTrigger />
        </DrawerHeader>

        <DrawerBody>
          <Stack gap={4}>
            {/* Location Information */}
            <Box>
              <Heading size="sm" mb={2}>
                📍 Location
              </Heading>
              <VStack align="start" gap={1} fontSize="sm">
                <Text>
                  {restaurant.building} {restaurant.street}
                </Text>
                <Text>
                  {restaurant.boro}, NY {restaurant.zipcode}
                </Text>
                {restaurant.phone && <Text>📞 {restaurant.phone}</Text>}
              </VStack>
            </Box>

            <Separator />

            {/* Inspection History */}
            <Box>
              <Heading size="sm" mb={3}>
                📋 Inspection History
              </Heading>

              {loading && (
                <Text fontSize="sm" color="gray.600">
                  Loading inspection history...
                </Text>
              )}

              {error && (
                <Box p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
                  <Text fontSize="sm" color="red.700">
                    {error}
                  </Text>
                </Box>
              )}

              {details && !loading && !error && (
                <Stack gap={3}>
                  <Text fontSize="sm" color="gray.600">
                    Total Inspections: {details.totalInspections || details.inspections?.length || 0}
                  </Text>
                  
                  {details.inspections && details.inspections.length > 0 ? (
                    <Stack gap={3} maxH="500px" overflowY="auto">
                      {details.inspections.map((inspection, index) => (
                        <InspectionCard
                          key={`${inspection.camis}-${inspection.inspection_date}-${index}`}
                          inspection={inspection}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No inspection history available
                    </Text>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" onClick={onClose} width="100%">
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
