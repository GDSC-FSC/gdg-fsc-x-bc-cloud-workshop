package com.example.api.service;

import com.example.api.dtos.RestaurantDetailsRequest;
import com.example.api.dtos.SearchRequest;
import com.example.api.responses.RestaurantDetailsResponse;
import com.example.api.responses.SearchResponse;

import java.util.List;

/**
 * Service interface for restaurant inspection operations.
 */
public interface IRestaurantInspectionService {
    
    /**
     * Search for restaurants based on the given criteria.
     *
     * @param request the search request containing filters
     * @return search response with matching restaurants
     */
    SearchResponse searchRestaurants(SearchRequest request);

    /**
     * Get detailed inspection history for a specific restaurant.
     *
     * @param request the details request with restaurant name and optional borough
     * @return response containing all inspections for the restaurant
     */
    RestaurantDetailsResponse getRestaurantDetails(RestaurantDetailsRequest request);

    /**
     * Get a list of all distinct boroughs in the database.
     *
     * @return list of borough names
     */
    List<String> getDistinctBoroughs();

    /**
     * Get a list of all distinct cuisine types in the database.
     *
     * @return list of cuisine descriptions
     */
    List<String> getDistinctCuisines();
}
