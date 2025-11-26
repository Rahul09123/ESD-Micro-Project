-- init_employeedb.sql
-- Creates the `employeedb` database and `employees` table used by the backend
-- Run with: mysql -u <user> -p < init_employeedb.sql

CREATE DATABASE IF NOT EXISTS employeedb;
USE employeedb;

CREATE TABLE IF NOT EXISTS employees (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  salary DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO employees (name, email, salary) VALUES
  ('Alice Example', 'alice@example.com', 75000.00),
  ('Bob Example', 'bob@example.com', 65000.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);
