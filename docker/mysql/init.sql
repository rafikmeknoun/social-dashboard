-- Create database if not exists
CREATE DATABASE IF NOT EXISTS social_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON social_dashboard.* TO 'dashboard_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;
