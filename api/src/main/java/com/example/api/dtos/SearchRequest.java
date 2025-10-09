package com.example.api.dtos;

import com.example.api.util.InputValidator;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

  @Size(max = 50, message = "Borough name is too long")
  @Pattern(regexp = "^[A-Za-z\\s]*$", message = "Borough can only contain letters and spaces")
  private String borough;

  @Size(max = 100, message = "Cuisine description is too long")
  @Pattern(regexp = "^[a-zA-Z0-9\\s\\-',.&()]*$", message = "Cuisine contains invalid characters")
  private String cuisine;

  @Size(max = 1, message = "Grade must be a single character")
  @Pattern(regexp = "^[A-Z]?$", message = "Grade must be a single uppercase letter")
  private String minGrade;

  @Min(value = 1, message = "Limit must be at least 1")
  @Max(value = 1000, message = "Limit cannot exceed 1000")
  private Integer limit = 100;

  /** Validates and sanitizes all input fields. */
  public void validate() {
    this.borough = InputValidator.validateBorough(this.borough);
    this.cuisine = InputValidator.validateCuisine(this.cuisine);
    this.minGrade = InputValidator.validateGrade(this.minGrade);
    this.limit = InputValidator.validateLimit(this.limit, 1000);
  }
}
