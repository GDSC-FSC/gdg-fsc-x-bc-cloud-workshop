/**
 * API client for NYC Restaurants backend
 * Handles all HTTP requests to the Spring Boot API
 */

import axios from 'axios';

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api/restaurants';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging and API key (if needed in future)
apiClient.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📤 API Request: ${config.method.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      params: config.params,
      data: config.data,
    });
    // Could add API key here if enabled
    // const apiKey = localStorage.getItem('apiKey');
    // if (apiKey) {
    //   config.headers['X-API-Key'] = apiKey;
    // }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📥 API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : undefined,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
      console.error(`[${timestamp}] ❌ API Error Response:`, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        statusText: error.response.statusText,
        message: errorMessage,
        data: error.response.data,
      });
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[${timestamp}] ❌ No response from server:`, {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
      });
      return Promise.reject(new Error('Unable to connect to server. Please check if the API is running.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`[${timestamp}] ❌ Request setup error:`, error.message);
      return Promise.reject(error);
    }
  }
);

/**
 * API service methods
 */
export const restaurantApi = {
  /**
   * Health check endpoint
   * @returns {Promise<{status: string, timestamp: string}>}
   */
  async healthCheck() {
    console.log('🏥 Checking API health...');
    const response = await apiClient.get('/health');
    console.log('✅ API health check passed:', response.data);
    return response.data;
  },

  /**
   * Search for restaurants with filters
   * @param {Object} params - Search parameters
   * @param {string} [params.borough] - Borough name (MANHATTAN, BROOKLYN, QUEENS, BRONX, STATEN_ISLAND)
   * @param {string} [params.cuisine] - Cuisine type (partial match)
   * @param {string} [params.minGrade] - Minimum grade (A, B, C, etc.)
   * @param {number} [params.limit=100] - Maximum number of results (1-1000)
   * @returns {Promise<{count: number, results: Array}>}
   */
  async searchRestaurants(params) {
    console.log('🔍 Searching restaurants with params:', params);
    const response = await apiClient.post('/query', params);
    console.log(`✅ Search complete: Found ${response.data.count || response.data.results?.length || 0} restaurants`);
    return response.data;
  },

  /**
   * Get detailed restaurant information with full inspection history
   * @param {Object} params - Details parameters
   * @param {string} params.restaurantName - Restaurant name (full or partial)
   * @param {string} [params.borough] - Borough to narrow search
   * @returns {Promise<{restaurantName: string, borough: string, inspections: Array, totalInspections: number}>}
   */
  async getRestaurantDetails(params) {
    console.log('📋 Fetching restaurant details for:', params);
    const response = await apiClient.post('/details', params);
    console.log(`✅ Details loaded: ${response.data.restaurantName} - ${response.data.totalInspections} inspections`);
    return response.data;
  },

  /**
   * Get list of all boroughs in the dataset
   * @returns {Promise<Array<string>>} Array of borough names
   * @example
   * // Returns: ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"]
   */
  async getBoroughs() {
    console.log('🗺️ Fetching boroughs list...');
    const response = await apiClient.get('/boroughs');
    console.log(`✅ Boroughs loaded: ${response.data.length} items`, response.data);
    return response.data;
  },

  /**
   * Get list of all cuisine types in the dataset
   * @returns {Promise<Array<string>>} Array of cuisine type names
   * @example
   * // Returns: ["American", "Chinese", "Italian", "Mexican", ...]
   */
  async getCuisines() {
    console.log('🍽️ Fetching cuisines list...');
    const response = await apiClient.get('/cuisines');
    console.log(`✅ Cuisines loaded: ${response.data.length} items`, response.data.slice(0, 10), '...');
    return response.data;
  },
};

export default restaurantApi;
