package com.example.api.controller;

import com.example.api.dtos.RestaurantDetailsRequest;
import com.example.api.dtos.SearchRequest;
import com.example.api.responses.RestaurantDetailsResponse;
import com.example.api.responses.SearchResponse;
import com.example.api.service.IRestaurantInspectionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for NYC Restaurant Inspection data operations.
 * 
 * <p>This controller provides endpoints for searching restaurants, retrieving detailed inspection
 * histories, and fetching metadata such as available boroughs and cuisine types. All endpoints
 * implement proper input validation and sanitization to prevent security vulnerabilities.
 * 
 * <p><b>Security Features:</b>
 * <ul>
 *   <li>Request validation using Jakarta Bean Validation annotations</li>
 *   <li>Additional input sanitization through {@code validate()} methods on DTOs</li>
 *   <li>Rate limiting via {@link com.example.api.web.RateLimitingFilter}</li>
 *   <li>Optional API key authentication via {@link com.example.api.web.ApiKeyAuthenticationFilter}</li>
 * </ul>
 * 
 * <p><b>Base Path:</b> {@code /api/restaurants}
 * 
 * @see IRestaurantInspectionService
 * @see SearchRequest
 * @see RestaurantDetailsRequest
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RestaurantController {

  private final IRestaurantInspectionService service;

  /**
   * Searches for restaurants based on specified criteria.
   * 
   * <p>This endpoint allows filtering restaurants by borough, cuisine type, and minimum grade.
   * Results can be limited using the {@code limit} parameter. All input is validated and sanitized
   * to prevent SQL injection and other security vulnerabilities.
   * 
   * <p><b>Example Request:</b>
   * <pre>
   * POST /api/restaurants/query
   * Content-Type: application/json
   * 
   * {
   *   "borough": "MANHATTAN",
   *   "cuisine": "Italian",
   *   "minGrade": "A",
   *   "limit": 50
   * }
   * </pre>
   * 
   * <p><b>Validation Rules:</b>
   * <ul>
   *   <li>Borough: Max 50 chars, letters and spaces only</li>
   *   <li>Cuisine: Max 100 chars, alphanumeric with common punctuation</li>
   *   <li>MinGrade: Single uppercase letter (A-Z)</li>
   *   <li>Limit: 1-1000, defaults to 100</li>
   * </ul>
   * 
   * @param request the search criteria wrapped in a {@link SearchRequest} object
   * @return a {@link ResponseEntity} containing a {@link SearchResponse} with matching restaurants
   * @throws IllegalArgumentException if input contains invalid or malicious content
   * @see SearchRequest
   * @see SearchResponse
   */
  @PostMapping("/query")
  public ResponseEntity<SearchResponse> searchRestaurants(
      @Valid @RequestBody SearchRequest request) {
    log.info("Received search request: {}", request);
    // Additional validation and sanitization
    request.validate();
    SearchResponse response = service.searchRestaurants(request);
    return ResponseEntity.ok(response);
  }

  /**
   * Retrieves detailed inspection history for a specific restaurant.
   * 
   * <p>This endpoint returns all available inspection records for a given restaurant name,
   * optionally filtered by borough. The results include inspection dates, grades, violation
   * details, and geographic information. Inspections are ordered by date (most recent first).
   * 
   * <p><b>Example Request:</b>
   * <pre>
   * POST /api/restaurants/details
   * Content-Type: application/json
   * 
   * {
   *   "restaurantName": "Joe's Pizza",
   *   "borough": "MANHATTAN"
   * }
   * </pre>
   * 
   * <p><b>Validation Rules:</b>
   * <ul>
   *   <li>Restaurant name: Required, max 200 chars, alphanumeric with common punctuation</li>
   *   <li>Borough: Optional, max 50 chars, letters and spaces only</li>
   * </ul>
   * 
   * @param request the details request containing restaurant name and optional borough
   * @return a {@link ResponseEntity} containing a {@link RestaurantDetailsResponse} with all inspections
   * @throws IllegalArgumentException if input contains invalid or malicious content
   * @see RestaurantDetailsRequest
   * @see RestaurantDetailsResponse
   */
  @PostMapping("/details")
  public ResponseEntity<RestaurantDetailsResponse> getRestaurantDetails(
      @Valid @RequestBody RestaurantDetailsRequest request) {
    log.info("Received details request: {}", request);
    // Additional validation and sanitization
    request.validate();
    RestaurantDetailsResponse response = service.getRestaurantDetails(request);
    return ResponseEntity.ok(response);
  }

  /**
   * Retrieves a list of all distinct NYC boroughs in the database.
   * 
   * <p>This metadata endpoint is useful for populating dropdown filters in the UI.
   * Results are sorted alphabetically and include only non-null values.
   * 
   * <p><b>Example Response:</b>
   * <pre>
   * ["BRONX", "BROOKLYN", "MANHATTAN", "QUEENS", "STATEN ISLAND"]
   * </pre>
   * 
   * @return a {@link ResponseEntity} containing a list of borough names
   */
  @GetMapping("/boroughs")
  public ResponseEntity<List<String>> getBoroughs() {
    log.info("Fetching all boroughs");
    List<String> boroughs = service.getDistinctBoroughs();
    return ResponseEntity.ok(boroughs);
  }

  /**
   * Retrieves a list of all distinct cuisine types in the database.
   * 
   * <p>This metadata endpoint is useful for populating dropdown filters or autocomplete
   * functionality in the UI. Results are sorted alphabetically and include only non-null values.
   * 
   * <p><b>Example Response:</b>
   * <pre>
   * ["American", "Chinese", "Italian", "Japanese", "Mexican", ...]
   * </pre>
   * 
   * @return a {@link ResponseEntity} containing a list of cuisine descriptions
   */
  @GetMapping("/cuisines")
  public ResponseEntity<List<String>> getCuisines() {
    log.info("Fetching all cuisines");
    List<String> cuisines = service.getDistinctCuisines();
    return ResponseEntity.ok(cuisines);
  }

  /**
   * Health check endpoint to verify the API is running.
   * 
   * <p>This lightweight endpoint can be used by monitoring systems, load balancers,
   * or container orchestrators to verify service availability. It does not perform
   * any database or external service checks.
   * 
   * @return a {@link ResponseEntity} containing a simple success message
   */
  @GetMapping("/health")
  public ResponseEntity<String> health() {
    return ResponseEntity.ok("NYC Restaurants API is running");
  }
}
