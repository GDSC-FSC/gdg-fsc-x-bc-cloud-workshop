package com.example.api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "nyc_restaurant_inspections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(RestaurantInspection.RestaurantInspectionId.class)
public class RestaurantInspection {

    @Id
    @Column(name = "camis")
    private String camis;

    @Id
    @Column(name = "inspection_date")
    private LocalDateTime inspectionDate;

    @Id
    @Column(name = "violation_code")
    private String violationCode;

    @Column(name = "dba")
    private String dba;

    @Column(name = "boro")
    private String boro;

    @Column(name = "building")
    private String building;

    @Column(name = "street")
    private String street;

    @Column(name = "zipcode")
    private String zipcode;

    @Column(name = "phone")
    private String phone;

    @Column(name = "cuisine_description")
    private String cuisineDescription;

    @Column(name = "action")
    private String action;

    @Column(name = "violation_description", columnDefinition = "TEXT")
    private String violationDescription;

    @Column(name = "critical_flag")
    private String criticalFlag;

    @Column(name = "score")
    private BigDecimal score;

    @Column(name = "grade")
    private String grade;

    @Column(name = "grade_date")
    private LocalDateTime gradeDate;

    @Column(name = "record_date")
    private LocalDateTime recordDate;

    @Column(name = "inspection_type")
    private String inspectionType;

    @Column(name = "latitude")
    private BigDecimal latitude;

    @Column(name = "longitude")
    private BigDecimal longitude;

    @Column(name = "community_board")
    private String communityBoard;

    @Column(name = "council_district")
    private String councilDistrict;

    @Column(name = "census_tract")
    private String censusTract;

    @Column(name = "bin")
    private String bin;

    @Column(name = "bbl")
    private String bbl;

    @Column(name = "nta")
    private String nta;

    @Column(name = "location_point1", columnDefinition = "jsonb")
    private String locationPoint1;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RestaurantInspectionId implements Serializable {
        private String camis;
        private LocalDateTime inspectionDate;
        private String violationCode;
    }
}
