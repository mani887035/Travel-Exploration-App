package com.travelapp.wishlist;

import com.travelapp.destination.Destination;
import com.travelapp.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlists", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "destination_id" }))
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt = LocalDateTime.now();

    // ── Constructors ──────────────────────────────
    public Wishlist() {
    }

    // ── Getters / Setters ─────────────────────────
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Destination getDestination() {
        return destination;
    }

    public void setDestination(Destination destination) {
        this.destination = destination;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    // ── Builder ───────────────────────────────────
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Wishlist w = new Wishlist();

        public Builder user(User v) {
            w.user = v;
            return this;
        }

        public Builder destination(Destination v) {
            w.destination = v;
            return this;
        }

        public Wishlist build() {
            return w;
        }
    }
}
