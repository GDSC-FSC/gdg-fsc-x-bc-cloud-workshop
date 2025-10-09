package com.example.api.config;

import com.example.api.util.JsonUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/** Configuration class for application-wide beans and settings. */
@Configuration
public class ApplicationConfiguration {
  /**
   * Bean definition for ObjectMapper.
   *
   * @return an ObjectMapper configured with custom settings
   */
  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    return JsonUtils.MAPPER;
  }
}
