-- REVIEW AND APPROVE BEFORE RUNNING IN THE CLOUD.
-- Select ip_std6730202025 in phpMyAdmin first. No other database/table is used.
USE `ip_std6730202025`;

CREATE TABLE IF NOT EXISTS `std6730202025IPFinal2026` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `position` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'On Leave') DEFAULT 'Active',
  `salary` DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- No DROP, ALTER, UPDATE, or DELETE. Run while the new API is stopped.
-- Rerunning on a nonempty table inserts nothing. Fixed IDs + IGNORE also prevent
-- primary-key duplication without overwriting any existing employee record.
START TRANSACTION;
SET @KripTop_seed_empty = (SELECT COUNT(*) = 0 FROM `std6730202025IPFinal2026`);

INSERT IGNORE INTO `std6730202025IPFinal2026` (`id`, `name`, `position`, `status`, `salary`)
SELECT '67302025-0000-4000-8000-000000000001', 'John Doe', 'Software Engineer', 'Active', 45000.00 WHERE @KripTop_seed_empty
UNION ALL SELECT '67302025-0000-4000-8000-000000000002', 'Maya Chen', 'HR Manager', 'Active', 62000.00 WHERE @KripTop_seed_empty
UNION ALL SELECT '67302025-0000-4000-8000-000000000003', 'Noah Williams', 'Office Assistant', 'On Leave', 18000.00 WHERE @KripTop_seed_empty
UNION ALL SELECT '67302025-0000-4000-8000-000000000004', 'Amara Patel', 'Product Director', 'Active', 85000.00 WHERE @KripTop_seed_empty
UNION ALL SELECT '67302025-0000-4000-8000-000000000005', 'Niran Suri', 'Junior Designer', 'Active', 25000.00 WHERE @KripTop_seed_empty;

COMMIT;
SELECT COUNT(*) AS `KripTop_employee_count` FROM `std6730202025IPFinal2026`;
