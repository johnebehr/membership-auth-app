-- local6086.user_groups definition
CREATE TABLE IF NOT EXISTS user_groups (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- local6086.users definition
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `name` varchar(255) GENERATED ALWAYS AS (concat_ws(_utf8mb4' ',`first_name`,`last_name`)) STORED,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.user_group_memberships definition
CREATE TABLE IF NOT EXISTS `user_group_memberships` (
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `group_id`),
  CONSTRAINT `fk_membership_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membership_group` FOREIGN KEY (`group_id`) REFERENCES `user_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Instert starting groups into local6086.user_groups
INSERT INTO user_groups (slug, name, description)
VALUES
  ('admin', 'Admin', 'Can manage users and membership workflows'),
  ('membership', 'Membership', 'Can manage memberships but cannot create new users'),
  ('organizer', 'Organizer', 'Lookup-only access'), 
  ('leader', 'Leadership', 'Can view membership reports and look up users'),
  ('acct', 'Accounting', 'Can manage financial activities')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- local6086.members definition
CREATE TABLE IF NOT EXISTS members (
	`central_id` int NOT NULL AUTO_INCREMENT, 
	`local_id` char(32) NOT NULL, 
	`first_name` varchar(50) DEFAULT NULL, 
	`last_name` varchar(50) DEFAULT NULL, 
	`name_suffix` varchar(10) DEFAULT NULL, 
	`full_name` GENERATED ALWAYS AS (concat_ws(_utf8mb4' ',`first_name`,`last_name`, `name_suffix`)) STORED,
	UNIQUE KEY `uk_local_id` (`local_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.members_aliases
-- Needs more work
CREATE TABLE IF NOT EXISTS members_aliases (
	`central_id` int DEFAULT NULL, 
	`alias_id` int NOT NULL AUTO_INCREMENT	
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.ref_agencies
CREATE TABLE IF NOT EXISTS ref_agencies (
	`agency_id` int NOT NULL AUTO_INCREMENT, 
	`state_code` char(2) DEFAULT NULL, 
	`agency_code` varchar(10) NOT NULL, 
	`agency_name` varchar(100) NOT NULL, 
	`agency_abbreviation` varchar(10) DEFAULT NULL,
	`full_agy_id` GENERATED ALWAYS AS (concat(`state_code`, '-', `agency_code`)) STORED,
	PRIMARY KEY(`agency_id`), 
	UNIQUE KEY `uk_full_agy_id` (full_agy_id)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


