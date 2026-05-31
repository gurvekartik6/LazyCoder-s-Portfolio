-- ============================================================
-- LazyCoders Portfolio Database Schema
-- Run this file to set up the database from scratch
-- ============================================================

-- Create the database (run this separately if needed)
-- CREATE DATABASE lazycoders_db;

-- Connect to the database before running the rest
-- \c lazycoders_db

-- ============================================================
-- TABLE: messages
-- Stores contact form submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    email       VARCHAR(255)  NOT NULL,
    message     TEXT          NOT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on email and date
CREATE INDEX IF NOT EXISTS idx_messages_email      ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================
-- TABLE: visitors
-- Tracks unique daily visitors for the visitor counter
-- ============================================================
CREATE TABLE IF NOT EXISTS visitors (
    id          SERIAL PRIMARY KEY,
    ip_address  VARCHAR(100),
    page        VARCHAR(255) DEFAULT '/',
    visited_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at DESC);

-- ============================================================
-- TABLE: admin_sessions (optional: handled by express-session)
-- ============================================================

-- Sample data for testing (optional)
-- INSERT INTO messages (name, email, message) VALUES
--   ('Test User', 'test@example.com', 'Hello, this is a test message!');

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'Database setup complete!' AS status;
SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public';
