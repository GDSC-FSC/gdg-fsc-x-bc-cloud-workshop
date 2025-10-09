package com.example.api.web;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Standard error response structure for API errors. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
  private LocalDateTime timestamp;

  private int status;
  private String error;
  private String message;
  private String path;

  private List<ValidationError> validationErrors;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ValidationError {
    private String field;
    private String message;
  }
}
