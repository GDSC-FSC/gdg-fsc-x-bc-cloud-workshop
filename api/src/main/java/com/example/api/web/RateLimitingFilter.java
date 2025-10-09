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
 * Rate limiting filter to prevent abuse and DDoS attacks. Uses token bucket algorithm to limit
 * requests per IP address.
 */
@Component
@Slf4j
public class RateLimitingFilter implements Filter {

  // Store buckets per IP address
  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  // Rate limit: 100 requests per minute per IP
  private static final int CAPACITY = 100;
  private static final Duration REFILL_DURATION = Duration.ofMinutes(1);

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

  /** Resolve or create a bucket for the given IP address. */
  private Bucket resolveBucket(String ip) {
    return buckets.computeIfAbsent(ip, k -> createNewBucket());
  }

  /** Create a new bucket with defined rate limits. */
  private Bucket createNewBucket() {
    Bandwidth limit = Bandwidth.classic(CAPACITY, Refill.intervally(CAPACITY, REFILL_DURATION));
    return Bucket.builder().addLimit(limit).build();
  }

  /** Extract client IP address, considering proxy headers. */
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
