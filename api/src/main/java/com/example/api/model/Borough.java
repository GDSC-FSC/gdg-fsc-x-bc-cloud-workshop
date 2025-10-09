package com.example.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enum representing the five boroughs of New York City.
 */
public enum Borough {
    MANHATTAN("Manhattan"),
    BROOKLYN("Brooklyn"),
    QUEENS("Queens"),
    BRONX("Bronx"),
    STATEN_ISLAND("Staten Island");

    private final String displayName;

    Borough(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    @JsonCreator
    public static Borough fromString(String value) {
        if (value == null) {
            return null;
        }
        for (Borough borough : Borough.values()) {
            if (borough.displayName.equalsIgnoreCase(value) || 
                borough.name().equalsIgnoreCase(value)) {
                return borough;
            }
        }
        throw new IllegalArgumentException("Unknown borough: " + value);
    }

    public String getDatabaseValue() {
        return displayName.toUpperCase();
    }
}
