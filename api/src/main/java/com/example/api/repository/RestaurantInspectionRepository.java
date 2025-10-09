package com.example.api.repository;

import com.example.api.entities.RestaurantInspection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for RestaurantInspection entities.
 *
 * <p>Security Notes: - All queries use JPQL with parameterized queries (@Param) - Hibernate
 * automatically escapes parameters, preventing SQL injection - Input validation is performed at the
 * DTO level before reaching this layer
 */
@Repository
public interface RestaurantInspectionRepository
    extends JpaRepository<RestaurantInspection, RestaurantInspection.RestaurantInspectionId> {

  /**
   * Search restaurants by borough, cuisine, and minimum grade. All parameters are properly
   * parameterized to prevent SQL injection.
   *
   * @param borough optional borough filter
   * @param cuisine optional cuisine filter (partial match)
   * @param minGrade optional minimum grade filter
   * @return list of matching restaurants
   */
  @Query(
      "SELECT DISTINCT r FROM RestaurantInspection r WHERE (:borough IS NULL OR UPPER(r.boro) ="
          + " UPPER(:borough)) AND (:cuisine IS NULL OR UPPER(r.cuisineDescription) LIKE"
          + " UPPER(CONCAT('%', :cuisine, '%'))) AND (:minGrade IS NULL OR r.grade IS NULL OR"
          + " r.grade <= :minGrade) ORDER BY r.dba, r.inspectionDate DESC")
  List<RestaurantInspection> searchRestaurants(
      @Param("borough") String borough,
      @Param("cuisine") String cuisine,
      @Param("minGrade") String minGrade);

  @Query(
      "SELECT r FROM RestaurantInspection r WHERE "
          + "UPPER(r.dba) = UPPER(:restaurantName) AND "
          + "(:borough IS NULL OR UPPER(r.boro) = UPPER(:borough)) "
          + "ORDER BY r.inspectionDate DESC")
  List<RestaurantInspection> findByRestaurantNameAndBorough(
      @Param("restaurantName") String restaurantName, @Param("borough") String borough);

  @Query(
      "SELECT DISTINCT r.boro FROM RestaurantInspection r WHERE r.boro IS NOT NULL ORDER BY r.boro")
  List<String> findDistinctBoroughs();

  @Query(
      "SELECT DISTINCT r.cuisineDescription FROM RestaurantInspection r WHERE r.cuisineDescription"
          + " IS NOT NULL ORDER BY r.cuisineDescription")
  List<String> findDistinctCuisines();
}
