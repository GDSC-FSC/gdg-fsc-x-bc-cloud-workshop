package com.example.api.dtos;

import com.example.api.util.InputValidator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for restaurant details requests.
 * 
 * <p>This DTO is used to request detailed inspection history for a specific restaurant.
 * The restaurant name is required, while the borough is optional but recommended for
 * more accurate results (especially for common restaurant names that may exist in multiple boroughs).
 * 
 * <p><b>Validation:</b> This class uses both Jakarta Bean Validation annotations and
 * custom validation through {@link InputValidator} to ensure data integrity and prevent
 * security vulnerabilities.
 * 
 * <p><b>Usage Example:</b>
 * <pre>
 * RestaurantDetailsRequest request = new RestaurantDetailsRequest();
 * request.setRestaurantName("Joe's Pizza");
 * request.setBorough("MANHATTAN");
 * request.validate(); // Perform additional sanitization
 * </pre>
 * 
 * @see com.example.api.util.InputValidator
 * @see com.example.api.controller.RestaurantController#getRestaurantDetails(RestaurantDetailsRequest)
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDetailsRequest {

  /**
   * The name of the restaurant to retrieve details for (required).
   * 
   * <p>This should match the DBA (Doing Business As) name in the database exactly.
   * The name is case-sensitive and should include any special characters or formatting.
   * 
   * <p><b>Examples:</b> "Joe's Pizza", "McDonald's", "The Smith Restaurant & Bar"
   */
  @NotBlank(message = "Restaurant name is required")
  @Size(max = 200, message = "Restaurant name is too long")
  @Pattern(
      regexp = "^[a-zA-Z0-9\\s\\-',.&()]+$",
      message = "Restaurant name contains invalid characters")
  private String restaurantName;

  /**
   * The NYC borough to filter by (optional but recommended).
   * 
   * <p>Valid values: BRONX, BROOKLYN, MANHATTAN, QUEENS, STATEN ISLAND
   * <p>If specified, only inspections from this borough are returned. This is useful
   * when multiple restaurants share the same name across different boroughs.
   * <p>If null or empty, inspections from all boroughs matching the restaurant name are returned.
   */
  @Size(max = 50, message = "Borough name is too long")
  @Pattern(regexp = "^[A-Za-z\\s]*$", message = "Borough can only contain letters and spaces")
  private String borough;

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
    this.restaurantName = InputValidator.validateRestaurantName(this.restaurantName);
    this.borough = InputValidator.validateBorough(this.borough);
  }
}
