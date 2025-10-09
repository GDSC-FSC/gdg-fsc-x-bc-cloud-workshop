package com.example.api.model;

/**
 * Enum representing different types of restaurant inspections.
 */
public enum InspectionType {
    CYCLE("Cycle Inspection / Initial Inspection"),
    REINSPECTION("Cycle Inspection / Re-inspection"),
    COMPLIANCE("Cycle Inspection / Compliance Inspection"),
    PRE_PERMIT("Pre-permit (Operational) / Initial Inspection"),
    PRE_PERMIT_RE("Pre-permit (Operational) / Re-inspection"),
    ADMINISTRATIVE("Administrative Miscellaneous / Initial Inspection"),
    SMOKE_FREE("Smoke-Free Air Act / Initial Inspection"),
    CALORIE_POSTING("Calorie Posting / Initial Inspection"),
    TRANS_FAT("Trans Fat / Initial Inspection"),
    OTHER("Other");

    private final String description;

    InspectionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

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
