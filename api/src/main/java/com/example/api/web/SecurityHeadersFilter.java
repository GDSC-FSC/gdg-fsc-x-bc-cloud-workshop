package com.example.api.web;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;

/**
 * Filter to add security headers to all HTTP responses.
 * 
 * <p>This filter implements defense-in-depth by adding multiple security-related HTTP
 * headers to every response. These headers instruct browsers to enable built-in security
 * features that help prevent common web vulnerabilities such as:
 * <ul>
 *   <li>Cross-Site Scripting (XSS) attacks</li>
 *   <li>Clickjacking attacks</li>
 *   <li>MIME type sniffing vulnerabilities</li>
 *   <li>Cross-Site Request Forgery (CSRF)</li>
 *   <li>Information leakage through the Referer header</li>
 * </ul>
 * 
 * <p><b>Security Headers Applied:</b>
 * <ul>
 *   <li><b>X-Frame-Options:</b> Prevents the page from being embedded in iframes (clickjacking protection)</li>
 *   <li><b>X-XSS-Protection:</b> Enables browser's built-in XSS filter</li>
 *   <li><b>X-Content-Type-Options:</b> Prevents MIME type sniffing</li>
 *   <li><b>Content-Security-Policy:</b> Restricts resource loading to prevent XSS</li>
 *   <li><b>Referrer-Policy:</b> Controls what information is sent in the Referer header</li>
 *   <li><b>Permissions-Policy:</b> Disables unnecessary browser features</li>
 *   <li><b>Strict-Transport-Security:</b> Enforces HTTPS (commented out, enable in production)</li>
 * </ul>
 * 
 * <p><b>Production Deployment Notes:</b>
 * <ul>
 *   <li>Uncomment HSTS header when deploying with HTTPS</li>
 *   <li>Adjust CSP directives based on your frontend requirements</li>
 *   <li>Test headers thoroughly to ensure they don't break functionality</li>
 * </ul>
 * 
 * @see <a href="https://owasp.org/www-project-secure-headers/">OWASP Secure Headers Project</a>
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Component
public class SecurityHeadersFilter implements Filter {

  /**
   * Adds security headers to the HTTP response.
   * 
   * <p>This method intercepts every HTTP response and adds multiple security
   * headers before passing it to the next filter in the chain. The headers
   * are added regardless of the response status or content type.
   * 
   * @param request the incoming servlet request
   * @param response the servlet response to which headers will be added
   * @param chain the filter chain to continue processing
   * @throws IOException if an I/O error occurs
   * @throws ServletException if a servlet error occurs
   */
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
