package com.example.api.web;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Optional API Key authentication filter. Enabled via application.properties:
 * security.api-key.enabled=true
 *
 * <p>To use: 1. Set security.api-key.enabled=true 2. Set security.api-key.keys=key1,key2,key3 3.
 * Include X-API-Key header in requests
 */
@Component
@Slf4j
@Order(1) // Run before other filters
public class ApiKeyAuthenticationFilter implements Filter {

  @Value("${security.api-key.enabled:false}")
  private boolean apiKeyEnabled;

  @Value("${security.api-key.keys:}")
  private String apiKeys;

  private Set<String> validApiKeys;

  // Public endpoints that don't require API key
  private static final Set<String> PUBLIC_ENDPOINTS =
      new HashSet<>(Arrays.asList("/api/restaurants/health", "/actuator/health"));

  /**
   * Initializes the filter by parsing the configured API keys.
   * 
   * <p>This method is called once when the filter is initialized. It checks
   * if API key authentication is enabled and parses the comma-separated list
   * of valid API keys into a set for efficient lookup.
   * 
   * @param filterConfig the filter configuration (unused)
   */
  @Override
  public void init(FilterConfig filterConfig) {
    if (apiKeyEnabled && apiKeys != null && !apiKeys.isEmpty()) {
      validApiKeys = new HashSet<>(Arrays.asList(apiKeys.split(",")));
      log.info("API Key authentication enabled with {} valid keys", validApiKeys.size());
    } else {
      log.info("API Key authentication disabled");
    }
  }

  /**
   * Filters incoming requests and enforces API key authentication if enabled.
   * 
   * <p>This method:
   * <ol>
   *   <li>Checks if API key authentication is enabled</li>
   *   <li>Bypasses authentication for public endpoints (health checks, etc.)</li>
   *   <li>Validates the X-API-Key header against configured valid keys</li>
   *   <li>Allows or rejects the request based on API key validity</li>
   * </ol>
   * 
   * <p>If the API key is missing or invalid, the request is rejected with
   * HTTP 401 Unauthorized.
   * 
   * @param request the incoming servlet request
   * @param response the servlet response to modify if authentication fails
   * @param chain the filter chain to continue processing if authenticated
   * @throws IOException if an I/O error occurs
   * @throws ServletException if a servlet error occurs
   */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    if (!apiKeyEnabled) {
      // API key authentication is disabled, continue
      chain.doFilter(request, response);
      return;
    }

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;

    String requestPath = httpRequest.getRequestURI();

    // Allow public endpoints without API key
    if (isPublicEndpoint(requestPath)) {
      chain.doFilter(request, response);
      return;
    }

    // Check for API key in header
    String apiKey = httpRequest.getHeader("X-API-Key");

    if (apiKey == null || apiKey.trim().isEmpty()) {
      log.warn("Missing API key for request: {} from {}", requestPath, httpRequest.getRemoteAddr());
      sendUnauthorizedResponse(httpResponse, "API key is required");
      return;
    }

    if (!isValidApiKey(apiKey)) {
      log.warn(
          "Invalid API key attempt for request: {} from {}",
          requestPath,
          httpRequest.getRemoteAddr());
      sendUnauthorizedResponse(httpResponse, "Invalid API key");
      return;
    }

    // Valid API key, proceed
    log.debug("Valid API key for request: {}", requestPath);
    chain.doFilter(request, response);
  }

  /**
   * Checks if the given path is a public endpoint that doesn't require API key.
   * 
   * <p>Public endpoints typically include health checks and actuator endpoints
   * that need to be accessible without authentication for monitoring purposes.
   * 
   * @param path the request path to check
   * @return true if the endpoint is public, false otherwise
   */
  private boolean isPublicEndpoint(String path) {
    return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
  }

  /**
   * Validates the provided API key against the set of valid keys.
   * 
   * <p>The comparison is done after trimming whitespace from the provided key
   * to be lenient with formatting.
   * 
   * @param apiKey the API key to validate
   * @return true if the API key is valid, false otherwise
   */
  private boolean isValidApiKey(String apiKey) {
    return validApiKeys != null && validApiKeys.contains(apiKey.trim());
  }

  /**
   * Sends an HTTP 401 Unauthorized response with a JSON error body.
   * 
   * <p>The response includes a hint to the client about including the
   * X-API-Key header in their request.
   * 
   * @param response the HTTP response to write to
   * @param message the error message to include in the response
   * @throws IOException if an I/O error occurs while writing the response
   */
  private void sendUnauthorizedResponse(HttpServletResponse response, String message)
      throws IOException {
    response.setStatus(HttpStatus.UNAUTHORIZED.value());
    response.setContentType("application/json");
    response
        .getWriter()
        .write(
            "{\"error\": \"Unauthorized\", "
                + "\"message\": \""
                + message
                + "\", "
                + "\"hint\": \"Include X-API-Key header in your request\"}");
  }
}
