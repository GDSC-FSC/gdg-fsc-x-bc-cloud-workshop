package com.example.api.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a NYC restaurant inspection record.
 * 
 * <p>This DTO encapsulates all relevant information about a single restaurant inspection,
 * including the establishment details, inspection results, violations, and geographic data.
 * It is used in both search results and detailed inspection histories.
 * 
 * <p><b>Key Fields:</b>
 * <ul>
 *   <li><b>camis:</b> Unique identifier for the establishment</li>
 *   <li><b>dba:</b> "Doing Business As" name (the restaurant's public name)</li>
 *   <li><b>grade:</b> Inspection grade (A, B, C, etc.) where A is best</li>
 *   <li><b>score:</b> Numeric inspection score (lower is better)</li>
 *   <li><b>criticalFlag:</b> Whether violations are critical to public health</li>
 * </ul>
 * 
 * <p><b>Note:</b> The {@code violationDescription} field may be null due to database
 * compatibility issues with PostgreSQL bytea columns.
 * 
 * @see com.example.api.entities.RestaurantInspection
 * @see com.example.api.responses.SearchResponse
 * @see com.example.api.responses.RestaurantDetailsResponse
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDTO {
  /** Unique identifier for the food service establishment (CAMIS number). */
  private String camis;
  
  /** The restaurant's "Doing Business As" name. */
  private String dba;
  
  /** The NYC borough where the restaurant is located. */
  private String boro;
  
  /** Building number of the restaurant's address. */
  private String building;
  
  /** Street name of the restaurant's address. */
  private String street;
  
  /** ZIP code of the restaurant's address. */
  private String zipcode;
  
  /** Phone number of the restaurant. */
  private String phone;
  
  /** Type of cuisine served by the restaurant. */
  private String cuisineDescription;
  
  /** Date and time of the inspection. */
  private LocalDateTime inspectionDate;
  
  /** Action taken by the Department of Health after the inspection. */
  private String action;
  
  /** Code identifying the specific violation found during inspection. */
  private String violationCode;
  
  /** Description of the violation (may be null due to database compatibility). */
  private String violationDescription;
  
  /** Flag indicating whether the violation is critical (e.g., "Critical", "Not Critical"). */
  private String criticalFlag;
  
  /** Numeric inspection score (lower scores are better). */
  private BigDecimal score;
  
  /** Letter grade assigned (A, B, C, etc., where A is best). */
  private String grade;
  
  /** Date when the grade was assigned. */
  private LocalDateTime gradeDate;
  
  /** Date when this record was entered into the database. */
  private LocalDateTime recordDate;
  
  /** Type of inspection conducted (e.g., "Cycle Inspection", "Pre-permit", "Reopening"). */
  private String inspectionType;
  
  /** Geographic latitude coordinate of the restaurant. */
  private BigDecimal latitude;
  
  /** Geographic longitude coordinate of the restaurant. */
  private BigDecimal longitude;
  
  /** NYC community board district. */
  private String communityBoard;
  
  /** NYC council district. */
  private String councilDistrict;
}
