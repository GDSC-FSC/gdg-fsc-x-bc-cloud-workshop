package com.example.api.responses;

import com.example.api.dtos.RestaurantDTO;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response object for restaurant search operations.
 * 
 * <p>This response encapsulates the results of a restaurant search query, including
 * the matching restaurants, total count, and a descriptive message. The response is
 * designed to provide all necessary information for the client to display search results
 * and implement pagination if needed.
 * 
 * <p><b>Example JSON Response:</b>
 * <pre>
 * {
 *   "restaurants": [
 *     {
 *       "camis": "12345678",
 *       "dba": "Joe's Pizza",
 *       "boro": "MANHATTAN",
 *       "grade": "A",
 *       "score": 10,
 *       ...
 *     },
 *     ...
 *   ],
 *   "count": 42,
 *   "message": "Found 42 restaurants"
 * }
 * </pre>
 * 
 * @see com.example.api.dtos.RestaurantDTO
 * @see com.example.api.dtos.SearchRequest
 * @see com.example.api.controller.RestaurantController#searchRestaurants(com.example.api.dtos.SearchRequest)
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {
  /** 
   * List of restaurants matching the search criteria.
   * 
   * <p>Each entry represents a unique inspection record. A single restaurant
   * may appear multiple times if it has multiple inspections.
   */
  private List<RestaurantDTO> restaurants;
  
  /** 
   * Total number of restaurants returned in this response.
   * 
   * <p>This count reflects the number of items in the {@code restaurants} list
   * and may be limited by the request's {@code limit} parameter.
   */
  private int count;
  
  /** 
   * Human-readable message describing the search results.
   * 
   * <p>Typically includes the count of results found (e.g., "Found 42 restaurants").
   * Useful for logging and user feedback.
   */
  private String message;
}
