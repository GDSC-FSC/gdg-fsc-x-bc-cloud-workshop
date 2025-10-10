# Additional API Components

This document describes the additional components added to the `implementations`, `model`, and `web` folders.

## Model Package (`model/`)

Contains enums and model classes for type-safe API operations.

### Borough.java
- Enum representing NYC's five boroughs
- Values: MANHATTAN, BROOKLYN, QUEENS, BRONX, STATEN_ISLAND
- Provides JSON serialization/deserialization
- Database value conversion methods

### Grade.java
- Enum for restaurant health inspection grades
- Values: A, B, C, P (Pending), Z (Grade pending), NOT_YET_GRADED
- Ordered from best to worst
- Includes `meetsMinimum()` method for grade comparison

### InspectionType.java
- Enum for different types of health inspections
- Examples: CYCLE, REINSPECTION, COMPLIANCE, PRE_PERMIT
- Human-readable descriptions for each type

### CriticalFlag.java
- Enum for violation criticality
- Values: CRITICAL, NOT_CRITICAL, NOT_APPLICABLE
- Converts from various string formats (Y/N, Critical/Not Critical)

## Implementations Package (`implementations/`)

Contains concrete implementations of service interfaces, following the interface-implementation pattern.

### RestaurantInspectionServiceImpl.java
- Implementation of `IRestaurantInspectionService` interface
- All business logic for restaurant searches and data retrieval
- Private helper methods for DTO mapping
- Transactional support with `@Transactional(readOnly = true)`
- Comprehensive logging for debugging

**Benefits of this pattern:**
- Easier to mock for testing
- Cleaner separation of concerns
- Makes dependency injection more explicit
- Allows for multiple implementations if needed

## Web Package (`web/`)

Contains web-layer components like filters, exception handlers, and configurations.

### ApiKeyAuthenticationFilter.java
- Servlet filter for optional API key authentication
- Runs with `@Order(1)` to execute before other filters
- Validates `X-API-Key` header against configured keys
- Bypasses authentication for public endpoints (health checks)
- Returns 401 Unauthorized for missing or invalid API keys
- Configurable via `application.properties`:
  - `security.api-key.enabled=true/false`
  - `security.api-key.keys=key1,key2,key3`
- Logs all authentication attempts with IP addresses

**Benefits:**
- Simple API key authentication without complex OAuth setup
- Easy to enable/disable per environment
- Supports multiple keys for different clients/services
- Detailed audit trail of authentication events

### RequestLoggingFilter.java
- Servlet filter that logs all incoming requests and outgoing responses
- Tracks request duration for performance monitoring
- Logs HTTP method, URI, remote address, status code, and execution time
- Useful for debugging and API usage monitoring

### ErrorResponse.java
- Standardized error response DTO
- Fields: timestamp, status, error, message, path
- Includes nested ValidationError class for validation failures
- Ensures consistent error format across all API endpoints

### GlobalRestExceptionHandler.java
- Global exception handler using `@RestControllerAdvice`
- Handles multiple exception types:
  - `MethodArgumentNotValidException` - validation errors (400)
  - `IllegalArgumentException` - bad requests (400)
  - `Exception` - generic errors (500)
- Converts exceptions to standardized `ErrorResponse` objects
- Includes detailed logging for debugging

### WebConfiguration.java
- Spring MVC configuration
- Sets JSON as default content type
- Configures content negotiation strategy
- Can be extended for additional web settings

## Architecture Benefits

### Separation of Concerns
- **model/**: Domain models and enums
- **implementations/**: Business logic implementations
- **web/**: Web-layer concerns (filters, error handling, configuration)

### Maintainability
- Clear package structure makes code easier to navigate
- Interface-implementation pattern simplifies testing
- Centralized error handling reduces code duplication

### Professional Standards
- Follows Spring Boot best practices
- Comprehensive error handling
- Request/response logging for monitoring
- Type-safe enums prevent invalid data

## Usage Examples

### Using Enums in Requests
```java
// In SearchRequest
{
  "borough": "MANHATTAN",  // Will be parsed to Borough.MANHATTAN
  "minGrade": "A"          // Will be parsed to Grade.A
}
```

### Error Response Format
```json
{
  "timestamp": "2025-10-09T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid request parameters",
  "path": "/api/restaurants/query",
  "validationErrors": [
    {
      "field": "limit",
      "message": "must be less than or equal to 1000"
    }
  ]
}
```

### Request Logging Output
```
INFO: Incoming Request: POST /api/restaurants/query from 127.0.0.1
INFO: Outgoing Response: POST /api/restaurants/query - Status: 200 - Duration: 45ms
```

## Testing

All new components are automatically included in the build and will be tested when you run:

```bash
./gradlew test
```

The interface-implementation pattern makes it easy to create mock implementations for unit testing.
