package com.example.api.web;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Rate limiting filter to prevent API abuse and DDoS attacks.
 * 
 * <p>This filter implements the token bucket algorithm to limit the number of requests
 * per IP address within a time window. Each IP address gets its own bucket with a fixed
 * capacity that refills at a constant rate. When a request arrives, it consumes one token
 * from the bucket. If no tokens are available, the request is rejected with HTTP 429.
 * 
 * <p><b>Configuration:</b>
 * <ul>
 *   <li>Capacity: 100 requests per bucket</li>
 *   <li>Refill Rate: 100 tokens per minute (full refill every minute)</li>
 *   <li>Granularity: Per IP address</li>
 * </ul>
 * 
 * <p><b>Production Considerations:</b>
 * <ul>
 *   <li>Consider using Redis for distributed rate limiting across multiple instances</li>
 *   <li>Adjust limits based on actual traffic patterns and capacity</li>
 *   <li>Implement different limits for authenticated vs. anonymous users</li>
 *   <li>Clean up buckets for inactive IPs to prevent memory leaks</li>
 * </ul>
 * 
 * <p><b>Proxy Awareness:</b> The filter checks X-Forwarded-For and X-Real-IP headers
 * to identify the true client IP when behind a proxy or load balancer.
 * 
 * @see io.github.bucket4j.Bucket
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class RateLimitingFilter implements Filter {

  /** Store buckets per IP address (in-memory, consider Redis for production). */
  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  /** Maximum number of requests allowed per time window. */
  private static final int CAPACITY = 100;
  
  /** Time window for token refill. */
  private static final Duration REFILL_DURATION = Duration.ofMinutes(1);

  /**
   * Filters incoming requests and enforces rate limiting.
   * 
   * <p>For each request, this method:
   * <ol>
   *   <li>Identifies the client IP address</li>
   *   <li>Retrieves or creates a token bucket for that IP</li>
   *   <li>Attempts to consume one token from the bucket</li>
   *   <li>Allows or rejects the request based on token availability</li>
   * </ol>
   * 
   * @param request the incoming servlet request
   * @param response the servlet response to modify if rate limit exceeded
   * @param chain the filter chain to continue processing if allowed
   * @throws IOException if an I/O error occurs
   * @throws ServletException if a servlet error occurs
   */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;

    String clientIp = getClientIp(httpRequest);
    Bucket bucket = resolveBucket(clientIp);

    if (bucket.tryConsume(1)) {
      // Request allowed
      chain.doFilter(request, response);
    } else {
      // Rate limit exceeded
      log.warn("Rate limit exceeded for IP: {}", clientIp);
      httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      httpResponse.setContentType("application/json");
      httpResponse
          .getWriter()
          .write(
              "{\"error\": \"Rate limit exceeded\", "
                  + "\"message\": \"Too many requests. Please try again later.\", "
                  + "\"retryAfter\": 60}");
    }
  }

  /**
   * Resolves or creates a token bucket for the given IP address.
   * 
   * <p>Uses {@link ConcurrentHashMap#computeIfAbsent} to ensure thread-safe
   * bucket creation. If a bucket doesn't exist for the IP, a new one is created.
   * 
   * @param ip the client IP address
   * @return the token bucket associated with this IP
   */
  private Bucket resolveBucket(String ip) {
    return buckets.computeIfAbsent(ip, k -> createNewBucket());
  }

  /**
   * Creates a new token bucket with the configured rate limits.
   * 
   * <p>The bucket uses a classic token bucket algorithm with:
   * <ul>
   *   <li>Initial capacity of {@link #CAPACITY} tokens</li>
   *   <li>Refill rate of {@link #CAPACITY} tokens per {@link #REFILL_DURATION}</li>
   *   <li>Refill happens gradually (intervally) rather than all at once</li>
   * </ul>
   * 
   * @return a new configured {@link Bucket} instance
   */
  private Bucket createNewBucket() {
    Bandwidth limit = Bandwidth.classic(CAPACITY, Refill.intervally(CAPACITY, REFILL_DURATION));
    return Bucket.builder().addLimit(limit).build();
  }

  /**
   * Extracts the true client IP address, considering proxy headers.
   * 
   * <p>When the application is behind a reverse proxy or load balancer,
   * the direct remote address is the proxy's IP, not the client's. This method
   * checks common proxy headers to identify the original client IP.
   * 
   * <p><b>Header Priority:</b>
   * <ol>
   *   <li>X-Forwarded-For (standard, comma-separated if multiple proxies)</li>
   *   <li>X-Real-IP (nginx-specific)</li>
   *   <li>RemoteAddr (direct connection or fallback)</li>
   * </ol>
   * 
   * <p><b>Security Note:</b> In production, ensure your load balancer or proxy
   * is configured to set these headers correctly and strip any client-provided
   * values to prevent IP spoofing.
   * 
   * @param request the HTTP servlet request
   * @return the client's IP address
   */
  private String getClientIp(HttpServletRequest request) {
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
      return xForwardedFor.split(",")[0].trim();
    }

    String xRealIp = request.getHeader("X-Real-IP");
    if (xRealIp != null && !xRealIp.isEmpty()) {
      return xRealIp;
    }

    return request.getRemoteAddr();
  }
}
