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

  @Override
  public void init(FilterConfig filterConfig) {
    if (apiKeyEnabled && apiKeys != null && !apiKeys.isEmpty()) {
      validApiKeys = new HashSet<>(Arrays.asList(apiKeys.split(",")));
      log.info("API Key authentication enabled with {} valid keys", validApiKeys.size());
    } else {
      log.info("API Key authentication disabled");
    }
  }

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

  /** Check if the endpoint is public (doesn't require API key). */
  private boolean isPublicEndpoint(String path) {
    return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
  }

  /** Validate the provided API key. */
  private boolean isValidApiKey(String apiKey) {
    return validApiKeys != null && validApiKeys.contains(apiKey.trim());
  }

  /** Send unauthorized response. */
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
