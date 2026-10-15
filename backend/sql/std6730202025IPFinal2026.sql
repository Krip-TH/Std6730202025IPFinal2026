-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 15, 2026 at 04:29 AM
-- Server version: 8.0.46-0ubuntu0.24.04.4
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ip_std6730202025`
--

-- --------------------------------------------------------

--
-- Table structure for table `std6730202025IPFinal2026`
--

CREATE TABLE `std6730202025IPFinal2026` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','On Leave') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `salary` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `std6730202025IPFinal2026`
--

INSERT INTO `std6730202025IPFinal2026` (`id`, `name`, `position`, `status`, `salary`) VALUES
('1', 'John Doe', 'Software Engineer', 'On Leave', 45000.00),
('2', 'Maya Chen', 'HR Manager', 'On Leave', 62000.00),
('3', 'Alex Smith', 'Designer', 'On Leave', 28000.00),
('4', 'Sarah Lee', 'Accountant', 'Active', 35000.00),
('5', 'David Kim', 'Director', 'On Leave', 85000.00),
('d5b87cc7-a5a6-411b-9bdb-e6fa2efc4a93', 'Jay KKKK', 'ceo', 'Active', 90000.00),
('f931893f-76d8-461b-8fa3-552c04dd20e6', 'Krip Topongkasem', 'Manager', 'Active', 60000.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `std6730202025IPFinal2026`
--
ALTER TABLE `std6730202025IPFinal2026`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
