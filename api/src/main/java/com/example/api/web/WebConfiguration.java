package com.example.api.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration for the API. Configures content negotiation, formatters, and other
 * web-related settings.
 */
@Configuration
public class WebConfiguration implements WebMvcConfigurer {

  /** Configure content negotiation strategy. Default to JSON for all requests. */
  @Override
  public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
    configurer
        .defaultContentType(MediaType.APPLICATION_JSON)
        .favorParameter(false)
        .ignoreAcceptHeader(false)
        .useRegisteredExtensionsOnly(false);
  }
}
