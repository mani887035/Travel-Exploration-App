package com.travelapp.wishlist;

import com.travelapp.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    @Query("SELECT w FROM Wishlist w JOIN FETCH w.destination WHERE w.user = :user ORDER BY w.addedAt DESC")
    List<Wishlist> findByUserOrderByAddedAtDesc(@Param("user") User user);

    Optional<Wishlist> findByUserIdAndDestinationId(Long userId, Long destinationId);

    boolean existsByUserIdAndDestinationId(Long userId, Long destinationId);

    void deleteByUserIdAndDestinationId(Long userId, Long destinationId);

    long countByUserId(Long userId);
}
