package com.example.api.repository;

import com.example.api.entities.RestaurantInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantInspectionRepository extends JpaRepository<RestaurantInspection, RestaurantInspection.RestaurantInspectionId> {

    @Query("SELECT DISTINCT r FROM RestaurantInspection r WHERE " +
            "(:borough IS NULL OR UPPER(r.boro) = UPPER(:borough)) AND " +
            "(:cuisine IS NULL OR UPPER(r.cuisineDescription) LIKE UPPER(CONCAT('%', :cuisine, '%'))) AND " +
            "(:minGrade IS NULL OR r.grade IS NULL OR r.grade <= :minGrade) " +
            "ORDER BY r.dba, r.inspectionDate DESC")
    List<RestaurantInspection> searchRestaurants(
            @Param("borough") String borough,
            @Param("cuisine") String cuisine,
            @Param("minGrade") String minGrade
    );

    @Query("SELECT r FROM RestaurantInspection r WHERE " +
            "UPPER(r.dba) = UPPER(:restaurantName) AND " +
            "(:borough IS NULL OR UPPER(r.boro) = UPPER(:borough)) " +
            "ORDER BY r.inspectionDate DESC")
    List<RestaurantInspection> findByRestaurantNameAndBorough(
            @Param("restaurantName") String restaurantName,
            @Param("borough") String borough
    );

    @Query("SELECT DISTINCT r.boro FROM RestaurantInspection r WHERE r.boro IS NOT NULL ORDER BY r.boro")
    List<String> findDistinctBoroughs();

    @Query("SELECT DISTINCT r.cuisineDescription FROM RestaurantInspection r WHERE r.cuisineDescription IS NOT NULL ORDER BY r.cuisineDescription")
    List<String> findDistinctCuisines();
}
