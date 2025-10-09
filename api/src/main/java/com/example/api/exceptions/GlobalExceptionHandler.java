package com.example.api.exceptions;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for handling various security-related exceptions.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
  /**
   * Handles security-related exceptions and returns a ProblemDetail response.
   *
   * @param exception the exception to handle
   * @return a ProblemDetail response with the appropriate status and description
   */
  @ExceptionHandler(Exception.class)
  public ProblemDetail handleSecurityException(Exception exception) {
    ProblemDetail errorDetail = null;

    // TODO send this stack trace to an observability tool
    exception.printStackTrace();

    if (errorDetail == null) {
      errorDetail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(500), exception.getMessage());
      errorDetail.setProperty("description", "Unknown internal server error.");
    }

    return errorDetail;
  }
}
