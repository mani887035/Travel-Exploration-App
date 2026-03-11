package com.travelapp.destination;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByIsFeaturedTrueOrderByPopularityScoreDesc();

    List<Destination> findByState(String state);

    @Query("SELECT DISTINCT d.state FROM Destination d ORDER BY d.state")
    List<String> findAllStates();

    @Query("SELECT d FROM Destination d WHERE " +
            "(:season IS NULL OR d.season LIKE %:season%) AND " +
            "(:state IS NULL OR d.state = :state) AND " +
            "(:experience IS NULL OR d.travelExperience LIKE %:experience%)")
    Page<Destination> findByFilters(
            @Param("season") String season,
            @Param("state") String state,
            @Param("experience") String experience,
            Pageable pageable);

    @Query("SELECT d FROM Destination d WHERE " +
            "LOWER(d.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(d.state) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(d.travelExperience) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Destination> search(@Param("q") String q);
}
