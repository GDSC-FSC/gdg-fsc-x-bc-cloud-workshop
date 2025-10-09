package com.example.api.controller;

import com.example.api.dtos.RestaurantDetailsRequest;
import com.example.api.dtos.SearchRequest;
import com.example.api.responses.RestaurantDetailsResponse;
import com.example.api.responses.SearchResponse;
import com.example.api.service.IRestaurantInspectionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RestaurantController {

  private final IRestaurantInspectionService service;

  @PostMapping("/query")
  public ResponseEntity<SearchResponse> searchRestaurants(
      @Valid @RequestBody SearchRequest request) {
    log.info("Received search request: {}", request);
    // Additional validation and sanitization
    request.validate();
    SearchResponse response = service.searchRestaurants(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/details")
  public ResponseEntity<RestaurantDetailsResponse> getRestaurantDetails(
      @Valid @RequestBody RestaurantDetailsRequest request) {
    log.info("Received details request: {}", request);
    // Additional validation and sanitization
    request.validate();
    RestaurantDetailsResponse response = service.getRestaurantDetails(request);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/boroughs")
  public ResponseEntity<List<String>> getBoroughs() {
    log.info("Fetching all boroughs");
    List<String> boroughs = service.getDistinctBoroughs();
    return ResponseEntity.ok(boroughs);
  }

  @GetMapping("/cuisines")
  public ResponseEntity<List<String>> getCuisines() {
    log.info("Fetching all cuisines");
    List<String> cuisines = service.getDistinctCuisines();
    return ResponseEntity.ok(cuisines);
  }

  @GetMapping("/health")
  public ResponseEntity<String> health() {
    return ResponseEntity.ok("NYC Restaurants API is running");
  }
}
