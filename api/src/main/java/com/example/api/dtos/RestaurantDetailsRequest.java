package com.example.api.dtos;

import com.example.api.util.InputValidator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDetailsRequest {

  @NotBlank(message = "Restaurant name is required")
  @Size(max = 200, message = "Restaurant name is too long")
  @Pattern(
      regexp = "^[a-zA-Z0-9\\s\\-',.&()]+$",
      message = "Restaurant name contains invalid characters")
  private String restaurantName;

  @Size(max = 50, message = "Borough name is too long")
  @Pattern(regexp = "^[A-Za-z\\s]*$", message = "Borough can only contain letters and spaces")
  private String borough;

  /** Validates and sanitizes all input fields. */
  public void validate() {
    this.restaurantName = InputValidator.validateRestaurantName(this.restaurantName);
    this.borough = InputValidator.validateBorough(this.borough);
  }
}
