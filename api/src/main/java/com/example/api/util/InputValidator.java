package com.example.api.util;

import java.util.regex.Pattern;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for input validation and sanitization. Helps prevent SQL injection, XSS, and other
 * security vulnerabilities.
 */
@UtilityClass
@Slf4j
public class InputValidator {

  // Patterns for validation
  private static final Pattern ALPHANUMERIC_SPACE = Pattern.compile("^[a-zA-Z0-9\\s\\-',.&()]+$");
  private static final Pattern BOROUGH_PATTERN = Pattern.compile("^[A-Z\\s]+$");
  private static final Pattern GRADE_PATTERN = Pattern.compile("^[A-Z]$");
  private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9\\-()\\s]+$");

  // SQL injection keywords to detect
  private static final Pattern SQL_INJECTION_PATTERN =
      Pattern.compile(
          ".*(union|select|insert|update|delete|drop|create|alter|exec|script|javascript|<|>).*",
          Pattern.CASE_INSENSITIVE);

  // XSS patterns to detect
  private static final Pattern XSS_PATTERN =
      Pattern.compile(
          ".*(<script|javascript:|onerror=|onload=|eval\\(|expression\\().*",
          Pattern.CASE_INSENSITIVE);

  // Maximum lengths to prevent buffer overflow attacks
  private static final int MAX_STRING_LENGTH = 200;
  private static final int MAX_BOROUGH_LENGTH = 50;
  private static final int MAX_CUISINE_LENGTH = 100;

  /**
   * Validates and sanitizes a restaurant name.
   *
   * @param input the input to validate
   * @return sanitized input
   * @throws IllegalArgumentException if input is invalid
   */
  public static String validateRestaurantName(String input) {
    if (input == null || input.trim().isEmpty()) {
      return null;
    }

    String sanitized = sanitize(input);

    if (sanitized.length() > MAX_STRING_LENGTH) {
      log.warn("Restaurant name exceeds maximum length: {}", sanitized.length());
      throw new IllegalArgumentException(
          "Restaurant name is too long (max " + MAX_STRING_LENGTH + " characters)");
    }

    if (!ALPHANUMERIC_SPACE.matcher(sanitized).matches()) {
      log.warn("Restaurant name contains invalid characters: {}", sanitized);
      throw new IllegalArgumentException("Restaurant name contains invalid characters");
    }

    checkForInjection(sanitized);

    return sanitized;
  }

  /**
   * Validates a borough name.
   *
   * @param input the input to validate
   * @return sanitized input
   * @throws IllegalArgumentException if input is invalid
   */
  public static String validateBorough(String input) {
    if (input == null || input.trim().isEmpty()) {
      return null;
    }

    String sanitized = sanitize(input).toUpperCase();

    if (sanitized.length() > MAX_BOROUGH_LENGTH) {
      throw new IllegalArgumentException("Borough name is too long");
    }

    if (!BOROUGH_PATTERN.matcher(sanitized).matches()) {
      throw new IllegalArgumentException("Borough name contains invalid characters");
    }

    return sanitized;
  }

  /**
   * Validates a cuisine description.
   *
   * @param input the input to validate
   * @return sanitized input
   * @throws IllegalArgumentException if input is invalid
   */
  public static String validateCuisine(String input) {
    if (input == null || input.trim().isEmpty()) {
      return null;
    }

    String sanitized = sanitize(input);

    if (sanitized.length() > MAX_CUISINE_LENGTH) {
      throw new IllegalArgumentException(
          "Cuisine description is too long (max " + MAX_CUISINE_LENGTH + " characters)");
    }

    if (!ALPHANUMERIC_SPACE.matcher(sanitized).matches()) {
      throw new IllegalArgumentException("Cuisine description contains invalid characters");
    }

    checkForInjection(sanitized);

    return sanitized;
  }

  /**
   * Validates a grade value.
   *
   * @param input the input to validate
   * @return sanitized input
   * @throws IllegalArgumentException if input is invalid
   */
  public static String validateGrade(String input) {
    if (input == null || input.trim().isEmpty()) {
      return null;
    }

    String sanitized = sanitize(input).toUpperCase();

    if (sanitized.length() != 1) {
      throw new IllegalArgumentException("Grade must be a single character");
    }

    if (!GRADE_PATTERN.matcher(sanitized).matches()) {
      throw new IllegalArgumentException("Invalid grade format");
    }

    return sanitized;
  }

  /**
   * Validates a limit parameter.
   *
   * @param limit the limit value
   * @param maxLimit the maximum allowed limit
   * @return validated limit
   * @throws IllegalArgumentException if limit is invalid
   */
  public static int validateLimit(Integer limit, int maxLimit) {
    if (limit == null) {
      return 100; // default
    }

    if (limit < 1) {
      throw new IllegalArgumentException("Limit must be at least 1");
    }

    if (limit > maxLimit) {
      log.warn("Limit {} exceeds maximum {}, using maximum", limit, maxLimit);
      return maxLimit;
    }

    return limit;
  }

  /**
   * Basic sanitization: trim and remove control characters.
   *
   * @param input the input to sanitize
   * @return sanitized string
   */
  private static String sanitize(String input) {
    if (input == null) {
      return null;
    }

    // Remove control characters and excessive whitespace
    return input.trim().replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "").replaceAll("\\s+", " ");
  }

  /**
   * Checks for SQL injection and XSS patterns.
   *
   * @param input the input to check
   * @throws IllegalArgumentException if malicious patterns detected
   */
  private static void checkForInjection(String input) {
    if (input == null) {
      return;
    }

    if (SQL_INJECTION_PATTERN.matcher(input).matches()) {
      log.error("Potential SQL injection detected: {}", input);
      throw new IllegalArgumentException("Input contains potentially malicious content");
    }

    if (XSS_PATTERN.matcher(input).matches()) {
      log.error("Potential XSS attack detected: {}", input);
      throw new IllegalArgumentException("Input contains potentially malicious content");
    }
  }

  /**
   * Validates that a string doesn't exceed maximum length.
   *
   * @param input the input to validate
   * @param maxLength maximum allowed length
   * @param fieldName name of the field for error messages
   * @throws IllegalArgumentException if input exceeds max length
   */
  public static void validateMaxLength(String input, int maxLength, String fieldName) {
    if (input != null && input.length() > maxLength) {
      throw new IllegalArgumentException(fieldName + " exceeds maximum length of " + maxLength);
    }
  }
}
