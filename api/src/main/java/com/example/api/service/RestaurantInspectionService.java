package com.example.api.service;

import com.example.api.dtos.RestaurantDTO;
import com.example.api.dtos.RestaurantDetailsRequest;
import com.example.api.dtos.SearchRequest;
import com.example.api.entities.RestaurantInspection;
import com.example.api.repository.RestaurantInspectionRepository;
import com.example.api.responses.RestaurantDetailsResponse;
import com.example.api.responses.SearchResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RestaurantInspectionService {

  private final RestaurantInspectionRepository repository;

  public SearchResponse searchRestaurants(SearchRequest request) {
    log.info(
        "Searching restaurants with borough: {}, cuisine: {}, minGrade: {}",
        request.getBorough(),
        request.getCuisine(),
        request.getMinGrade());

    List<RestaurantInspection> results =
        repository.searchRestaurants(
            request.getBorough(), request.getCuisine(), request.getMinGrade());

    // Apply limit
    int limit = request.getLimit() != null ? request.getLimit() : 100;
    List<RestaurantDTO> limitedResults =
        results.stream().limit(limit).map(this::mapToDTO).collect(Collectors.toList());

    return SearchResponse.builder()
        .restaurants(limitedResults)
        .count(limitedResults.size())
        .message(String.format("Found %d restaurants", limitedResults.size()))
        .build();
  }

  public RestaurantDetailsResponse getRestaurantDetails(RestaurantDetailsRequest request) {
    log.info(
        "Getting details for restaurant: {} in borough: {}",
        request.getRestaurantName(),
        request.getBorough());

    List<RestaurantInspection> inspections =
        repository.findByRestaurantNameAndBorough(
            request.getRestaurantName(), request.getBorough());

    List<RestaurantDTO> inspectionDTOs =
        inspections.stream().map(this::mapToDTO).collect(Collectors.toList());

    return RestaurantDetailsResponse.builder()
        .restaurantName(request.getRestaurantName())
        .inspections(inspectionDTOs)
        .inspectionCount(inspectionDTOs.size())
        .message(
            inspectionDTOs.isEmpty()
                ? "No inspections found for this restaurant"
                : String.format("Found %d inspections", inspectionDTOs.size()))
        .build();
  }

  public List<String> getDistinctBoroughs() {
    return repository.findDistinctBoroughs();
  }

  public List<String> getDistinctCuisines() {
    return repository.findDistinctCuisines();
  }

  private RestaurantDTO mapToDTO(RestaurantInspection entity) {
    return RestaurantDTO.builder()
        .camis(entity.getCamis())
        .dba(entity.getDba())
        .boro(entity.getBoro())
        .building(entity.getBuilding())
        .street(entity.getStreet())
        .zipcode(entity.getZipcode())
        .phone(entity.getPhone())
        .cuisineDescription(entity.getCuisineDescription())
        .inspectionDate(entity.getInspectionDate())
        .action(entity.getAction())
        .violationCode(entity.getViolationCode())
        .violationDescription(entity.getViolationDescription())
        .criticalFlag(entity.getCriticalFlag())
        .score(entity.getScore())
        .grade(entity.getGrade())
        .gradeDate(entity.getGradeDate())
        .recordDate(entity.getRecordDate())
        .inspectionType(entity.getInspectionType())
        .latitude(entity.getLatitude())
        .longitude(entity.getLongitude())
        .communityBoard(entity.getCommunityBoard())
        .councilDistrict(entity.getCouncilDistrict())
        .build();
  }
}
