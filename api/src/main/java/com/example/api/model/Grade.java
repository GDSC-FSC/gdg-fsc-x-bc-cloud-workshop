package com.example.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enum representing NYC restaurant health inspection grades.
 * 
 * <p>The NYC Department of Health assigns letter grades to food service establishments
 * based on their inspection scores. Grades are ordered from best to worst, with 'A'
 * being the best. This enum includes ordering support to facilitate grade comparisons.
 * 
 * <p><b>Grade Meanings:</b>
 * <ul>
 *   <li><b>A:</b> Score of 0-13 points. Excellent sanitary conditions.</li>
 *   <li><b>B:</b> Score of 14-27 points. Good sanitary conditions.</li>
 *   <li><b>C:</b> Score of 28+ points. Acceptable sanitary conditions.</li>
 *   <li><b>P:</b> Pending - Grade not yet finalized.</li>
 *   <li><b>Z:</b> Grade pending - Establishment is under administrative review.</li>
 *   <li><b>Not Yet Graded:</b> Recently opened or awaiting initial grade.</li>
 * </ul>
 * 
 * <p>Lower scores are better, and grades are posted publicly at the establishment.
 * 
 * @see <a href="https://www1.nyc.gov/site/doh/services/restaurant-grades.page">NYC Restaurant Grades</a>
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
public enum Grade {
  /** Grade A - Best grade (0-13 points). */
  A("A", 1),
  
  /** Grade B - Good grade (14-27 points). */
  B("B", 2),
  
  /** Grade C - Acceptable grade (28+ points). */
  C("C", 3),
  
  /** Pending - Grade not yet finalized. */
  P("P", 4),
  
  /** Z - Grade pending administrative review. */
  Z("Z", 5),
  
  /** Not yet graded - Recently opened or awaiting initial grade. */
  NOT_YET_GRADED("Not Yet Graded", 6);

  /** Human-readable display name for the grade. */
  private final String displayName;
  
  /** Numeric order for grade comparison (lower is better). */
  private final int order;

  /**
   * Constructs a Grade enum value.
   * 
   * @param displayName the human-readable name of the grade
   * @param order the numeric order for comparison (lower is better)
   */
  Grade(String displayName, int order) {
    this.displayName = displayName;
    this.order = order;
  }

  /**
   * Gets the display name for JSON serialization.
   * 
   * <p>This method is annotated with {@code @JsonValue} so that Jackson
   * serializes the enum using the display name instead of the enum constant name.
   * 
   * @return the human-readable display name
   */
  @JsonValue
  public String getDisplayName() {
    return displayName;
  }

  /**
   * Gets the numeric order for grade comparison.
   * 
   * <p>Lower values indicate better grades. This is used for filtering
   * (e.g., "show only A and B grades").
   * 
   * @return the numeric order (1 for A, 2 for B, etc.)
   */
  public int getOrder() {
    return order;
  }

  /**
   * Creates a Grade enum from a string value (case-insensitive).
   * 
   * <p>This method supports deserialization from both display names ("A")
   * and enum constant names ("A"). It's annotated with {@code @JsonCreator}
   * for JSON deserialization support.
   * 
   * @param value the string value to parse (display name or enum constant name)
   * @return the corresponding Grade enum, or null if value is null
   * @throws IllegalArgumentException if the value doesn't match any grade
   */
  @JsonCreator
  public static Grade fromString(String value) {
    if (value == null) {
      return null;
    }
    for (Grade grade : Grade.values()) {
      if (grade.displayName.equalsIgnoreCase(value) || grade.name().equalsIgnoreCase(value)) {
        return grade;
      }
    }
    throw new IllegalArgumentException("Unknown grade: " + value);
  }

  /**
   * Gets the database value for queries.
   * 
   * @return the grade value as stored in the database
   */
  public String getDatabaseValue() {
    return displayName;
  }

  /**
   * Checks if this grade meets or exceeds a minimum grade requirement.
   * 
   * <p>This method is useful for filtering restaurants by minimum grade.
   * For example, if the minimum is B, then A and B grades pass but C does not.
   * 
   * <p><b>Example:</b>
   * <pre>
   * Grade.A.meetsMinimum(Grade.B)  // true (A is better than B)
   * Grade.B.meetsMinimum(Grade.B)  // true (B equals B)
   * Grade.C.meetsMinimum(Grade.B)  // false (C is worse than B)
   * </pre>
   *
   * @param minGrade the minimum acceptable grade
   * @return true if this grade is equal to or better than the minimum grade
   */
  public boolean meetsMinimum(Grade minGrade) {
    return this.order <= minGrade.order;
  }
}
