# NYC Restaurants API

A Spring Boot REST API for querying NYC restaurant health inspection data from a PostgreSQL database.

## Prerequisites

- Java 21+
- PostgreSQL database running (see `scripts/docker.sh` to set up)
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
cd scripts
./docker.sh
```

This will:
1. Create a Docker network and volume
2. Start PostgreSQL container
3. Load NYC restaurant inspection data

## Building the API

```bash
cd api
./gradlew clean build
```

## Running the API

### Option 1: Using Gradle
```bash
cd api
./gradlew bootRun
```

### Option 2: Using the JAR
```bash
cd api
./gradlew build
java -jar build/libs/api-0.0.1-SNAPSHOT.jar
```

The API will start on `http://localhost:8080`

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
cd api
./test-api.sh
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
api/
├── src/
│   ├── main/
│   │   ├── java/com/example/api/
│   │   │   ├── ApiApplication.java           # Main application
│   │   │   ├── config/
│   │   │   │   ├── ApplicationConfiguration.java
│   │   │   │   └── SecurityConfiguration.java
│   │   │   ├── controller/
│   │   │   │   └── RestaurantController.java # REST endpoints
│   │   │   ├── dtos/
│   │   │   │   ├── SearchRequest.java
│   │   │   │   ├── RestaurantDetailsRequest.java
│   │   │   │   └── RestaurantDTO.java
│   │   │   ├── entities/
│   │   │   │   └── RestaurantInspection.java # JPA entity
│   │   │   ├── repository/
│   │   │   │   └── RestaurantInspectionRepository.java
│   │   │   ├── responses/
│   │   │   │   ├── SearchResponse.java
│   │   │   │   └── RestaurantDetailsResponse.java
│   │   │   └── service/
│   │   │       └── RestaurantInspectionService.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── build.gradle
└── test-api.sh                               # API test script
```

## Technologies Used

- **Spring Boot 3.5.6**: Web framework
- **Spring Data JPA**: Data access layer
- **PostgreSQL**: Database
- **Hibernate**: ORM
- **Lombok**: Reduce boilerplate code
- **Jackson**: JSON serialization
- **Spring Security**: CORS configuration

## CORS Configuration

The API is configured to accept requests from:
- http://localhost:8005
- http://localhost:5173
- Any origin (for development)

To modify CORS settings, edit `SecurityConfiguration.java`.

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

## License

MIT
