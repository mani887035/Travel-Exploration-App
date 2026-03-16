package com.travelapp.destination;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "destinations")
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", nullable = false, length = 500)
    private String shortDescription;

    @Column(name = "image_url", length = 500)
    private String imageUrl = "";

    @Column(nullable = false, length = 100)
    private String season;

    @Column(name = "avg_cost_2d_1n_inr", nullable = false)
    private int avgCost2d1nInr;

    @Column(name = "travel_experience", length = 255)
    private String travelExperience;

    @Column(name = "local_food", columnDefinition = "TEXT")
    private String localFood;

    @Column(name = "nearby_attractions", columnDefinition = "TEXT")
    private String nearbyAttractions;

    @Column(precision = 9, scale = 6, columnDefinition = "DECIMAL(9,6)")
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6, columnDefinition = "DECIMAL(9,6)")
    private BigDecimal longitude;

    @Column(name = "popularity_score", nullable = false)
    private float popularityScore = 0.0f;

    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Constructors ──────────────────────────────
    public Destination() {
    }

    // ── Getters / Setters ─────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public int getAvgCost2d1nInr() {
        return avgCost2d1nInr;
    }

    public void setAvgCost2d1nInr(int avgCost2d1nInr) {
        this.avgCost2d1nInr = avgCost2d1nInr;
    }

    public String getTravelExperience() {
        return travelExperience;
    }

    public void setTravelExperience(String travelExperience) {
        this.travelExperience = travelExperience;
    }

    public String getLocalFood() {
        return localFood;
    }

    public void setLocalFood(String localFood) {
        this.localFood = localFood;
    }

    public String getNearbyAttractions() {
        return nearbyAttractions;
    }

    public void setNearbyAttractions(String nearbyAttractions) {
        this.nearbyAttractions = nearbyAttractions;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public float getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(float popularityScore) {
        this.popularityScore = popularityScore;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
