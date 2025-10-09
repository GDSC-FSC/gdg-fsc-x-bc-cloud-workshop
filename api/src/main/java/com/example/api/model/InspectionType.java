package com.example.api.model;

/**
 * Enum representing different types of restaurant health inspections.
 * 
 * <p>The NYC Department of Health conducts various types of inspections based on
 * the establishment's status, compliance history, and specific regulations. This enum
 * categorizes the different inspection types found in the inspection records.
 * 
 * <p><b>Main Inspection Types:</b>
 * <ul>
 *   <li><b>Cycle Inspection:</b> Regular scheduled inspections (initial, re-inspection, compliance)</li>
 *   <li><b>Pre-permit:</b> Inspections before an establishment opens or reopens</li>
 *   <li><b>Administrative:</b> Administrative or complaint-based inspections</li>
 *   <li><b>Specialized:</b> Inspections for specific regulations (smoke-free, calorie posting, trans fat)</li>
 * </ul>
 * 
 * <p>Cycle inspections are the most common and are conducted annually or more frequently
 * if violations are found. Re-inspections verify that violations have been corrected.
 * 
 * @see <a href="https://www1.nyc.gov/site/doh/services/food-service-establishment-inspections.page">NYC DOHMH Inspections</a>
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
public enum InspectionType {
  /** Cycle inspection - initial inspection of an operating establishment. */
  CYCLE("Cycle Inspection / Initial Inspection"),
  
  /** Cycle inspection - re-inspection to verify violation corrections. */
  REINSPECTION("Cycle Inspection / Re-inspection"),
  
  /** Cycle inspection - compliance check after violations. */
  COMPLIANCE("Cycle Inspection / Compliance Inspection"),
  
  /** Pre-permit inspection - initial inspection before opening. */
  PRE_PERMIT("Pre-permit (Operational) / Initial Inspection"),
  
  /** Pre-permit inspection - re-inspection before final approval. */
  PRE_PERMIT_RE("Pre-permit (Operational) / Re-inspection"),
  
  /** Administrative or complaint-based inspection. */
  ADMINISTRATIVE("Administrative Miscellaneous / Initial Inspection"),
  
  /** Inspection for Smoke-Free Air Act compliance. */
  SMOKE_FREE("Smoke-Free Air Act / Initial Inspection"),
  
  /** Inspection for calorie posting requirement compliance. */
  CALORIE_POSTING("Calorie Posting / Initial Inspection"),
  
  /** Inspection for trans fat ban compliance. */
  TRANS_FAT("Trans Fat / Initial Inspection"),
  
  /** Other or unclassified inspection types. */
  OTHER("Other");

  /** Human-readable description of the inspection type. */
  private final String description;

  /**
   * Constructs an InspectionType enum value.
   * 
   * @param description the human-readable description of the inspection type
   */
  InspectionType(String description) {
    this.description = description;
  }

  /**
   * Gets the description of this inspection type.
   * 
   * @return the human-readable description
   */
  public String getDescription() {
    return description;
  }

  /**
   * Creates an InspectionType enum from a string value (case-insensitive).
   * 
   * <p>This method matches the input string against the description field
   * of each enum constant. If no match is found, it returns {@link #OTHER}.
   * 
   * @param value the string value to parse (inspection type description)
   * @return the corresponding InspectionType enum, or OTHER if no match found
   */
  public static InspectionType fromString(String value) {
    if (value == null) {
      return OTHER;
    }
    for (InspectionType type : InspectionType.values()) {
      if (type.description.equalsIgnoreCase(value)) {
        return type;
      }
    }
    return OTHER;
  }
}
