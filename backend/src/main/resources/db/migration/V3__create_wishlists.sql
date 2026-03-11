-- V3: Create wishlists table
CREATE TABLE wishlists (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT      NOT NULL,
    destination_id  BIGINT      NOT NULL,
    added_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user        FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_dest            UNIQUE (user_id, destination_id)
);

-- V3b: Create reviews table
CREATE TABLE reviews (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT        NOT NULL,
    destination_id BIGINT        NOT NULL,
    rating         TINYINT       NOT NULL,
    comment        TEXT,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user        FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT fk_review_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);
