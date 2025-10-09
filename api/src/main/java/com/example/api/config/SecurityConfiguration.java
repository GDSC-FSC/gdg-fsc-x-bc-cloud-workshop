package com.example.api.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/** Configuration class for Spring Security. */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

  /**
   * Bean definition for SecurityFilterChain.
   *
   * @param http the HttpSecurity to modify
   * @return a configured SecurityFilterChain
   * @throws Exception if an error occurs during configuration
   */
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

    return http.build();
  }

  /**
   * Bean definition for CorsConfigurationSource. Configured for development - tighten for
   * production!
   *
   * @return a CorsConfigurationSource for managing CORS configuration
   */
  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Development: Allow local development origins
    // Production: Replace with actual frontend domains
    configuration.setAllowedOriginPatterns(
        List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://yourdomain.com" // Replace with actual production domain
            ));

    // Only allow necessary HTTP methods
    configuration.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));

    // Specify allowed headers instead of wildcard
    configuration.setAllowedHeaders(
        List.of("Content-Type", "Accept", "Authorization", "X-Requested-With", "X-API-Key"));

    // Expose specific headers to client
    configuration.setExposedHeaders(List.of("X-Total-Count", "X-Page-Number"));

    // Don't allow credentials with wildcard origins
    configuration.setAllowCredentials(false);

    // Cache preflight response for 1 hour
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);

    return source;
  }
}
