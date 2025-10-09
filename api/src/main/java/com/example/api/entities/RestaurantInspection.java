package com.example.api.entities;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA Entity representing a NYC restaurant inspection record.
 * 
 * <p>This entity maps to the {@code nyc_restaurant_inspections} database table,
 * which contains official inspection data from the NYC Department of Health and Mental Hygiene.
 * Each record represents a single inspection with associated violations and grades.
 * 
 * <p><b>Composite Primary Key:</b> This entity uses a composite key consisting of:
 * <ul>
 *   <li>{@code camis} - Unique identifier for the establishment</li>
 *   <li>{@code inspectionDate} - Date and time of the inspection</li>
 *   <li>{@code violationCode} - Code identifying the specific violation</li>
 * </ul>
 * 
 * <p><b>Important Notes:</b>
 * <ul>
 *   <li>The {@code violation_description} column is excluded due to Hibernate/PostgreSQL
 *       bytea compatibility issues</li>
 *   <li>The {@code location_point1} column is excluded for the same reason</li>
 *   <li>Geographic data is available through {@code latitude} and {@code longitude} fields</li>
 * </ul>
 * 
 * <p><b>Data Source:</b> NYC Open Data - DOHMH New York City Restaurant Inspection Results
 * 
 * @see RestaurantInspectionId
 * @see com.example.api.repository.RestaurantInspectionRepository
 * @see com.example.api.dtos.RestaurantDTO
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Entity
@Table(name = "nyc_restaurant_inspections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(RestaurantInspection.RestaurantInspectionId.class)
public class RestaurantInspection {

  /**
   * CAMIS - Unique identifier for the food service establishment.
   * 
   * <p>Part of the composite primary key. This 8-digit number is assigned by
   * the NYC Department of Health and is permanent for each establishment.
   */
  @Id
  @Column(name = "camis")
  private String camis;

  /**
   * Date and time when the inspection was conducted.
   * 
   * <p>Part of the composite primary key. An establishment can have multiple
   * inspections over time.
   */
  @Id
  @Column(name = "inspection_date")
  private LocalDateTime inspectionDate;

  /**
   * Code identifying the specific violation found during the inspection.
   * 
   * <p>Part of the composite primary key. A single inspection can result in
   * multiple violations, each with a unique code (e.g., "10F", "04L").
   */
  @Id
  @Column(name = "violation_code")
  private String violationCode;

  /**
   * DBA - "Doing Business As" name of the establishment.
   * 
   * <p>This is the public-facing name of the restaurant, which may differ
   * from the legal business name.
   */
  @Column(name = "dba")
  private String dba;

  /**
   * NYC borough where the establishment is located.
   * 
   * <p>Valid values: BRONX, BROOKLYN, MANHATTAN, QUEENS, STATEN ISLAND
   */
  @Column(name = "boro")
  private String boro;

  /** Building number of the establishment's address. */
  @Column(name = "building")
  private String building;

  /** Street name of the establishment's address. */
  @Column(name = "street")
  private String street;

  /** ZIP code of the establishment's address. */
  @Column(name = "zipcode")
  private String zipcode;

  /** Phone number of the establishment. */
  @Column(name = "phone")
  private String phone;

  /** Type of cuisine served by the establishment. */
  @Column(name = "cuisine_description")
  private String cuisineDescription;

  /**
   * Action taken by the Department of Health as a result of the inspection.
   * 
   * <p>Examples: "Violations were cited in the following area(s).",
   * "Establishment re-opened by DOHMH", "No violations were recorded at the time of this inspection."
   */
  @Column(name = "action")
  private String action;

  // Note: violation_description column excluded from entity mapping due to Hibernate/PostgreSQL bytea compatibility issues  
  // The column exists in the database but is not mapped to avoid query errors

  /**
   * Flag indicating whether the violation is critical to public health.
   * 
   * <p>Values: "Critical", "Not Critical", or null
   * <p>Critical violations pose immediate health risks and require prompt attention.
   */
  @Column(name = "critical_flag")
  private String criticalFlag;

  /**
   * Numeric inspection score (lower is better).
   * 
   * <p>The score is calculated based on the number and severity of violations.
   * Typically: 0-13 = A, 14-27 = B, 28+ = C
   */
  @Column(name = "score")
  private BigDecimal score;

  /**
   * Letter grade assigned based on the inspection score.
   * 
   * <p>Values: A (best), B, C, or null if pending/not yet graded
   * <p>Grades are posted at the establishment and visible to the public.
   */
  @Column(name = "grade")
  private String grade;

  /** Date when the grade was assigned (may differ from inspection date). */
  @Column(name = "grade_date")
  private LocalDateTime gradeDate;

  /** Date when this record was entered into the NYC database system. */
  @Column(name = "record_date")
  private LocalDateTime recordDate;

  /**
   * Type of inspection conducted.
   * 
   * <p>Examples: "Cycle Inspection / Initial Inspection", "Cycle Inspection / Re-inspection",
   * "Pre-permit (Operational) / Initial Inspection", "Administrative Miscellaneous / Initial Inspection"
   */
  @Column(name = "inspection_type")
  private String inspectionType;

  /** Geographic latitude coordinate of the establishment (WGS84). */
  @Column(name = "latitude")
  private BigDecimal latitude;

  /** Geographic longitude coordinate of the establishment (WGS84). */
  @Column(name = "longitude")
  private BigDecimal longitude;

  /**
   * NYC community board district identifier.
   * 
   * <p>Format: borough code + board number (e.g., "101" for Manhattan CB 1)
   */
  @Column(name = "community_board")
  private String communityBoard;

  /** NYC council district number. */
  @Column(name = "council_district")
  private String councilDistrict;

  /** US Census tract identifier for demographic and statistical purposes. */
  @Column(name = "census_tract")
  private String censusTract;

  /** BIN - Building Identification Number assigned by NYC Department of City Planning. */
  @Column(name = "bin")
  private String bin;

  /** BBL - Borough, Block, and Lot number (tax lot identifier). */
  @Column(name = "bbl")
  private String bbl;

  /** NTA - Neighborhood Tabulation Area code for geographic analysis. */
  @Column(name = "nta")
  private String nta;

  // Note: location_point1 column excluded from entity mapping due to Hibernate/PostgreSQL bytea compatibility issues
  // The column exists in the database but is not mapped to avoid query errors
  
  /**
   * Composite primary key class for {@link RestaurantInspection}.
   * 
   * <p>This ID class defines the composite primary key consisting of three fields:
   * CAMIS (establishment ID), inspection date, and violation code. This combination
   * uniquely identifies each inspection-violation record.
   * 
   * <p><b>Why a Composite Key?</b>
   * <ul>
   *   <li>A single establishment (CAMIS) can have multiple inspections over time</li>
   *   <li>A single inspection can identify multiple violations</li>
   *   <li>The combination of all three fields ensures uniqueness</li>
   * </ul>
   * 
   * <p><b>JPA Requirements:</b> This class must:
   * <ul>
   *   <li>Implement {@link Serializable}</li>
   *   <li>Have public or protected no-argument constructor</li>
   *   <li>Override {@code equals()} and {@code hashCode()} (provided by Lombok @Data)</li>
   * </ul>
   * 
   * @see RestaurantInspection
   * @author NYC Restaurant Inspections API Team
   * @version 1.0
   * @since 1.0
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class RestaurantInspectionId implements Serializable {
    /** CAMIS - Unique identifier for the food service establishment. */
    private String camis;
    
    /** Date and time when the inspection was conducted. */
    private LocalDateTime inspectionDate;
    
    /** Code identifying the specific violation found. */
    private String violationCode;
  }
}
