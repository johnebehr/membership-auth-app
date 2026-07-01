-- local6086.ref_local definition
-- - Store the members associated local number plus additional information
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
-- - Store the members core information
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