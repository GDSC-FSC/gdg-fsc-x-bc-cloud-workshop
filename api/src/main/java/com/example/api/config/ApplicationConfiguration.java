package com.example.api.config;

import com.example.api.util.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Spring configuration class for application-wide beans and settings.
 * 
 * <p>This configuration class defines core beans that are used throughout
 * the application, particularly for JSON processing and serialization/deserialization.
 * 
 * <p><b>Configured Features:</b>
 * <ul>
 *   <li>Jackson ObjectMapper with custom settings for JSON processing</li>
 *   <li>Java 8 date/time support (LocalDateTime, etc.)</li>
 *   <li>Pretty-printing for better readability</li>
 *   <li>Non-null value serialization</li>
 * </ul>
 * 
 * @see JsonUtils
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class ApplicationConfiguration {
  /**
   * Provides a configured Jackson ObjectMapper bean for JSON processing.
   * 
   * <p>This ObjectMapper is configured with:
   * <ul>
   *   <li>JavaTimeModule for Java 8 date/time support</li>
   *   <li>Pretty-printing enabled for readable output</li>
   *   <li>ISO-8601 date format (not timestamps)</li>
   *   <li>Null value exclusion from output</li>
   * </ul>
   * 
   * <p>The {@code @Primary} annotation ensures this ObjectMapper is used by
   * Spring MVC for all JSON serialization/deserialization operations.
   *
   * @return a configured ObjectMapper instance
   * @see JsonUtils#MAPPER
   */
  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    return JsonUtils.MAPPER;
  }
}
