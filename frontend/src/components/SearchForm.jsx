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
import { Box, Button, Input, Stack, Text, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import { Field } from './ui/field';
import restaurantApi from '../services/api';

/**
 * Available NYC health inspection grades.
 * @constant {string[]}
 */
const GRADES = ['All', 'A', 'B', 'C', 'P', 'Z', 'NOT_YET_GRADED'];

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
      try {
        const [boroughsData, cuisinesData] = await Promise.all([
          restaurantApi.getBoroughs(),
          restaurantApi.getCuisines(),
        ]);
        setBoroughs(boroughsData.boroughs || []);
        setCuisines(cuisinesData.cuisines || []);
      } catch (error) {
        console.error('Failed to load reference data:', error);
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
    
    // Build search params, excluding empty values
    const searchParams = {};
    if (formData.borough) searchParams.borough = formData.borough;
    if (formData.cuisine) searchParams.cuisine = formData.cuisine;
    if (formData.minGrade && formData.minGrade !== 'All') {
      searchParams.minGrade = formData.minGrade;
    }
    searchParams.limit = formData.limit;

    onSearch(searchParams);
  };

  /**
   * Resets the form to its default state.
   * 
   * @function
   * @returns {void}
   */
  const handleReset = () => {
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
          <NativeSelectRoot>
            <NativeSelectField
              value={formData.borough}
              onChange={(e) => setFormData({ ...formData, borough: e.target.value })}
              disabled={isLoading}
            >
              <option value="">All Boroughs</option>
              {boroughs.map((borough) => (
                <option key={borough} value={borough}>
                  {borough}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
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
          <NativeSelectRoot>
            <NativeSelectField
              value={formData.minGrade}
              onChange={(e) => setFormData({ ...formData, minGrade: e.target.value })}
              disabled={isLoading}
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade === 'All' ? '' : grade}>
                  {grade === 'All' ? 'All Grades' : `Grade ${grade}`}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
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
