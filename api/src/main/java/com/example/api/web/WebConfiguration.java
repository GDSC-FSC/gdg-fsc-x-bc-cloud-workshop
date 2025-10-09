package com.example.api.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC configuration for the API.
 * 
 * <p>This configuration class customizes Spring MVC behavior, particularly around
 * content negotiation. It ensures that the API consistently uses JSON as the primary
 * content type for both requests and responses.
 * 
 * <p><b>Configured Behavior:</b>
 * <ul>
 *   <li>Default content type: application/json</li>
 *   <li>Respects Accept headers from clients</li>
 *   <li>No parameter-based content negotiation (e.g., ?format=json)</li>
 *   <li>Flexible content type matching</li>
 * </ul>
 * 
 * <p>This configuration ensures a RESTful API design where JSON is the standard
 * format, while still allowing clients to specify alternative formats via the
 * Accept header if needed.
 * 
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class WebConfiguration implements WebMvcConfigurer {

  /**
   * Configures content negotiation strategy for the API.
   * 
   * <p>This method sets up how Spring MVC determines which content type to use
   * for responses. The configuration prioritizes JSON as the default format while
   * still respecting client preferences expressed through Accept headers.
   * 
   * <p><b>Configuration Details:</b>
   * <ul>
   *   <li><b>defaultContentType:</b> JSON - used when client doesn't specify Accept header</li>
   *   <li><b>favorParameter:</b> false - disables URL parameter-based negotiation (e.g., ?format=json)</li>
   *   <li><b>ignoreAcceptHeader:</b> false - respects client's Accept header</li>
   *   <li><b>useRegisteredExtensionsOnly:</b> false - allows flexible content type matching</li>
   * </ul>
   *
   * @param configurer the content negotiation configurer
   */
  @Override
  public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
    configurer
        .defaultContentType(MediaType.APPLICATION_JSON)
        .favorParameter(false)
        .ignoreAcceptHeader(false)
        .useRegisteredExtensionsOnly(false);
  }
}
