package com.example.api.model;

/** Enum representing whether a violation is critical or not. */
public enum CriticalFlag {
  CRITICAL("Critical"),
  NOT_CRITICAL("Not Critical"),
  NOT_APPLICABLE("Not Applicable");

  private final String description;

  CriticalFlag(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }

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
