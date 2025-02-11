CREATE DATABASE calculator_app;

\c calculator_db;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT false
)

CREATE TABLE IF NOT EXISTS calculations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  expression TEXT NOT NULL,
  result TEXT NOT NULL, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
