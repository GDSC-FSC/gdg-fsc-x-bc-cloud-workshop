# Security Quick Reference Guide

## 🚀 Quick Start

### Development Mode (Default)
All security features are enabled except API key authentication:
- ✅ Input validation
- ✅ Rate limiting (100 req/min per IP)
- ✅ Security headers
- ✅ CORS (localhost only)
- ✅ SQL injection prevention
- ❌ API key authentication (disabled)

### Production Mode
Enable all security features:

**application.properties:**
```properties
# Enable API key authentication
security.api-key.enabled=true
security.api-key.keys=<generate-strong-keys>

# Use environment variables for secrets
spring.datasource.password=${DB_PASSWORD}

# Enable HTTPS
server.ssl.enabled=true
```

## 🔐 Security Features

### 1. Input Validation
- **Auto-applied** to all requests
- Validates format, length, and content
- Blocks SQL injection and XSS attempts

### 2. Rate Limiting
- **100 requests/minute** per IP address
- Returns HTTP 429 when exceeded
- IP detection supports proxies

### 3. Security Headers
```
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Content-Security-Policy: <restrictive>
```

### 4. CORS Policy
**Development:**
- Allows: `http://localhost:*`
- Methods: GET, POST, OPTIONS

**Production:**
Update `SecurityConfiguration.java`:
```java
configuration.setAllowedOriginPatterns(List.of(
    "https://yourdomain.com"
));
```

### 5. API Key Authentication (Optional)
**Enable:**
```properties
security.api-key.enabled=true
security.api-key.keys=key1,key2,key3
```

**Use:**
```bash
curl -H "X-API-Key: your-key" http://localhost:8080/api/restaurants/query
```

**Public Endpoints** (no key required):
- `/api/restaurants/health`
- `/actuator/health`

## 🛠️ Configuration Files

### Security-Related Files:
```
api/src/main/
├── java/com/example/api/
│   ├── config/
│   │   └── SecurityConfiguration.java      # CORS, Spring Security
│   ├── util/
│   │   └── InputValidator.java             # Input validation
│   └── web/
│       ├── ApiKeyAuthenticationFilter.java # API key auth (@Order(1))
│       ├── RateLimitingFilter.java         # Rate limiting
│       ├── SecurityHeadersFilter.java      # HTTP headers
│       ├── GlobalRestExceptionHandler.java # Error handling
│       └── RequestLoggingFilter.java       # Audit logging
└── resources/
    └── application.properties              # Configuration

Note: ApiKeyAuthenticationFilter runs with @Order(1) to execute first
```

## 🧪 Testing Security

### Test SQL Injection Protection:
```bash
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{"borough": "MANHATTAN; DROP TABLE restaurants;"}'
```
**Expected:** 400 Bad Request

### Test XSS Protection:
```bash
curl -X POST http://localhost:8080/api/restaurants/details \
  -H "Content-Type: application/json" \
  -d '{"restaurantName": "<script>alert(\"XSS\")</script>"}'
```
**Expected:** 400 Bad Request

### Test Rate Limiting:
```bash
# Send 150 requests rapidly
for i in {1..150}; do
  curl http://localhost:8080/api/restaurants/health
done
```
**Expected:** HTTP 429 after ~100 requests

### Test API Key Authentication:
```bash
# Enable API keys first
# security.api-key.enabled=true
# security.api-key.keys=test-key

# Without key
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{"borough": "MANHATTAN"}'
# Expected: 401 Unauthorized

# With valid key
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"borough": "MANHATTAN"}'
# Expected: 200 OK
```

## 📊 Monitoring

### Check Logs:
```bash
# View security events
grep "WARN\|ERROR" /tmp/spring-boot-api.log

# View rate limit violations
grep "Rate limit exceeded" /tmp/spring-boot-api.log

# View API key failures
grep "Invalid API key" /tmp/spring-boot-api.log
```

### Request Logging Output:
```
INFO: Incoming Request: POST /api/restaurants/query from 192.168.1.100
INFO: Outgoing Response: POST /api/restaurants/query - Status: 200 - Duration: 45ms
```

## ⚠️ Common Issues

### 1. CORS Errors
**Problem:** Frontend can't access API
**Solution:** Add origin to `SecurityConfiguration.java`
```java
configuration.setAllowedOriginPatterns(List.of(
    "http://localhost:5173",  // Vite dev server
    "http://localhost:3000"   // React dev server
));
```

### 2. Rate Limit Too Restrictive
**Problem:** Legitimate users hitting rate limit
**Solution:** Adjust in `RateLimitingFilter.java`
```java
private static final int CAPACITY = 200;  // Increase from 100
```

### 3. Input Validation Too Strict
**Problem:** Valid input being rejected
**Solution:** Update patterns in `InputValidator.java`
```java
private static final Pattern ALPHANUMERIC_SPACE = 
    Pattern.compile("^[a-zA-Z0-9\\s\\-',.&()!]+$");  // Add ! to allowed chars
```

### 4. API Key Not Working
**Problem:** Valid key returns 401
**Solution:** Check configuration
```properties
# Ensure no spaces in keys
security.api-key.keys=key1,key2,key3

# Check enabled flag
security.api-key.enabled=true
```

## 🔒 Production Checklist

Before deploying to production:

- [ ] Enable HTTPS
- [ ] Update CORS allowed origins
- [ ] Enable API key authentication
- [ ] Use strong, random API keys (32+ characters)
- [ ] Store secrets in environment variables
- [ ] Configure proper logging
- [ ] Set up log monitoring/alerts
- [ ] Review rate limits
- [ ] Test all security features
- [ ] Run dependency security scan
- [ ] Document API keys and distribution
- [ ] Set up incident response plan

## 📞 Security Support

**Report Security Issues:**
- Email: security@yourdomain.com
- Include: steps to reproduce, impact assessment
- Practice responsible disclosure

**Documentation:**
- Full Guide: `SECURITY.md`
- API Docs: `README.md`
- Package Structure: `PACKAGE_STRUCTURE.md`

## 🔄 Regular Maintenance

**Weekly:**
- Review security logs
- Check for unusual patterns

**Monthly:**
- Update dependencies: `./gradlew dependencyUpdates`
- Rotate API keys

**Quarterly:**
- Security audit
- Penetration testing
- Review and update security policies
