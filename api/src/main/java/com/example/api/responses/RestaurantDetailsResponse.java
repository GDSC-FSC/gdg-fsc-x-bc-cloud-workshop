package com.example.api.responses;

import com.example.api.dtos.RestaurantDTO;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response object for restaurant details (inspection history) operations.
 * 
 * <p>This response provides a complete inspection history for a specific restaurant,
 * including all recorded inspections sorted by date (most recent first). It allows
 * clients to track a restaurant's health inspection record over time and identify
 * patterns in violations and grades.
 * 
 * <p><b>Example JSON Response:</b>
 * <pre>
 * {
 *   "restaurantName": "Joe's Pizza",
 *   "inspections": [
 *     {
 *       "inspectionDate": "2024-10-15T10:30:00",
 *       "grade": "A",
 *       "score": 10,
 *       "violationCode": "10F",
 *       ...
 *     },
 *     {
 *       "inspectionDate": "2023-04-20T14:15:00",
 *       "grade": "A",
 *       "score": 12,
 *       ...
 *     },
 *     ...
 *   ],
 *   "inspectionCount": 5,
 *   "message": "Found 5 inspections"
 * }
 * </pre>
 * 
 * @see com.example.api.dtos.RestaurantDTO
 * @see com.example.api.dtos.RestaurantDetailsRequest
 * @see com.example.api.controller.RestaurantController#getRestaurantDetails(com.example.api.dtos.RestaurantDetailsRequest)
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDetailsResponse {
  /** 
   * The name of the restaurant (DBA name) that was queried.
   * 
   * <p>This echoes back the restaurant name from the request for client convenience.
   */
  private String restaurantName;
  
  /** 
   * Complete list of all inspections for this restaurant.
   * 
   * <p>Inspections are ordered by inspection date in descending order
   * (most recent first). Each inspection may include multiple violations
   * if multiple issues were found during that inspection.
   */
  private List<RestaurantDTO> inspections;
  
  /** 
   * Total number of inspection records returned.
   * 
   * <p>This count reflects the number of items in the {@code inspections} list.
   */
  private int inspectionCount;
  
  /** 
   * Human-readable message describing the results.
   * 
   * <p>Examples: "Found 5 inspections", "No inspections found for this restaurant"
   * <p>Useful for logging and user feedback.
   */
  private String message;
}
