package com.example.api.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Utility class for JSON serialization and deserialization using Jackson.
 * 
 * <p>This class provides a centrally configured Jackson {@link ObjectMapper} and
 * convenient static methods for JSON operations. The ObjectMapper is configured
 * with sensible defaults for API development, including proper date/time handling
 * and pretty-printing.
 * 
 * <p><b>Configuration Features:</b>
 * <ul>
 *   <li>Java 8 date/time support (LocalDateTime, LocalDate, etc.)</li>
 *   <li>ISO-8601 date format instead of timestamps</li>
 *   <li>Pretty-printed JSON output for better readability</li>
 *   <li>Null values are excluded from serialized JSON</li>
 * </ul>
 * 
 * <p><b>Usage Example:</b>
 * <pre>
 * // Serialization
 * String json = JsonUtils.writeValue(myObject);
 * 
 * // Deserialization
 * MyClass obj = JsonUtils.readObject(json, MyClass.class);
 * </pre>
 * 
 * @see ObjectMapper
 * @see com.example.api.config.ApplicationConfiguration
 * @author NYC Restaurant Inspections API Team
 * @version 1.0
 * @since 1.0
 */
public class JsonUtils {

  /**
   * Centrally configured ObjectMapper instance for all JSON operations.
   * 
   * <p>This ObjectMapper is configured with:
   * <ul>
   *   <li>{@code NON_NULL} serialization - null fields are omitted from output</li>
   *   <li>{@code WRITE_DATES_AS_TIMESTAMPS=false} - dates as ISO-8601 strings</li>
   *   <li>{@code INDENT_OUTPUT=true} - pretty-printed JSON</li>
   *   <li>{@code JavaTimeModule} - support for Java 8 date/time types</li>
   * </ul>
   * 
   * <p>This instance is thread-safe and can be shared across the application.
   */
  public static final ObjectMapper MAPPER =
      new ObjectMapper()
          .setSerializationInclusion(JsonInclude.Include.NON_NULL)
          .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
          .configure(SerializationFeature.INDENT_OUTPUT, true)
          .registerModule(new JavaTimeModule());

  /**
   * Deserializes a JSON string into an object of the specified class.
   * 
   * <p>This method is a convenience wrapper around Jackson's {@code readValue()}
   * that converts checked exceptions into runtime exceptions for cleaner code.
   *
   * @param <T> the type of the object to deserialize
   * @param json the JSON string to deserialize
   * @param clazz the class of the object to deserialize into
   * @return the deserialized object
   * @throws RuntimeException if JSON parsing fails (wraps JsonProcessingException)
   */
  public static <T> T readObject(String json, Class<T> clazz) {
    try {
      return MAPPER.readValue(json, clazz);
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Unable to convert json value", e);
    }
  }

  /**
   * Serializes an object into a JSON string.
   * 
   * <p>This method is a convenience wrapper around Jackson's {@code writeValueAsString()}
   * that converts checked exceptions into runtime exceptions for cleaner code.
   * The resulting JSON is pretty-printed for better readability.
   *
   * @param object the object to serialize
   * @return the JSON string representation of the object
   * @throws RuntimeException if serialization fails (wraps JsonProcessingException)
   */
  public static String writeValue(Object object) {
    try {
      return MAPPER.writeValueAsString(object);
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Unable to convert value to json", e);
    }
  }
}
