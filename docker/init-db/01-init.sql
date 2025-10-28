-- Initialize YellowTip Reservations Database
-- This file is executed when the PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE yellowtip_reservations'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'yellowtip_reservations')\gexec

-- Connect to the database
\c yellowtip_reservations;

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';
