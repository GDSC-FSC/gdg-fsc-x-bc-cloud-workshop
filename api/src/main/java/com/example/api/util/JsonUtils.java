package com.example.api.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/** Utility class for JSON serialization and deserialization using Jackson. */
public class JsonUtils {

  /** The ObjectMapper instance configured for JSON operations. */
  public static final ObjectMapper MAPPER =
      new ObjectMapper()
          .setSerializationInclusion(JsonInclude.Include.NON_NULL)
          .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
          .configure(SerializationFeature.INDENT_OUTPUT, true)
          .registerModule(new JavaTimeModule());

  /**
   * Deserializes a JSON string into an object of the specified class.
   *
   * @param json the JSON string to deserialize
   * @param clazz the class of the object to deserialize into
   * @param <T> the type of the object
   * @return the deserialized object
   * @throws RuntimeException if an error occurs during deserialization
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
   * @param object the object to serialize
   * @return the JSON string representation of the object
   * @throws RuntimeException if an error occurs during serialization
   */
  public static String writeValue(Object object) {
    try {
      return MAPPER.writeValueAsString(object);
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Unable to convert value to json", e);
    }
  }
}
