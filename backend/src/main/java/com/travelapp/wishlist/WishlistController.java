package com.travelapp.wishlist;

import com.travelapp.destination.Destination;
import com.travelapp.destination.DestinationRepository;
import com.travelapp.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
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
    public ResponseEntity<List<Destination>> getWishlist(
            @AuthenticationPrincipal Object principal) {
        // Guest mode: return empty list if not authenticated
        if (!(principal instanceof User user)) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<Destination> destinations = wishlistRepository
                .findByUserOrderByAddedAtDesc(user)
                .stream()
                .map(Wishlist::getDestination)
                .toList();
        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/check/{destinationId}")
    public ResponseEntity<?> checkSaved(
            @AuthenticationPrincipal Object principal,
            @PathVariable("destinationId") Long destinationId) {
        try {
            // Guest mode: always return not saved
            if (!(principal instanceof User user)) {
                return ResponseEntity.ok(Map.of("isSaved", false, "debug", "not a user instance " + (principal != null ? principal.getClass().getName() : "null")));
            }
            boolean saved = wishlistRepository.existsByUserIdAndDestinationId(user.getId(), destinationId);
            return ResponseEntity.ok(Map.of("isSaved", saved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage(), "stack", e.toString()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCount(@AuthenticationPrincipal Object principal) {
        // Guest mode: return count of 0
        if (!(principal instanceof User user)) {
            return ResponseEntity.ok(Map.of("count", 0));
        }
        long count = wishlistRepository.countByUserId(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/{destinationId}")
    public ResponseEntity<?> addToWishlist(
            @AuthenticationPrincipal Object principal,
            @PathVariable("destinationId") Long destinationId) {
        if (!(principal instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Please log in to save destinations"));
        }
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
    public ResponseEntity<?> removeFromWishlist(
            @AuthenticationPrincipal Object principal,
            @PathVariable("destinationId") Long destinationId) {
        if (!(principal instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Please log in to manage wishlist"));
        }
        wishlistRepository.deleteByUserIdAndDestinationId(user.getId(), destinationId);
        return ResponseEntity.noContent().build();
    }
}
