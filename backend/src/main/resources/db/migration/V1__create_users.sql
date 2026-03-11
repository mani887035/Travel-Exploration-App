-- V1: Create users table
CREATE TABLE users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(150)        NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    provider      VARCHAR(20)         NOT NULL DEFAULT 'LOCAL',
    provider_id   VARCHAR(255),
    avatar_url    VARCHAR(500),
    role          VARCHAR(20)         NOT NULL DEFAULT 'USER',
    created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
