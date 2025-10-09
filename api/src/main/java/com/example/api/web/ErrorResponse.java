package com.example.api.web;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard error response structure for all API errors.
 * 
 * <p>This class provides a consistent error response format across the entire API,
 * making it easier for clients to parse and handle errors uniformly. It follows
 * RFC 7807 (Problem Details for HTTP APIs) principles.
 * 
 * <p><b>Example JSON Response:</b>
 * <pre>
 * {
 *   "timestamp": "2024-10-09T14:30:00",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "message": "Invalid request parameters",
 *   "path": "/api/restaurants/query",
 *   "validationErrors": [
 *     {
 *       "field": "borough",
 *       "message": "Borough can only contain letters and spaces"
 *     }
 *   ]
 * }
 * </pre>
 * 
 * @see GlobalRestExceptionHandler
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

  /** Timestamp when the error occurred, formatted as ISO-8601. */
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime timestamp;

  /** HTTP status code (e.g., 400, 404, 500). */
  private int status;
  
  /** Brief error type (e.g., "Bad Request", "Not Found", "Internal Server Error"). */
  private String error;
  
  /** Detailed human-readable error message explaining what went wrong. */
  private String message;
  
  /** The request path that caused the error. */
  private String path;

  /** 
   * List of field-specific validation errors (only populated for validation failures).
   * 
   * <p>This field is null for non-validation errors (e.g., server errors, not found).
   */
  private List<ValidationError> validationErrors;

  /**
   * Represents a single field validation error.
   * 
   * <p>Used when request validation fails due to invalid field values.
   * Each validation error identifies the problematic field and provides
   * a message explaining the validation constraint that was violated.
   * 
   * @see jakarta.validation.Valid
   * @see GlobalRestExceptionHandler#handleValidationExceptions
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ValidationError {
    /** Name of the field that failed validation. */
    private String field;
    
    /** Message explaining why the field failed validation. */
    private String message;
  }
}
