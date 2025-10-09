package com.example.api.web;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Filter to log incoming HTTP requests and outgoing responses.
 * 
 * <p>This filter provides centralized logging of all HTTP traffic through the API,
 * capturing key details such as HTTP method, request path, client IP, response status,
 * and request duration. This information is invaluable for:
 * <ul>
 *   <li>Debugging issues and tracing request flows</li>
 *   <li>Monitoring API usage patterns and performance</li>
 *   <li>Security auditing and detecting suspicious activity</li>
 *   <li>Performance analysis and identifying slow endpoints</li>
 * </ul>
 * 
 * <p><b>Log Format:</b>
 * <pre>
 * INFO  Incoming Request: GET /api/restaurants/boroughs from 192.168.1.100
 * INFO  Outgoing Response: GET /api/restaurants/boroughs - Status: 200 - Duration: 45ms
 * </pre>
 * 
 * <p><b>Production Considerations:</b>
 * <ul>
 *   <li>Consider structured logging (JSON) for easier parsing and analysis</li>
 *   <li>Be cautious about logging sensitive data (passwords, tokens, etc.)</li>
 *   <li>Adjust log levels based on environment (DEBUG for dev, INFO for prod)</li>
 *   <li>Consider sampling high-volume endpoints to reduce log volume</li>
 * </ul>
 * 
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class RequestLoggingFilter implements Filter {

  /**
   * Logs request and response details for every HTTP request.
   * 
   * <p>This method:
   * <ol>
   *   <li>Records the start time</li>
   *   <li>Logs the incoming request details</li>
   *   <li>Invokes the filter chain (processes the request)</li>
   *   <li>Calculates the request duration</li>
   *   <li>Logs the response details with timing information</li>
   * </ol>
   * 
   * <p>The response logging is done in a finally block to ensure it happens
   * even if an exception occurs during request processing.
   * 
   * @param request the incoming servlet request
   * @param response the servlet response
   * @param chain the filter chain to continue processing
   * @throws IOException if an I/O error occurs
   * @throws ServletException if a servlet error occurs
   */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;

    long startTime = System.currentTimeMillis();

    // Log request
    log.info(
        "Incoming Request: {} {} from {}",
        httpRequest.getMethod(),
        httpRequest.getRequestURI(),
        httpRequest.getRemoteAddr());

    try {
      chain.doFilter(request, response);
    } finally {
      long duration = System.currentTimeMillis() - startTime;

      // Log response
      log.info(
          "Outgoing Response: {} {} - Status: {} - Duration: {}ms",
          httpRequest.getMethod(),
          httpRequest.getRequestURI(),
          httpResponse.getStatus(),
          duration);
    }
  }
}
