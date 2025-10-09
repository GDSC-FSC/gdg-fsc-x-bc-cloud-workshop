package com.example.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot application class for the NYC Restaurant Inspections API.
 * 
 * <p>This application provides RESTful API endpoints for querying NYC restaurant
 * health inspection data from the Department of Health and Mental Hygiene (DOHMH).
 * The data includes inspection results, violation details, grades, and geographic
 * information for food service establishments across all five NYC boroughs.
 * 
 * <p><b>Key Features:</b>
 * <ul>
 *   <li>Search restaurants by borough, cuisine, and grade</li>
 *   <li>Retrieve detailed inspection history for specific restaurants</li>
 *   <li>Get metadata (list of boroughs, cuisines)</li>
 *   <li>Comprehensive input validation and security measures</li>
 *   <li>Rate limiting and API key authentication (optional)</li>
 * </ul>
 * 
 * <p><b>Security Features:</b>
 * <ul>
 *   <li>SQL injection prevention through parameterized queries</li>
 *   <li>XSS protection through input validation and security headers</li>
 *   <li>Rate limiting to prevent abuse</li>
 *   <li>Request logging for security auditing</li>
 *   <li>Optional API key authentication</li>
 * </ul>
 * 
 * <p><b>API Base Path:</b> {@code /api/restaurants}
 * 
 * <p><b>Database:</b> PostgreSQL with NYC Open Data restaurant inspection records
 * 
 * @see com.example.api.controller.RestaurantController
 * @see com.example.api.config.SecurityConfiguration
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@SpringBootApplication
public class ApiApplication {

  /**
   * Main entry point for the Spring Boot application.
   * 
   * <p>This method bootstraps the Spring application context and starts
   * the embedded web server (Tomcat by default).
   * 
   * @param args command-line arguments passed to the application
   */
  public static void main(String[] args) {
    SpringApplication.run(ApiApplication.class, args);
  }
}
