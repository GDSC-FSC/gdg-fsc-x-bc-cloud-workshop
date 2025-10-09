package com.example.api.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    private String borough;
    private String cuisine;
    private String minGrade;
    
    @Min(1)
    @Max(1000)
    private Integer limit = 100;
}
