package com.example.api.responses;

import com.example.api.dtos.RestaurantDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDetailsResponse {
    private String restaurantName;
    private List<RestaurantDTO> inspections;
    private int inspectionCount;
    private String message;
}
