/**
 * @fileoverview Individual restaurant card component with inspection details.
 * Displays restaurant information including grade, location, inspection date,
 * violations, and critical flags in a styled card format.
 * 
 * @module components/RestaurantCard
 * @requires react
 * @requires prop-types
 * @requires @chakra-ui/react
 * @requires react-icons/fa
 */

import PropTypes from 'prop-types';
import { Box, Stack, Text, HStack, VStack, Group } from '@chakra-ui/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FaUtensils, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

/**
 * Returns the color scheme for a grade badge.
 * Maps health inspection grades to Chakra UI color schemes.
 * 
 * @function
 * @param {string} grade - Health inspection grade (A, B, C, P, Z, NOT_YET_GRADED)
 * @returns {string} Chakra UI color scheme name
 */
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

/**
 * Returns the gradient background style for a grade ribbon.
 * Creates color-coded gradient backgrounds for visual grade representation.
 * 
 * @function
 * @param {string} grade - Health inspection grade (A, B, C, P, Z)
 * @returns {string} CSS gradient string
 */
const getGradeBackground = (grade) => {
  switch (grade?.toUpperCase()) {
    case 'A':
      return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    case 'B':
      return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    case 'C':
      return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
    case 'P':
    case 'Z':
      return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    default:
      return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
  }
};

/**
 * Returns the color scheme for a critical flag badge.
 * Determines badge color based on violation criticality.
 * 
 * @function
 * @param {string} criticalFlag - Critical flag value ('CRITICAL' or other)
 * @returns {string} Chakra UI color scheme name ('red' or 'gray')
 */
const getCriticalBadgeColor = (criticalFlag) => {
  return criticalFlag === 'CRITICAL' ? 'red' : 'gray';
};

/**
 * Returns the color for an inspection score based on severity.
 * Lower scores are better (green), higher scores indicate more violations (orange).
 * 
 * @function
 * @param {number} score - Inspection score
 * @returns {string} Chakra UI color token
 */
const getScoreColor = (score) => {
  if (score === undefined || score === null) return 'gray.600';
  if (score <= 13) return 'green.600';
  if (score <= 27) return 'blue.600';
  return 'orange.600';
};

/**
 * Restaurant card component displaying inspection details.
 * Shows restaurant name, location, inspection grade, score, violations,
 * and critical flags in an interactive card with hover effects.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Restaurant data object
 * @param {string} props.restaurant.camis - Unique restaurant identifier
 * @param {string} props.restaurant.dba - Restaurant name (Doing Business As)
 * @param {string} props.restaurant.boro - Borough location
 * @param {string} props.restaurant.building - Building number
 * @param {string} props.restaurant.street - Street name
 * @param {string} props.restaurant.zipcode - ZIP code
 * @param {string} props.restaurant.phone - Phone number
 * @param {string} props.restaurant.cuisine_description - Cuisine type
 * @param {string} props.restaurant.inspection_date - Inspection date (ISO format)
 * @param {string} props.restaurant.grade - Health grade (A, B, C, P, Z, NOT_YET_GRADED)
 * @param {number} props.restaurant.score - Inspection score (lower is better)
 * @param {string} props.restaurant.critical_flag - Violation criticality
 * @param {string} props.restaurant.violation_description - Description of violations
 * @param {string} props.restaurant.action - Action taken by inspector
 * @param {Function} props.onViewDetails - Callback invoked when card is clicked
 * @returns {JSX.Element} Restaurant card UI
 * 
 * @example
 * <RestaurantCard 
 *   restaurant={restaurantData} 
 *   onViewDetails={(restaurant) => console.log(restaurant)}
 * />
 */
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
    <Card
      size="sm"
      variant="outline"
      bg="white"
      _hover={{ 
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-4px)',
        borderColor: 'blue.200'
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      cursor="pointer"
      onClick={() => onViewDetails(restaurant)}
      position="relative"
      overflow="hidden"
    >
      {/* Grade Badge Ribbon */}
      {grade && (
        <Box
          position="absolute"
          top={3}
          right={3}
          zIndex={1}
        >
          <Box
            background={getGradeBackground(grade)}
            color="white"
            fontSize="2xl"
            fontWeight="bold"
            px={4}
            py={2}
            borderRadius="lg"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="50px"
            minH="50px"
          >
            {grade}
          </Box>
        </Box>
      )}

      <CardContent p={5} pt={grade ? 7 : 5}>
        <Stack gap={4}>
          {/* Header */}
          <Box pr={grade ? 16 : 0}>
            <HStack gap={2} mb={1}>
              <FaUtensils color="#3b82f6" />
              <Text fontSize="xl" fontWeight="bold" lineHeight="tight" color="gray.800">
                {dba || 'Unknown Restaurant'}
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              {cuisine_description || 'Unknown Cuisine'}
            </Text>
          </Box>

          {/* Location Section */}
          <Box 
            p={3} 
            bg="gradient-to-r from-gray-50 to-blue-50" 
            borderRadius="md"
            borderLeftWidth="3px"
            borderLeftColor="blue.400"
          >
            <VStack align="start" gap={2}>
              <HStack gap={2}>
                <FaMapMarkerAlt color="#3b82f6" size={14} />
                <Text fontSize="sm" color="gray.700" fontWeight="medium">
                  {building && street ? `${building} ${street}` : 'Address not available'}
                </Text>
              </HStack>
              <Group gap={3} fontSize="sm" color="gray.600">
                <Badge colorScheme="blue" variant="subtle" size="sm">
                  {boro || 'Unknown Borough'}
                </Badge>
                {zipcode && (
                  <Text fontSize="xs" fontWeight="medium">{zipcode}</Text>
                )}
                {phone && (
                  <HStack gap={1}>
                    <FaPhone size={10} />
                    <Text fontSize="xs">{phone}</Text>
                  </HStack>
                )}
              </Group>
            </VStack>
          </Box>

          {/* Inspection Info */}
          {inspection_date && (
            <Box 
              p={3} 
              bg="gray.50" 
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <VStack align="start" gap={3}>
                <HStack justify="space-between" width="100%">
                  <HStack gap={2}>
                    <FaCalendarAlt color="#6b7280" size={14} />
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                      {new Date(inspection_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </HStack>
                  {score !== undefined && score !== null && (
                    <HStack gap={1}>
                      {score <= 13 ? <FaCheckCircle color="#10b981" size={14} /> : <FaExclamationTriangle color="#f97316" size={14} />}
                      <Text fontSize="sm" fontWeight="bold" color={getScoreColor(score)}>
                        Score: {score}
                      </Text>
                    </HStack>
                  )}
                </HStack>

                {critical_flag && (
                  <Badge 
                    colorScheme={getCriticalBadgeColor(critical_flag)} 
                    size="sm"
                    variant={critical_flag === 'CRITICAL' ? 'solid' : 'subtle'}
                  >
                    {critical_flag === 'CRITICAL' ? '⚠️ ' : ''}
                    {critical_flag.replace(/_/g, ' ')}
                  </Badge>
                )}

                {violation_description && (
                  <Text fontSize="xs" color="gray.600" lineClamp={2} lineHeight="tall">
                    {violation_description}
                  </Text>
                )}

                {action && (
                  <Text fontSize="xs" color="gray.500" fontStyle="italic" lineClamp={1}>
                    {action}
                  </Text>
                )}
              </VStack>
            </Box>
          )}

          {/* View Details Button */}
          <Button
            size="sm"
            colorScheme="blue"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(restaurant);
            }}
            width="100%"
            mt={2}
            _hover={{
              transform: 'scale(1.02)',
              boxShadow: 'md'
            }}
            transition="all 0.2s"
          >
            View Full Details →
          </Button>
        </Stack>
      </CardContent>
    </Card>
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
