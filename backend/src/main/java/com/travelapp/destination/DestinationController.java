package com.travelapp.destination;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    private final DestinationRepository destinationRepository;

    public DestinationController(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(name = "season", required = false) String season,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "experience", required = false) String experience,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size) {
        Page<Destination> result = destinationRepository.findByFilters(
                season, state, experience,
                PageRequest.of(page, size, Sort.by("popularityScore").descending()));
        return ResponseEntity.ok(Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "currentPage", result.getNumber()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") Long id) {
        return destinationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Destination>> getFeatured() {
        return ResponseEntity.ok(
                destinationRepository.findByIsFeaturedTrueOrderByPopularityScoreDesc());
    }

    @GetMapping("/states")
    public ResponseEntity<List<String>> getStates() {
        return ResponseEntity.ok(destinationRepository.findAllStates());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Destination>> search(@RequestParam("q") String q) {
        if (q == null || q.isBlank() || q.length() < 2) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(destinationRepository.search(q.trim()));
    }

    @PostMapping("/list")
    public ResponseEntity<List<Destination>> getListByIds(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(destinationRepository.findAllById(ids));
    }
}
