# NYC Restaurants API

Spring Boot REST API for querying NYC restaurant health inspection data.

## Quick Start

```bash
# Build
./gradlew clean build

# Run
java -jar build/libs/api-0.0.1-SNAPSHOT.jar

# Test
./test-api.sh
```

API runs on `http://localhost:8080`

## API Endpoints

### Restaurant Queries
- `POST /api/restaurants/query` - Search restaurants
- `POST /api/restaurants/details` - Get restaurant details
- `GET /api/restaurants/boroughs` - List all boroughs
- `GET /api/restaurants/cuisines` - List all cuisines
- `GET /api/restaurants/health` - Health check

### Example Request

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

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=brooklyn

# Server
server.port=8080

# Security (optional)
security.api-key.enabled=false
security.api-key.keys=your-keys-here
```

## Security Features

- ✅ Input validation and sanitization
- ✅ Rate limiting (100 req/min per IP)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ CORS configuration
- ✅ Optional API key authentication

## Documentation

**Full documentation available in `/docs/api/`:**

- **[Complete API Guide](../docs/api/README.md)** - Full documentation
- **[Security Guide](../docs/api/SECURITY.md)** - Security features and configuration
- **[Security Quick Reference](../docs/api/SECURITY_QUICK_REFERENCE.md)** - Quick security setup
- **[Package Structure](../docs/api/PACKAGE_STRUCTURE.md)** - Code organization
- **[Additional Components](../docs/api/ADDITIONAL_COMPONENTS.md)** - Enums and utilities

## Project Structure

```
api/src/main/java/com/example/api/
├── config/              # Configuration classes
├── controller/          # REST endpoints
├── dtos/                # Request/response objects
├── entities/            # JPA entities
├── implementations/     # Service implementations
├── model/               # Enums and models
├── repository/          # Data access
├── service/             # Business logic interfaces
├── util/                # Utility classes
└── web/                 # Filters and error handlers
```

## Tech Stack

- Spring Boot 3.5.6
- Spring Data JPA
- Spring Security
- PostgreSQL
- Hibernate
- Bucket4j (rate limiting)
- Lombok
- Gradle

## Development

### Build

```bash
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

Ensure PostgreSQL is running:
```bash
docker ps | grep postgres
```

Test connection:
```bash
psql -h localhost -p 5432 -U postgres -d postgres
```

### Port Already in Use

Change port in `application.properties`:
```properties
server.port=8081
```

### Build Errors

Clean and rebuild:
```bash
./gradlew clean build --refresh-dependencies
```

## License

MIT License - See project root for details.
