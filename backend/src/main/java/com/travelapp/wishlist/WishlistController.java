package com.travelapp.wishlist;

import com.travelapp.destination.Destination;
import com.travelapp.destination.DestinationRepository;
import com.travelapp.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final DestinationRepository destinationRepository;

    public WishlistController(WishlistRepository wishlistRepository,
            DestinationRepository destinationRepository) {
        this.wishlistRepository = wishlistRepository;
        this.destinationRepository = destinationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Destination>> getWishlist(@AuthenticationPrincipal User user) {
        List<Destination> destinations = wishlistRepository
                .findByUserOrderByAddedAtDesc(user)
                .stream()
                .map(Wishlist::getDestination)
                .toList();
        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/check/{destinationId}")
    public ResponseEntity<?> checkSaved(@AuthenticationPrincipal User user,
            @PathVariable Long destinationId) {
        boolean saved = wishlistRepository.existsByUserIdAndDestinationId(user.getId(), destinationId);
        return ResponseEntity.ok(Map.of("isSaved", saved));
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCount(@AuthenticationPrincipal User user) {
        long count = wishlistRepository.countByUserId(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/{destinationId}")
    public ResponseEntity<?> addToWishlist(@AuthenticationPrincipal User user,
            @PathVariable Long destinationId) {
        if (wishlistRepository.existsByUserIdAndDestinationId(user.getId(), destinationId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Already in wishlist"));
        }
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .destination(destination)
                .build();
        wishlistRepository.save(wishlist);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Added to wishlist"));
    }

    @DeleteMapping("/{destinationId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@AuthenticationPrincipal User user,
            @PathVariable Long destinationId) {
        wishlistRepository.deleteByUserIdAndDestinationId(user.getId(), destinationId);
        return ResponseEntity.noContent().build();
    }
}
