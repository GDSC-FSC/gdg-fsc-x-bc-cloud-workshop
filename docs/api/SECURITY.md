# Security Features & Best Practices

This document outlines the security measures implemented in the NYC Restaurants API.

## 🔒 Security Features Implemented

### 1. Input Validation & Sanitization

**File:** `util/InputValidator.java`

#### Features:
- **Pattern Validation**: Regular expressions to validate input format
- **Length Limits**: Prevent buffer overflow attacks
- **SQL Injection Detection**: Scans for common SQL injection patterns
- **XSS Prevention**: Detects and blocks script injection attempts
- **Control Character Removal**: Strips malicious control characters

#### Protected Fields:
- Restaurant names (max 200 chars)
- Borough names (max 50 chars, letters only)
- Cuisine descriptions (max 100 chars)
- Grade values (single uppercase letter)
- Limit parameters (1-1000)

```java
// Example usage
String safe = InputValidator.validateRestaurantName(userInput);
```

### 2. Rate Limiting

**File:** `web/RateLimitingFilter.java`

#### Configuration:
- **Algorithm**: Token bucket
- **Limit**: 100 requests per minute per IP address
- **Response**: HTTP 429 (Too Many Requests)

#### Features:
- IP-based throttling
- Supports proxy headers (X-Forwarded-For, X-Real-IP)
- Automatic token refill
- Graceful degradation

#### Response on Rate Limit:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### 3. Security Headers

**File:** `web/SecurityHeadersFilter.java`

#### Headers Applied:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Enable browser XSS protection |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| Content-Security-Policy | restrictive | Control resource loading |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |
| Permissions-Policy | restrictive | Disable unnecessary features |

#### Content Security Policy:
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none'
```

### 4. CORS Configuration

**File:** `config/SecurityConfiguration.java`

#### Development Settings:
- Allows localhost on any port
- Limited to necessary HTTP methods (GET, POST, OPTIONS)
- Specific headers allowed (no wildcards)
- No credentials allowed
- 1-hour preflight cache

#### Production Recommendations:
```java
configuration.setAllowedOriginPatterns(List.of(
    "https://yourdomain.com",
    "https://app.yourdomain.com"
));
```

### 5. API Key Authentication (Optional)

**File:** `web/ApiKeyAuthenticationFilter.java`

#### Configuration:
```properties
# Enable API key authentication
security.api-key.enabled=true

# Set valid API keys (comma-separated)
security.api-key.keys=key1,key2,key3
```

#### Features:
- Header-based authentication (X-API-Key)
- Multiple valid keys supported
- Public endpoints exempted (/health, /actuator/health)
- Detailed logging of authentication attempts

#### Usage:
```bash
curl -H "X-API-Key: your-api-key" http://localhost:8080/api/restaurants/query
```

### 6. SQL Injection Prevention

**File:** `repository/RestaurantInspectionRepository.java`

#### Protection Methods:
1. **Parameterized Queries**: All queries use `@Param` annotations
2. **JPQL**: Hibernate automatically escapes parameters
3. **Input Validation**: DTOs validate before reaching repository
4. **Type Safety**: Strong typing prevents injection

```java
// Safe parameterized query
@Query("SELECT r FROM RestaurantInspection r WHERE UPPER(r.boro) = UPPER(:borough)")
List<RestaurantInspection> findByBorough(@Param("borough") String borough);
```

### 7. Request/Response Logging

**File:** `web/RequestLoggingFilter.java`

#### Logged Information:
- HTTP method and URI
- Client IP address
- Response status code
- Request duration (ms)

#### Benefits:
- Security audit trail
- Performance monitoring
- Incident investigation
- Rate limit analysis

### 8. Global Exception Handling

**File:** `web/GlobalRestExceptionHandler.java`

#### Features:
- Consistent error responses
- No stack trace exposure to clients
- Detailed server-side logging
- Validation error details

#### Error Response Format:
```json
{
  "timestamp": "2025-10-09T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid request parameters",
  "path": "/api/restaurants/query"
}
```

## 🛡️ Security Checklist

### Before Production Deployment:

- [ ] **Enable HTTPS**: Update SecurityConfiguration for HSTS
- [ ] **Update CORS**: Replace localhost with actual domains
- [ ] **Enable API Keys**: Set `security.api-key.enabled=true`
- [ ] **Generate Strong Keys**: Use cryptographically secure random keys
- [ ] **Environment Variables**: Move secrets to environment variables
- [ ] **Database Credentials**: Use strong passwords, rotate regularly
- [ ] **Logging**: Configure log retention and monitoring
- [ ] **Rate Limits**: Adjust based on expected traffic
- [ ] **Error Messages**: Ensure no sensitive data in error responses
- [ ] **Dependencies**: Update all dependencies to latest secure versions

### Configuration Changes for Production:

**application.properties:**
```properties
# HTTPS only
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${KEYSTORE_PASSWORD}

# API Key Authentication
security.api-key.enabled=true
security.api-key.keys=${API_KEYS}

# Database (use environment variables)
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Disable stack traces
server.error.include-stacktrace=never
server.error.include-message=never

# Actuator security
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=never
```

## 🔍 Vulnerability Scanning

### Recommended Tools:

1. **OWASP Dependency-Check**
   ```bash
   ./gradlew dependencyCheckAnalyze
   ```

2. **Snyk**
   ```bash
   snyk test
   ```

3. **SonarQube**
   ```bash
   ./gradlew sonarqube
   ```

## 📊 Security Testing

### Manual Tests:

1. **SQL Injection**
   ```bash
   curl -X POST http://localhost:8080/api/restaurants/query \
     -H "Content-Type: application/json" \
     -d '{"borough": "MANHATTAN OR 1=1"}'
   ```
   Expected: 400 Bad Request

2. **XSS**
   ```bash
   curl -X POST http://localhost:8080/api/restaurants/details \
     -H "Content-Type: application/json" \
     -d '{"restaurantName": "<script>alert(1)</script>"}'
   ```
   Expected: 400 Bad Request

3. **Rate Limiting**
   ```bash
   for i in {1..150}; do
     curl http://localhost:8080/api/restaurants/health
   done
   ```
   Expected: 429 after 100 requests

4. **CORS**
   ```bash
   curl -H "Origin: http://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:8080/api/restaurants/query
   ```
   Expected: No CORS headers for unauthorized origin

## 🚨 Security Incident Response

### If a Security Issue is Discovered:

1. **Immediate Actions:**
   - Enable API key authentication
   - Review logs for suspicious activity
   - Identify affected endpoints
   - Block malicious IP addresses

2. **Investigation:**
   - Check RequestLoggingFilter logs
   - Analyze database for unauthorized access
   - Review recent code changes

3. **Remediation:**
   - Apply security patches
   - Update dependencies
   - Rotate API keys
   - Reset compromised credentials

4. **Prevention:**
   - Add additional validation
   - Implement stricter rate limits
   - Update security tests
   - Document the incident

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## 🔧 Maintenance

### Regular Security Tasks:

- **Weekly**: Review security logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Penetration testing

### Dependency Updates:
```bash
# Check for updates
./gradlew dependencyUpdates

# Update and test
./gradlew clean build test
```

## 📝 Security Contact

For security issues, please contact:
- Email: security@yourdomain.com
- Use responsible disclosure
- Include steps to reproduce
- Allow time for patching before public disclosure
