CREATE TABLE IF NOT EXISTS user_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  group_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_group FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE SET NULL
);

INSERT INTO user_groups (slug, name, description)
VALUES
  ('admin', 'Admin', 'Can manage users and membership workflows'),
  ('membership', 'Membership', 'Can manage memberships but cannot create new users'),
  ('organizer', 'Organizer', 'Lookup-only access')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
