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

CREATE TABLE IF NOT EXISTS employee_salaries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  month VARCHAR(7) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_on DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_month (employee_id, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO employee_salaries (employee_id, month, amount, paid_on) VALUES
  (1, '2025-11', 5000.00, '2025-11-25'),
  (1, '2025-10', 5000.00, '2025-10-25'),
  (1, '2025-09', 4800.00, '2025-09-25'),
  (1, '2025-08', 4800.00, '2025-08-25'),
  (1, '2025-07', 4700.00, '2025-07-25'),
  (1, '2025-06', 4700.00, '2025-06-25'),
  (2, '2025-11', 4500.00, '2025-11-25'),
  (2, '2025-10', 4500.00, '2025-10-25'),
  (2, '2025-09', 4400.00, '2025-09-25')
ON DUPLICATE KEY UPDATE amount=VALUES(amount), paid_on=VALUES(paid_on);
