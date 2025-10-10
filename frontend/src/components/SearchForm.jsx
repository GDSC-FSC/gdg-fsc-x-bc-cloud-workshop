/**
 * @fileoverview Restaurant search form component with dynamic filters.
 * Provides UI for filtering NYC restaurants by borough, cuisine, grade, and result limit.
 * Loads reference data (boroughs, cuisines) from the API on mount.
 * 
 * @module components/SearchForm
 * @requires react
 * @requires prop-types
 * @requires @chakra-ui/react
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Input, Stack, Text } from '@chakra-ui/react';
import { Button } from './ui/button';
import { Field } from './ui/field';
import { NativeSelect } from './ui/native-select';
import restaurantApi from '../services/api';

/**
 * Available NYC health inspection grades.
 * @constant {string[]}
 */
const GRADES = ['All', 'A', 'B', 'C', 'P', 'Z'];

/**
 * Restaurant search form component with dynamic filtering.
 * Fetches available boroughs and cuisines from the API and provides
 * a form interface for searching restaurants with various criteria.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback function invoked with search parameters
 * @param {boolean} [props.isLoading=false] - Loading state to disable form inputs
 * @returns {JSX.Element} Search form UI
 * 
 * @example
 * <SearchForm 
 *   onSearch={(params) => console.log(params)} 
 *   isLoading={false} 
 * />
 */
const SearchForm = ({ onSearch, isLoading }) => {
  /**
   * @type {[string[], Function]} List of available NYC boroughs
   */
  const [boroughs, setBoroughs] = useState([]);
  
  /**
   * @type {[string[], Function]} List of available cuisine types
   */
  const [cuisines, setCuisines] = useState([]);
  
  /**
   * @type {[Object, Function]} Form data state
   * @property {string} borough - Selected borough filter
   * @property {string} cuisine - Cuisine type filter (partial match)
   * @property {string} minGrade - Minimum health grade filter
   * @property {number} limit - Maximum number of results (1-1000)
   */
  const [formData, setFormData] = useState({
    borough: '',
    cuisine: '',
    minGrade: '',
    limit: 50,
  });

  /**
   * Loads reference data (boroughs and cuisines) from the API on component mount.
   * Fetches both datasets in parallel for better performance.
   */
  useEffect(() => {
    /**
     * Fetches boroughs and cuisines from the API.
     * @async
     * @function
     * @returns {Promise<void>}
     */
    const loadReferenceData = async () => {
      console.log('🔄 [SearchForm] Loading reference data (boroughs & cuisines)...');
      try {
        const [boroughsData, cuisinesData] = await Promise.all([
          restaurantApi.getBoroughs(),
          restaurantApi.getCuisines(),
        ]);
        
        console.log('📦 [SearchForm] Raw API responses:', {
          boroughsData: { type: Array.isArray(boroughsData) ? 'array' : typeof boroughsData, data: boroughsData },
          cuisinesData: { type: Array.isArray(cuisinesData) ? 'array' : typeof cuisinesData, length: cuisinesData?.length },
        });
        
        // API returns flat arrays directly, not wrapped in objects
        const boroughsList = Array.isArray(boroughsData) ? boroughsData : (boroughsData.boroughs || []);
        const cuisinesList = Array.isArray(cuisinesData) ? cuisinesData : (cuisinesData.cuisines || []);
        
        // Filter out invalid values (like "0" in boroughs)
        const validBoroughs = boroughsList.filter(b => b && b !== '0' && b.trim() !== '');
        const validCuisines = cuisinesList.filter(c => c && c.trim() !== '');
        
        console.log('✅ [SearchForm] Reference data loaded:', {
          boroughs: { count: validBoroughs.length, items: validBoroughs },
          cuisines: { count: validCuisines.length, sample: validCuisines.slice(0, 10) },
          timestamp: new Date().toISOString(),
        });
        
        setBoroughs(validBoroughs);
        setCuisines(validCuisines);
      } catch (error) {
        console.error('❌ [SearchForm] Failed to load reference data:', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
      }
    };
    loadReferenceData();
  }, []);

  /**
   * Handles form submission and triggers search with non-empty parameters.
   * Filters out empty values and normalizes the minGrade field.
   * 
   * @function
   * @param {Event} e - Form submit event
   * @returns {void}
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📝 [SearchForm] Form submitted with data:', formData);
    
    // Build search params, excluding empty values
    const searchParams = {};
    if (formData.borough) searchParams.borough = formData.borough;
    if (formData.cuisine) searchParams.cuisine = formData.cuisine;
    if (formData.minGrade && formData.minGrade !== 'All') {
      searchParams.minGrade = formData.minGrade;
    }
    searchParams.limit = formData.limit;
    
    console.log('🔍 [SearchForm] Triggering search with params:', searchParams);

    onSearch(searchParams);
  };

  /**
   * Resets the form to its default state.
   * 
   * @function
   * @returns {void}
   */
  const handleReset = () => {
    console.log('🔄 [SearchForm] Resetting form to defaults');
    setFormData({
      borough: '',
      cuisine: '',
      minGrade: '',
      limit: 50,
    });
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={6}
      borderRadius="lg"
      bg="white"
      boxShadow="md"
      borderWidth="1px"
    >
      <Stack gap={4}>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          🍕 Search NYC Restaurants
        </Text>

        <Field label="Borough" helperText="Select a specific NYC borough">
          <NativeSelect
            value={formData.borough}
            onChange={(e) => setFormData({ ...formData, borough: e.target.value })}
            disabled={isLoading}
            placeholder="All Boroughs"
          >
            {boroughs.map((borough) => (
              <option key={borough} value={borough}>
                {borough}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Cuisine Type" helperText="Filter by cuisine (partial match)">
          <Input
            type="text"
            placeholder="e.g., Pizza, Chinese, Italian"
            value={formData.cuisine}
            onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
            disabled={isLoading}
            list="cuisine-suggestions"
          />
          <datalist id="cuisine-suggestions">
            {cuisines.slice(0, 20).map((cuisine) => (
              <option key={cuisine} value={cuisine} />
            ))}
          </datalist>
        </Field>

        <Field label="Minimum Grade" helperText="Filter by health inspection grade">
          <NativeSelect
            value={formData.minGrade}
            onChange={(e) => setFormData({ ...formData, minGrade: e.target.value })}
            disabled={isLoading}
            placeholder="All Grades"
          >
            {GRADES.filter(g => g !== 'All').map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Results Limit" helperText="Maximum number of results (1-1000)">
          <Input
            type="number"
            min="1"
            max="1000"
            value={formData.limit}
            onChange={(e) =>
              setFormData({ ...formData, limit: parseInt(e.target.value, 10) || 50 })
            }
            disabled={isLoading}
          />
        </Field>

        <Stack direction="row" gap={3} mt={4}>
          <Button
            type="submit"
            colorScheme="blue"
            flex={1}
            loading={isLoading}
            disabled={isLoading}
          >
            🔍 Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

SearchForm.defaultProps = {
  isLoading: false,
};

export default SearchForm;
