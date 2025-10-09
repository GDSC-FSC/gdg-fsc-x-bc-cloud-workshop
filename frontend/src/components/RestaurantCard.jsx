/**
 * Restaurant Card Component
 * Displays individual restaurant inspection information in a card format
 */

import PropTypes from 'prop-types';
import { Box, Stack, Text, HStack, VStack } from '@chakra-ui/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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
    case 'NOT_YET_GRADED':
      return 'gray';
    default:
      return 'gray';
  }
};

const getCriticalBadgeColor = (criticalFlag) => {
  return criticalFlag === 'CRITICAL' ? 'red' : 'gray';
};

const RestaurantCard = ({ restaurant, onViewDetails }) => {
  const {
    dba,
    boro,
    building,
    street,
    zipcode,
    phone,
    cuisine_description,
    inspection_date,
    grade,
    score,
    critical_flag,
    violation_description,
    action,
  } = restaurant;

  return (
    <Card.Root
      size="sm"
      variant="outline"
      bg="white"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <CardContent p={5}>
        <Stack gap={3}>
          {/* Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1}>
              <Text fontSize="xl" fontWeight="bold" lineHeight="tight">
                {dba || 'Unknown Restaurant'}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {cuisine_description || 'Unknown Cuisine'}
              </Text>
            </VStack>
            {grade && (
              <Badge colorScheme={getGradeBadgeColor(grade)} fontSize="lg" px={3} py={1}>
                {grade}
              </Badge>
            )}
          </HStack>

          {/* Location */}
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.700">
              📍 {building && street ? `${building} ${street}` : 'Address not available'}
            </Text>
            <HStack gap={2} fontSize="sm" color="gray.600">
              <Text>{boro || 'Unknown'}</Text>
              {zipcode && <Text>• {zipcode}</Text>}
              {phone && <Text>• {phone}</Text>}
            </HStack>
          </VStack>

          {/* Inspection Info */}
          {inspection_date && (
            <Box p={3} bg="gray.50" borderRadius="md">
              <VStack align="start" gap={2}>
                <HStack justify="space-between" width="100%">
                  <Text fontSize="sm" fontWeight="medium">
                    Last Inspection: {new Date(inspection_date).toLocaleDateString()}
                  </Text>
                  {score !== undefined && score !== null && (
                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                      Score: {score}
                    </Text>
                  )}
                </HStack>

                {critical_flag && (
                  <Badge colorScheme={getCriticalBadgeColor(critical_flag)} size="sm">
                    {critical_flag.replace(/_/g, ' ')}
                  </Badge>
                )}

                {violation_description && (
                  <Text fontSize="xs" color="gray.600" noOfLines={2}>
                    {violation_description}
                  </Text>
                )}

                {action && (
                  <Text fontSize="xs" color="gray.500" fontStyle="italic">
                    {action}
                  </Text>
                )}
              </VStack>
            </Box>
          )}

          {/* View Details Button */}
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => onViewDetails(restaurant)}
            width="100%"
            mt={2}
          >
            View Full Details
          </Button>
        </Stack>
      </CardContent>
    </Card.Root>
  );
};

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    camis: PropTypes.string,
    dba: PropTypes.string,
    boro: PropTypes.string,
    building: PropTypes.string,
    street: PropTypes.string,
    zipcode: PropTypes.string,
    phone: PropTypes.string,
    cuisine_description: PropTypes.string,
    inspection_date: PropTypes.string,
    action: PropTypes.string,
    violation_code: PropTypes.string,
    violation_description: PropTypes.string,
    critical_flag: PropTypes.string,
    score: PropTypes.number,
    grade: PropTypes.string,
    grade_date: PropTypes.string,
    record_date: PropTypes.string,
    inspection_type: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
};

export default RestaurantCard;
