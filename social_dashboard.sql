/*
 Navicat Premium Data Transfer

 Source Server         : LOACLHOST
 Source Server Type    : MySQL
 Source Server Version : 80045
 Source Host           : 127.0.0.1:3306
 Source Schema         : social_dashboard

 Target Server Type    : MySQL
 Target Server Version : 80045
 File Encoding         : 65001

 Date: 10/02/2026 15:31:12
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for analytics_accounts
-- ----------------------------
DROP TABLE IF EXISTS `analytics_accounts`;
CREATE TABLE `analytics_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `property_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `property_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credentials_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `analytics_accounts_property_id_unique` (`property_id`),
  KEY `analytics_accounts_user_id_index` (`user_id`),
  CONSTRAINT `analytics_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of analytics_accounts
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for analytics_metrics
-- ----------------------------
DROP TABLE IF EXISTS `analytics_metrics`;
CREATE TABLE `analytics_metrics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `analytics_account_id` bigint unsigned NOT NULL,
  `metric_type` enum('sessions','users','pageviews','bounce_rate','session_duration','new_users','returning_users','conversions','revenue','transactions','average_order_value','pages_per_session','exit_rate','organic_search','direct_traffic','referral_traffic','social_traffic','paid_traffic') COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric_value` decimal(20,4) NOT NULL,
  `dimension_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metric_date` date NOT NULL,
  `period` enum('daily','weekly','monthly','yearly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'daily',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `metrics_main_idx` (`analytics_account_id`,`metric_type`,`metric_date`),
  KEY `analytics_metrics_metric_date_index` (`metric_date`),
  CONSTRAINT `analytics_metrics_analytics_account_id_foreign` FOREIGN KEY (`analytics_account_id`) REFERENCES `analytics_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of analytics_metrics
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for cache
-- ----------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of cache
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for cache_locks
-- ----------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of cache_locks
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for dashboards
-- ----------------------------
DROP TABLE IF EXISTS `dashboards`;
CREATE TABLE `dashboards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `layout_config` json DEFAULT NULL,
  `widgets` json DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `is_shared` tinyint(1) NOT NULL DEFAULT '0',
  `share_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dashboards_share_token_unique` (`share_token`),
  KEY `dashboards_user_id_index` (`user_id`),
  CONSTRAINT `dashboards_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of dashboards
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for failed_jobs
-- ----------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of failed_jobs
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of jobs
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of migrations
-- ----------------------------
BEGIN;
INSERT INTO `migrations` VALUES (1, '2014_10_12_000000_create_users_table', 1);
INSERT INTO `migrations` VALUES (2, '2024_01_01_000001_create_social_accounts_table', 1);
INSERT INTO `migrations` VALUES (3, '2024_01_01_000002_create_social_metrics_table', 1);
INSERT INTO `migrations` VALUES (4, '2024_01_01_000003_create_social_posts_table', 1);
INSERT INTO `migrations` VALUES (5, '2024_01_01_000004_create_analytics_accounts_table', 1);
INSERT INTO `migrations` VALUES (6, '2024_01_01_000005_create_analytics_metrics_table', 1);
INSERT INTO `migrations` VALUES (7, '2024_01_01_000006_create_dashboards_table', 1);
INSERT INTO `migrations` VALUES (8, '2026_02_09_210005_create_cache_table', 2);
INSERT INTO `migrations` VALUES (9, '2026_02_09_210006_create_jobs_table', 2);
INSERT INTO `migrations` VALUES (10, '2026_02_09_210008_create_failed_jobs_table', 2);
COMMIT;

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of sessions
-- ----------------------------
BEGIN;
INSERT INTO `sessions` VALUES ('DyjlmVa2x9OgisBfKqrpIFzLCQnQoNTjZMwyoO2R', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiajhyakw3TUEwblF0cG1SaXFwR1lNUXM4ZWlHVjNDVWRheGhhQVpIUiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1731922607);
INSERT INTO `sessions` VALUES ('pgqBMJKBFXJxUI8dnHEXnFNUnOXRWFcqttW851lD', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU0dSQUtVMEZKZ0tUWGV3dzBjcWF3YnJJTFp5dTFoMWRrbEdQclhDMiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1732025066);
INSERT INTO `sessions` VALUES ('SQ1nIfv5CXVyQXYHsNBzKt0469YSpF8Na2zz82je', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoialBmcU9hVjJoVzQ4Ykg0WXRYemlZZEdHeHI1emlDTmZWdnpOQVZzMyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90b2RvIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1731687041);
INSERT INTO `sessions` VALUES ('XbFfbOk29yNKic4QHy1ZtAJ54fVRTzuKwbxELPxR', NULL, '127.0.0.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoickVaZUp1dDRFcGtweG9vcXU4RHdISGxpRnZVczVwMW5XNGozQWtsdCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjU6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcHAiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1770732037);
COMMIT;

-- ----------------------------
-- Table structure for social_accounts
-- ----------------------------
DROP TABLE IF EXISTS `social_accounts`;
CREATE TABLE `social_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `platform` enum('facebook','instagram','tiktok','youtube','twitter','linkedin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `access_token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` text COLLATE utf8mb4_unicode_ci,
  `token_expires_at` timestamp NULL DEFAULT NULL,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `followers_count` bigint unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_accounts_platform_account_id_unique` (`platform`,`account_id`),
  KEY `social_accounts_user_id_index` (`user_id`),
  CONSTRAINT `social_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of social_accounts
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for social_metrics
-- ----------------------------
DROP TABLE IF EXISTS `social_metrics`;
CREATE TABLE `social_metrics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `social_account_id` bigint unsigned NOT NULL,
  `metric_type` enum('followers','views','reach','impressions','engagement','likes','comments','shares','saves','clicks','profile_views','website_clicks','minutes_watched','subscribers','revenue','watch_time','average_view_duration','audience_retention') COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric_value` decimal(20,2) NOT NULL,
  `metric_date` date NOT NULL,
  `period` enum('daily','weekly','monthly','yearly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'daily',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `social_metrics_social_account_id_metric_type_metric_date_index` (`social_account_id`,`metric_type`,`metric_date`),
  KEY `social_metrics_metric_date_index` (`metric_date`),
  CONSTRAINT `social_metrics_social_account_id_foreign` FOREIGN KEY (`social_account_id`) REFERENCES `social_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of social_metrics
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for social_posts
-- ----------------------------
DROP TABLE IF EXISTS `social_posts`;
CREATE TABLE `social_posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `social_account_id` bigint unsigned NOT NULL,
  `post_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `media_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `post_type` enum('image','video','carousel','story','reel','short','text','link') COLLATE utf8mb4_unicode_ci NOT NULL,
  `published_at` timestamp NOT NULL,
  `likes_count` bigint unsigned NOT NULL DEFAULT '0',
  `comments_count` bigint unsigned NOT NULL DEFAULT '0',
  `shares_count` bigint unsigned NOT NULL DEFAULT '0',
  `views_count` bigint unsigned NOT NULL DEFAULT '0',
  `reach_count` bigint unsigned NOT NULL DEFAULT '0',
  `engagement_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_posts_social_account_id_post_id_unique` (`social_account_id`,`post_id`),
  KEY `social_posts_published_at_index` (`published_at`),
  CONSTRAINT `social_posts_social_account_id_foreign` FOREIGN KEY (`social_account_id`) REFERENCES `social_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of social_posts
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
