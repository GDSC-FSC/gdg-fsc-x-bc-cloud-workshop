package com.example.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enum representing NYC restaurant health inspection grades. Grades are ordered from best to worst.
 */
public enum Grade {
  A("A", 1),
  B("B", 2),
  C("C", 3),
  P("P", 4), // Pending
  Z("Z", 5), // Grade pending
  NOT_YET_GRADED("Not Yet Graded", 6);

  private final String displayName;
  private final int order;

  Grade(String displayName, int order) {
    this.displayName = displayName;
    this.order = order;
  }

  @JsonValue
  public String getDisplayName() {
    return displayName;
  }

  public int getOrder() {
    return order;
  }

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

  public String getDatabaseValue() {
    return displayName;
  }

  /**
   * Check if this grade is better than or equal to the minimum grade.
   *
   * @param minGrade the minimum acceptable grade
   * @return true if this grade meets the minimum requirement
   */
  public boolean meetsMinimum(Grade minGrade) {
    return this.order <= minGrade.order;
  }
}
