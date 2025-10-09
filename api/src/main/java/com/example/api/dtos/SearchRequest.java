package com.example.api.dtos;

import com.example.api.util.InputValidator;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for restaurant search requests.
 * 
 * <p>This DTO encapsulates the search criteria for querying NYC restaurant inspection data.
 * All fields are optional, allowing flexible filtering. When no filters are specified,
 * the query returns all restaurants (up to the limit).
 * 
 * <p><b>Validation:</b> This class uses both Jakarta Bean Validation annotations and
 * custom validation through {@link InputValidator} to ensure data integrity and prevent
 * security vulnerabilities such as SQL injection and XSS attacks.
 * 
 * <p><b>Usage Example:</b>
 * <pre>
 * SearchRequest request = new SearchRequest();
 * request.setBorough("MANHATTAN");
 * request.setCuisine("Italian");
 * request.setMinGrade("A");
 * request.setLimit(50);
 * request.validate(); // Perform additional sanitization
 * </pre>
 * 
 * @see com.example.api.util.InputValidator
 * @see com.example.api.controller.RestaurantController#searchRestaurants(SearchRequest)
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

  /**
   * The NYC borough to filter by (optional).
   * 
   * <p>Valid values: BRONX, BROOKLYN, MANHATTAN, QUEENS, STATEN ISLAND
   * <p>If null or empty, restaurants from all boroughs are returned.
   */
  @Size(max = 50, message = "Borough name is too long")
  @Pattern(regexp = "^[A-Za-z\\s]*$", message = "Borough can only contain letters and spaces")
  private String borough;

  /**
   * The cuisine type to filter by (optional).
   * 
   * <p>Performs a partial match search (e.g., "Italian" matches "Italian", "Southern Italian", etc.)
   * <p>If null or empty, restaurants of all cuisine types are returned.
   */
  @Size(max = 100, message = "Cuisine description is too long")
  @Pattern(regexp = "^[a-zA-Z0-9\\s\\-',.&()]*$", message = "Cuisine contains invalid characters")
  private String cuisine;

  /**
   * The minimum grade to filter by (optional).
   * 
   * <p>Grades are A, B, C, etc. where A is the best. This filter returns restaurants with
   * grades equal to or better than the specified grade (e.g., minGrade="B" returns A and B).
   * <p>If null or empty, restaurants with all grades (including ungraded) are returned.
   */
  @Size(max = 1, message = "Grade must be a single character")
  @Pattern(regexp = "^[A-Z]?$", message = "Grade must be a single uppercase letter")
  private String minGrade;

  /**
   * The maximum number of results to return.
   * 
   * <p>Default: 100
   * <p>Range: 1-1000
   * <p>Helps prevent excessive data transfer and improves response times.
   */
  @Min(value = 1, message = "Limit must be at least 1")
  @Max(value = 1000, message = "Limit cannot exceed 1000")
  private Integer limit = 100;

  /**
   * Validates and sanitizes all input fields.
   * 
   * <p>This method performs additional validation beyond Jakarta Bean Validation,
   * including SQL injection detection, XSS prevention, and normalization of input
   * values (e.g., trimming whitespace, converting to uppercase where appropriate).
   * 
   * <p><b>Note:</b> This method modifies the object's fields in place.
   * 
   * @throws IllegalArgumentException if any field contains invalid or potentially malicious content
   * @see InputValidator
   */
  public void validate() {
    this.borough = InputValidator.validateBorough(this.borough);
    this.cuisine = InputValidator.validateCuisine(this.cuisine);
    this.minGrade = InputValidator.validateGrade(this.minGrade);
    this.limit = InputValidator.validateLimit(this.limit, 1000);
  }
}
