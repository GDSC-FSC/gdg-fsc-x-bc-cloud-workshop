# NYC Restaurants API

A Spring Boot REST API for querying NYC restaurant health inspection data from a PostgreSQL database.

## Quick Start

```bash
# Build
cd api
./gradlew clean build

# Run
./gradlew bootRun
# OR
java -jar build/libs/api-0.0.1-SNAPSHOT.jar

# Test
cd ..
./scripts/test-api.sh
```

API runs on `http://localhost:8080`

## Prerequisites

- Java 21+
- PostgreSQL database running (see `scripts/db-setup.sh` to set up)
- Gradle (included via wrapper)

## Database Setup

The API expects a PostgreSQL database with the following configuration:
- Host: localhost
- Port: 5432
- Database: postgres
- Username: postgres
- Password: brooklyn
- Table: nyc_restaurant_inspections

To set up the database with Docker:

```bash
# From the project root
./scripts/db-setup.sh
```

This will:
1. Create a Docker network and volume
2. Start PostgreSQL container
3. Load NYC restaurant inspection data

## Security Features

- ✅ Input validation and sanitization
- ✅ Rate limiting (100 req/min per IP)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ CORS configuration
- ✅ Optional API key authentication
- ✅ Comprehensive error handling
- ✅ Request/response logging

## API Endpoints

### Health Check
```bash
GET /api/restaurants/health
```

### Search Restaurants
```bash
POST /api/restaurants/query
Content-Type: application/json

{
  "borough": "MANHATTAN",      // Optional: MANHATTAN, BROOKLYN, QUEENS, BRONX, STATEN_ISLAND
  "cuisine": "Pizza",           // Optional: partial match
  "minGrade": "A",             // Optional: A, B, C, P, Z
  "limit": 100                 // Optional: default 100, max 1000
}
```

Example:
```bash
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{
    "borough": "MANHATTAN",
    "cuisine": "Pizza",
    "minGrade": "A",
    "limit": 10
  }'
```

### Get Restaurant Details
```bash
POST /api/restaurants/details
Content-Type: application/json

{
  "restaurantName": "Joe's Pizza",
  "borough": "MANHATTAN"        // Optional
}
```

Example:
```bash
curl -X POST http://localhost:8080/api/restaurants/details \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "PIZZA",
    "borough": "MANHATTAN"
  }'
```

### Get All Boroughs
```bash
GET /api/restaurants/boroughs
```

### Get All Cuisines
```bash
GET /api/restaurants/cuisines
```

## Testing the API

A test script is provided:

```bash
./scripts/test-api.sh
```

Or test individual endpoints:

```bash
# Health check
curl http://localhost:8080/api/restaurants/health

# Search for pizza in Manhattan
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{"borough": "MANHATTAN", "cuisine": "Pizza", "limit": 5}'

# Get boroughs
curl http://localhost:8080/api/restaurants/boroughs
```

## Configuration

Configuration is in `src/main/resources/application.properties`:

```properties
spring.application.name=nyc-restaurants-api
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=brooklyn
server.port=8080
```

## Project Structure

```
api/src/main/java/com/example/api/
├── ApiApplication.java      # Main application
├── config/                  # Configuration classes
│   ├── ApplicationConfiguration.java
│   ├── RateLimitingConfiguration.java
│   └── SecurityConfiguration.java
├── controller/              # REST endpoints
│   └── RestaurantController.java
├── dtos/                    # Request/response objects
│   ├── SearchRequest.java
│   ├── RestaurantDetailsRequest.java
│   └── RestaurantDTO.java
├── entities/                # JPA entities
│   └── RestaurantInspection.java
├── implementations/         # Service implementations
│   └── RestaurantInspectionServiceImpl.java
├── model/                   # Enums and models
│   ├── Borough.java
│   ├── Grade.java
│   ├── InspectionType.java
│   └── CriticalFlag.java
├── repository/              # Data access
│   └── RestaurantInspectionRepository.java
├── responses/               # Response DTOs
│   ├── SearchResponse.java
│   └── RestaurantDetailsResponse.java
├── service/                 # Business logic interfaces
│   └── IRestaurantInspectionService.java
├── util/                    # Utility classes
│   └── InputSanitizer.java
└── web/                     # Filters and error handlers
    ├── RequestLoggingFilter.java
    ├── ErrorResponse.java
    ├── GlobalRestExceptionHandler.java
    └── WebConfiguration.java
```

**For detailed package structure, see:** [Package Structure](PACKAGE_STRUCTURE.md)

## Technologies Used

- **Spring Boot 3.5.6**: Web framework
- **Spring Data JPA**: Data access layer
- **Spring Security**: Authentication & authorization
- **PostgreSQL**: Database
- **Hibernate**: ORM
- **Bucket4j**: Rate limiting
- **Lombok**: Reduce boilerplate code
- **Jackson**: JSON serialization
- **Gradle**: Build tool

## Additional Documentation

- **[Security Guide](SECURITY.md)** - Complete security features and configuration
- **[Security Quick Reference](SECURITY_QUICK_REFERENCE.md)** - Quick setup guide
- **[Package Structure](PACKAGE_STRUCTURE.md)** - Detailed code organization
- **[Additional Components](ADDITIONAL_COMPONENTS.md)** - Enums, models, and utilities

## Development

### Build
```bash
cd api
./gradlew clean build
```

### Run Tests
```bash
./gradlew test
```

### Run Application
```bash
./gradlew bootRun
```

### Check Dependencies
```bash
./gradlew dependencies
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
```bash
docker ps | grep postgres
```

2. Test database connection:
```bash
psql -h localhost -p 5432 -U postgres -d postgres
```

3. Check if data is loaded:
```bash
docker exec postgres psql -U postgres -d postgres -c "SELECT COUNT(*) FROM nyc_restaurant_inspections;"
```

### Port Already in Use

If port 8080 is already in use, change it in `application.properties`:
```properties
server.port=8081
```

### Build Issues

Clean and rebuild:
```bash
./gradlew clean build --refresh-dependencies
```

## CORS Configuration

The API is configured to accept requests from:
- http://localhost:3000 (Frontend)
- http://localhost:5173 (Vite dev server)
- Any origin (for development)

To modify CORS settings, edit `SecurityConfiguration.java` or see [Security Guide](SECURITY.md).

## License

MIT License - See project root for details.
