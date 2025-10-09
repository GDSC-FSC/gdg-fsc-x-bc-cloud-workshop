package com.example.api.web;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * Global exception handler for all REST controllers.
 * 
 * <p>This class provides centralized exception handling for the entire API,
 * ensuring consistent error responses across all endpoints. It intercepts exceptions
 * thrown by controllers and service layers, translates them into appropriate HTTP
 * responses with standardized {@link ErrorResponse} bodies.
 * 
 * <p><b>Handled Exception Types:</b>
 * <ul>
 *   <li>{@link MethodArgumentNotValidException} - Bean validation failures (@Valid)</li>
 *   <li>{@link IllegalArgumentException} - Business logic validation failures</li>
 *   <li>{@link Exception} - All other unexpected errors</li>
 * </ul>
 * 
 * <p><b>Security Note:</b> This handler is careful not to expose sensitive
 * internal details (like stack traces) in production responses, which could
 * aid attackers in reconnaissance.
 * 
 * @see ErrorResponse
 * @see org.springframework.web.bind.annotation.RestControllerAdvice
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@RestControllerAdvice
@Slf4j
public class GlobalRestExceptionHandler {

  /**
   * Handles validation errors from Jakarta Bean Validation (@Valid, @Validated).
   * 
   * <p>This method is invoked when a request body fails validation constraints
   * defined by annotations like @NotNull, @Size, @Pattern, etc. It extracts all
   * field-level validation errors and returns them in a structured format.
   * 
   * @param ex the exception containing validation failure details
   * @param request the web request that triggered the exception
   * @return a {@link ResponseEntity} with HTTP 400 and detailed validation errors
   * @see jakarta.validation.Valid
   * @see ErrorResponse.ValidationError
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationExceptions(
      MethodArgumentNotValidException ex, WebRequest request) {

    log.warn("Validation error: {}", ex.getMessage());

    List<ErrorResponse.ValidationError> validationErrors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(
                error ->
                    new ErrorResponse.ValidationError(error.getField(), error.getDefaultMessage()))
            .collect(Collectors.toList());

    ErrorResponse errorResponse =
        ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Failed")
            .message("Invalid request parameters")
            .path(request.getDescription(false).replace("uri=", ""))
            .validationErrors(validationErrors)
            .build();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
  }

  /**
   * Handles illegal argument exceptions thrown by business logic validation.
   * 
   * <p>This handler catches {@link IllegalArgumentException} instances thrown
   * by service layer validation or {@link com.example.api.util.InputValidator},
   * typically when detecting SQL injection attempts, XSS patterns, or other
   * malicious input that passes Bean Validation but fails deeper security checks.
   * 
   * @param ex the exception containing the error message
   * @param request the web request that triggered the exception
   * @return a {@link ResponseEntity} with HTTP 400 and error details
   * @see com.example.api.util.InputValidator
   */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
      IllegalArgumentException ex, WebRequest request) {

    log.warn("Illegal argument: {}", ex.getMessage());

    ErrorResponse errorResponse =
        ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Bad Request")
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
  }

  /**
   * Handles all other unexpected exceptions not caught by specific handlers.
   * 
   * <p>This is the catch-all handler for any exception not explicitly handled above,
   * including runtime exceptions, database errors, and other system failures. It logs
   * the full exception details for debugging while returning a generic error message
   * to the client (to avoid exposing internal implementation details).
   * 
   * <p><b>Security Note:</b> The actual exception message and stack trace are logged
   * server-side but not exposed to the client, preventing information leakage.
   * 
   * @param ex the unexpected exception
   * @param request the web request that triggered the exception
   * @return a {@link ResponseEntity} with HTTP 500 and a generic error message
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {

    log.error("Unexpected error occurred", ex);

    ErrorResponse errorResponse =
        ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message("An unexpected error occurred. Please try again later.")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
  }
}
