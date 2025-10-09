package com.example.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enum representing the five boroughs of New York City.
 * 
 * <p>NYC consists of five boroughs, each with its own distinct character and
 * restaurant scene. This enum provides consistent representation of boroughs
 * throughout the application, with proper JSON serialization support.
 * 
 * <p><b>Boroughs:</b>
 * <ul>
 *   <li>Manhattan - The most densely populated borough</li>
 *   <li>Brooklyn - Known for diverse cuisine and food culture</li>
 *   <li>Queens - Most ethnically diverse borough</li>
 *   <li>Bronx - Home to Little Italy and diverse communities</li>
 *   <li>Staten Island - The least populated borough</li>
 * </ul>
 * 
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
public enum Borough {
  /** Manhattan borough. */
  MANHATTAN("Manhattan"),
  
  /** Brooklyn borough. */
  BROOKLYN("Brooklyn"),
  
  /** Queens borough. */
  QUEENS("Queens"),
  
  /** The Bronx borough. */
  BRONX("Bronx"),
  
  /** Staten Island borough. */
  STATEN_ISLAND("Staten Island");

  /** Human-readable display name for the borough. */
  private final String displayName;

  /**
   * Constructs a Borough enum value.
   * 
   * @param displayName the human-readable name of the borough
   */
  Borough(String displayName) {
    this.displayName = displayName;
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
   * Creates a Borough enum from a string value (case-insensitive).
   * 
   * <p>This method supports deserialization from both display names ("Manhattan")
   * and enum constant names ("MANHATTAN"). It's annotated with {@code @JsonCreator}
   * for JSON deserialization support.
   * 
   * @param value the string value to parse (display name or enum constant name)
   * @return the corresponding Borough enum, or null if value is null
   * @throws IllegalArgumentException if the value doesn't match any borough
   */
  @JsonCreator
  public static Borough fromString(String value) {
    if (value == null) {
      return null;
    }
    for (Borough borough : Borough.values()) {
      if (borough.displayName.equalsIgnoreCase(value) || borough.name().equalsIgnoreCase(value)) {
        return borough;
      }
    }
    throw new IllegalArgumentException("Unknown borough: " + value);
  }

  /**
   * Gets the uppercase database value for queries.
   * 
   * <p>Database records store borough names in uppercase (e.g., "MANHATTAN"),
   * so this method provides the correct format for database queries.
   * 
   * @return the borough name in uppercase format for database queries
   */
  public String getDatabaseValue() {
    return displayName.toUpperCase();
  }
}
