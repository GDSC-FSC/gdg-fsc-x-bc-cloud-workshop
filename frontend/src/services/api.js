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

// Request interceptor for API key (if needed in future)
apiClient.interceptors.request.use(
  (config) => {
    // Could add API key here if enabled
    // const apiKey = localStorage.getItem('apiKey');
    // if (apiKey) {
    //   config.headers['X-API-Key'] = apiKey;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
      console.error('API Error:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server');
      return Promise.reject(new Error('Unable to connect to server. Please check if the API is running.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
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
    const response = await apiClient.get('/health');
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
    const response = await apiClient.post('/query', params);
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
    const response = await apiClient.post('/details', params);
    return response.data;
  },

  /**
   * Get list of all boroughs in the dataset
   * @returns {Promise<{boroughs: Array<string>}>}
   */
  async getBoroughs() {
    const response = await apiClient.get('/boroughs');
    return response.data;
  },

  /**
   * Get list of all cuisine types in the dataset
   * @returns {Promise<{cuisines: Array<string>}>}
   */
  async getCuisines() {
    const response = await apiClient.get('/cuisines');
    return response.data;
  },
};

export default restaurantApi;
