-- 20260701_member_tables.sql
-- Migration for the member tables and the simplified auth model.

-- local6086.users definition
-- Stores authentication credentials and the single admin flag used by the app.
CREATE TABLE IF NOT EXISTS users (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `name` VARCHAR(255) GENERATED ALWAYS AS (concat_ws(_utf8mb4' ', `first_name`, `last_name`)) STORED,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `auto_logout_minutes` INT NOT NULL DEFAULT 10,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS `is_admin` TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS `auto_logout_minutes` INT NOT NULL DEFAULT 10;

-- local6086.ref_local definition
-- Store the members associated local number plus additional information.
CREATE TABLE IF NOT EXISTS ref_local (
  `local_id` INT AUTO_INCREMENT PRIMARY KEY,
  `local_number` CHAR(4) NOT NULL UNIQUE,
  `local_name` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  `created_by` INT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(),
  `updated_by` INT NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.members definition
-- Store the members core information.
CREATE TABLE IF NOT EXISTS members (
  `central_id` INT NOT NULL AUTO_INCREMENT,
  `local_number` CHAR(4) NOT NULL,
  `clock_id` CHAR(32) NOT NULL,
  `first_name` VARCHAR(50) DEFAULT NULL,
  `last_name` VARCHAR(50) DEFAULT NULL,
  `name_suffix` VARCHAR(10) DEFAULT NULL,
  `full_name` VARCHAR(255) GENERATED ALWAYS AS (concat_ws(_utf8mb4' ',`first_name`,`last_name`, `name_suffix`)) STORED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  `created_by` INT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(),
  `updated_by` INT NOT NULL,
  PRIMARY KEY (`central_id`),
  UNIQUE KEY `uk_clock_id` (`clock_id`),
  UNIQUE KEY `uq_local_and_clock` (`local_number`, `clock_id`),
  CONSTRAINT `fk_members_local` FOREIGN KEY (`local_number`) REFERENCES `ref_local` (`local_number`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;