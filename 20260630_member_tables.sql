-- local6086.members definition
-- - Store the members core information
CREATE TABLE IF NOT EXISTS members (
	`central_id` int NOT NULL AUTO_INCREMENT, 
	`local_id` char(32) NOT NULL, 
	`first_name` varchar(50) DEFAULT NULL, 
	`last_name` varchar(50) DEFAULT NULL, 
	`name_suffix` varchar(10) DEFAULT NULL, 
	`full_name` GENERATED ALWAYS AS (concat_ws(_utf8mb4' ',`first_name`,`last_name`, `name_suffix`)), 
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
	UNIQUE KEY `uk_local_id` (`local_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.members_aliases definition
-- - Store other names that the memeber may be known by or name at agency that is different from sign-up name
CREATE TABLE IF NOT EXISTS members_aliases (
	`central_id` int DEFAULT NULL, 
	`alias_id` int NOT NULL AUTO_INCREMENT,  
    `alias_name` varchar(200) NOT NULL, 
    `alias_type` int NOT NULL, 
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
    PRIMARY KEY (`alias_id`), 
    KEY `key_central_id` (`central_id`), 
    CONSTRAINT `fk_central_id` FOREIGN KEY (`central_id`) REFERENCES members_central (`central_id`) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.member_ssno definition 
-- - Store sensitive Social Security Number for member in secure manner
CREATE TABLE IF NOT EXISTS member_ssno (
    `ssno_id` int NOT NULL AUTO_INCREMENT, 
    `central_id` int DEFAULT NULL, 
    `ssno_encrypted` varbinary(255) NOT NULL, 
    `ssno_last_four` char(4) NOT NULL, 
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
    PRIMARY KEY(`ssno_id`), 
    UNIQUE KEY `uk_ssno_encrypted` (`ssno_encrypted`), 
    CONSTRAINT `fk_central_id` FOREIGN KEY (`central_id`) REFERENCES members_central (`central_id`) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.member_agencies definition 
-- - Associated agency history for member
CREATE TABLE IF NOT EXISTS member_agencies (
    `member_agency_id` int NOT NULL AUTO_INCREMENT, 
    `central_id` int DEFAULT NULL, 
    `agency_id` int NOT NULL, 
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
    PRIMARY KEY (`member_agency_id`), 
    KEY `key_central_id` (`central_id`), 
    CONSTRAINT `fk_agency_id` FOREIGN KEY (`agency_id`) REFERENCES ref_agencies (`agency_id`) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 

-- local6086.member_locations definition
-- - Associated location history for member
CREATE TABLE IF NOT EXISTS member_locations (
    `location_id` int NOT NULL AUTO_INCREMENT, 
    `state_code_id` int DEFAULT NOT NULL, 
    `location_name` varchar(75) NOT NULL, 
    `location_address` varchar(100) NOT NULL, 
    `location_city` varchar(75) NOT NULL,     
    `location_state` char(2) NOT NULL, 
    `location_zip` char(5) NOT NULL, 
    `location_zip_plus_four` char(4) NOT NULL, 
    `organizer_id` int NOT NULL, 
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
    PRIMARY KEY (`location_id`), 
    KEY `key_location_name` (`location_name`), 
    KEY `key_location_address` (`location_address`), 
    KEY `key_city_name` (`city_name`), 
    KEY `key_location_zip` (`location_zip`), 
    CONATRAINT `fk_organizer_id` FOREIGN KEY (`organizer_id`) REFERENCES ref_organizers (`organizer_id`) ON DELETE CASCADE ON UPDATE CASCADE
    CONATRAINT `fk_state_code_id` FOREIGN KEY (`state_code_id`) REFERENCES ref_operating_states (`state_code_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 

-- local6086.ref_organizers definition 
-- - Organizer id for location assignment and etc.
CREATE TABLE IF NOT EXISTS ref_staff (
    `organizer_id` int NOT NULL AUTO_INCREMENT, 
    `staff_first_name` varchar(50) NOT NULL, 
    `staff_last_name` varchar(50) NOT NULL, 
    `staff_group` enum('Support Staff', 'Organizing Staff')
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
    PRIMARY KEY (`state_code_id`)
    UNIQUE KEY `uk_state_code` (`state_code`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 

-- local6086.ref_operating_states 
-- - State code code prefixes for agencies and locations
CREATE TABLE IF NOT EXISTS ref_operating_states (
    `state_code_id` int NOT NULL AUTO_INCREMENT, 
    `state_code` char(2) DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
    PRIMARY KEY (`state_code_id`)
    UNIQUE KEY `uk_state_code` (`state_code`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 

-- local6086.ref_agencies definition
-- - Reference table for state agency info
CREATE TABLE IF NOT EXISTS ref_agencies (
	`agency_id` int NOT NULL AUTO_INCREMENT, 
	`state_code` char(2) DEFAULT NULL, 
	`agency_code` varchar(10) NOT NULL, 
	`agency_name` varchar(100) NOT NULL, 
	`agency_abbreviation` varchar(10) DEFAULT NULL,
	`full_agy_id` GENERATED ALWAYS AS (concat(`state_code`, '-', `agency_code`)), 
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
	PRIMARY KEY (`agency_id`), 
	UNIQUE KEY `uk_full_agy_id` (full_agy_id)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- local6086.ref_alias_type definition 
-- - Reference table for member name alias type
CREATE TABLE IF NOT EXISTS ref_alias_type (
    `alias_type_id` int NOT NULL AUTO_INCREMENT, 
    `alias_type` varchar(50) NOT NULL, 
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP(), 
    `created_by` varchar(10) NOT NULL, 
    `updated_at` timestamp default CURRENT_TIMESTAMP(), 
    `updated_by` varchar(10) NOT NULL, 
    PRIMARY KEY (`alias_type_id`), 
    UNIQUE KEY `uk_alias_type` (`alias_type`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

