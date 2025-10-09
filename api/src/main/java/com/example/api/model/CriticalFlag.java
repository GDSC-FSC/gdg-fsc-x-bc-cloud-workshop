package com.example.api.model;

/**
 * Enum representing whether a health inspection violation is critical or not.
 * 
 * <p>During restaurant inspections, violations are classified by their severity.
 * Critical violations pose immediate health risks to the public and require
 * prompt correction. This enum provides consistent representation of violation
 * criticality throughout the application.
 * 
 * <p><b>Critical Violations</b> include issues like:
 * <ul>
 *   <li>Food not held at proper temperatures</li>
 *   <li>Cross-contamination risks</li>
 *   <li>Poor personal hygiene of food handlers</li>
 *   <li>Vermin or pest presence</li>
 * </ul>
 * 
 * <p><b>Non-Critical Violations</b> include issues like:
 * <ul>
 *   <li>Minor facility maintenance issues</li>
 *   <li>Missing or improper signage</li>
 *   <li>Minor equipment issues</li>
 * </ul>
 * 
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
public enum CriticalFlag {
  /** Critical violation - poses immediate health risk. */
  CRITICAL("Critical"),
  
  /** Non-critical violation - does not pose immediate health risk. */
  NOT_CRITICAL("Not Critical"),
  
  /** Not applicable or unknown criticality. */
  NOT_APPLICABLE("Not Applicable");

  /** Human-readable description of the criticality level. */
  private final String description;

  /**
   * Constructs a CriticalFlag enum value.
   * 
   * @param description the human-readable description
   */
  CriticalFlag(String description) {
    this.description = description;
  }

  /**
   * Gets the description of this criticality level.
   * 
   * @return the human-readable description
   */
  public String getDescription() {
    return description;
  }

  /**
   * Creates a CriticalFlag enum from a string value (case-insensitive).
   * 
   * <p>This method supports multiple input formats:
   * <ul>
   *   <li>"Critical", "Y" → CRITICAL</li>
   *   <li>"Not Critical", "N" → NOT_CRITICAL</li>
   *   <li>null or other values → NOT_APPLICABLE</li>
   * </ul>
   * 
   * @param value the string value to parse
   * @return the corresponding CriticalFlag enum
   */
  public static CriticalFlag fromString(String value) {
    if (value == null) {
      return NOT_APPLICABLE;
    }
    if (value.equalsIgnoreCase("Critical") || value.equalsIgnoreCase("Y")) {
      return CRITICAL;
    } else if (value.equalsIgnoreCase("Not Critical") || value.equalsIgnoreCase("N")) {
      return NOT_CRITICAL;
    }
    return NOT_APPLICABLE;
  }
}
