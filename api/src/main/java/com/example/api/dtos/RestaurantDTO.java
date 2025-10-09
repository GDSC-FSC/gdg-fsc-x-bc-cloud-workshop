package com.example.api.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDTO {
  private String camis;
  private String dba;
  private String boro;
  private String building;
  private String street;
  private String zipcode;
  private String phone;
  private String cuisineDescription;
  private LocalDateTime inspectionDate;
  private String action;
  private String violationCode;
  private String violationDescription;
  private String criticalFlag;
  private BigDecimal score;
  private String grade;
  private LocalDateTime gradeDate;
  private LocalDateTime recordDate;
  private String inspectionType;
  private BigDecimal latitude;
  private BigDecimal longitude;
  private String communityBoard;
  private String councilDistrict;
}
