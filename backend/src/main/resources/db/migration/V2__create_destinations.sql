-- V2: Create destinations table
CREATE TABLE destinations (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(200)    NOT NULL,
    state                VARCHAR(100)    NOT NULL,
    description          TEXT            NOT NULL,
    short_description    VARCHAR(500)    NOT NULL,
    image_url            VARCHAR(500)    NOT NULL DEFAULT '',
    season               VARCHAR(100)    NOT NULL,
    avg_cost_2d_1n_inr   INT             NOT NULL DEFAULT 0,
    travel_experience    VARCHAR(255)    NOT NULL DEFAULT '',
    local_food           TEXT,
    nearby_attractions   TEXT,
    latitude             DECIMAL(9,6),
    longitude            DECIMAL(9,6),
    popularity_score     FLOAT           NOT NULL DEFAULT 0.0,
    is_featured          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dest_state   ON destinations(state);
CREATE INDEX idx_dest_featured ON destinations(is_featured);
