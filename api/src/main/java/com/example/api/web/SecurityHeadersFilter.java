package com.example.api.web;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;

/**
 * Filter to add security headers to all HTTP responses. Helps prevent XSS, clickjacking, and other
 * common web vulnerabilities.
 */
@Component
public class SecurityHeadersFilter implements Filter {

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletResponse httpResponse = (HttpServletResponse) response;

    // Prevent clickjacking attacks
    httpResponse.setHeader("X-Frame-Options", "DENY");

    // Enable XSS protection in browsers
    httpResponse.setHeader("X-XSS-Protection", "1; mode=block");

    // Prevent MIME type sniffing
    httpResponse.setHeader("X-Content-Type-Options", "nosniff");

    // Content Security Policy - restrict resource loading
    httpResponse.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; "
            + "script-src 'self'; "
            + "style-src 'self' 'unsafe-inline'; "
            + "img-src 'self' data: https:; "
            + "font-src 'self'; "
            + "connect-src 'self'; "
            + "frame-ancestors 'none'");

    // Referrer Policy - control information sent in Referer header
    httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions Policy - control browser features
    httpResponse.setHeader(
        "Permissions-Policy",
        "geolocation=(), " + "microphone=(), " + "camera=(), " + "payment=(), " + "usb=()");

    // Strict Transport Security - enforce HTTPS (only in production with HTTPS)
    // Uncomment when deploying with HTTPS
    // httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    chain.doFilter(request, response);
  }
}
