# Multi-stage build for Spring Boot API
# Stage 1: Build the application
FROM gradle:8.14-jdk21-alpine AS build

# Build argument for Gradle options
ARG GRADLE_OPTS="-Dorg.gradle.daemon=false"

WORKDIR /app

# Copy gradle wrapper and dependencies configuration
COPY gradle gradle
COPY gradlew .
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon --no-build-cache || true

# Copy source code
COPY src src

# Build the application with optimizations
RUN ./gradlew bootJar --no-daemon --no-build-cache -x test

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-alpine

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && \
    adduser -S spring -G spring && \
    chown -R spring:spring /app

# Copy the built JAR from build stage
COPY --from=build --chown=spring:spring /app/build/libs/*.jar app.jar

USER spring

# Expose the application port
EXPOSE 8080

# Environment variables for JVM tuning
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application with JVM options
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
