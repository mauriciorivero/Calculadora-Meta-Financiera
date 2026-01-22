-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 22-01-2026 a las 13:09:54
-- Versión del servidor: 8.4.5-5
-- Versión de PHP: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `db4t70ugferask`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metas`
--

CREATE TABLE `metas` (
  `id` int NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `monto_meta` decimal(15,2) NOT NULL,
  `fecha_objetivo` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `metas`
--

INSERT INTO `metas` (`id`, `nombre`, `descripcion`, `monto_meta`, `fecha_objetivo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Vacaciones en san andres', NULL, 6000000.00, '2026-12-18', '2026-01-22 12:21:20', '2026-01-22 12:22:05'),
(2, 'Comprar Macbook Pro M4 Pro Max', NULL, 8000000.00, '2026-12-31', '2026-01-22 12:22:09', '2026-01-22 12:22:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Test User', 'test@example.com', '$2a$10$JVBtqynMTmOQdn1jEmt9K.tVmFM4ktHdsWA4hPJg3zM3ShRlhcSrO', '2026-01-22 11:53:49', '2026-01-22 11:53:49'),
(2, 'Mauricio Rivero', 'rivero.mauricio@gmail.com', '$2a$10$P9Ni14VN1O8yLRnM3MgET.qoTFMFk0c0KsWV73PhNyftNEewRag3y', '2026-01-22 11:54:30', '2026-01-22 11:54:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_metas`
--

CREATE TABLE `usuario_metas` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `meta_id` int NOT NULL,
  `monto_acumulado` decimal(15,2) DEFAULT '0.00',
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario_metas`
--

INSERT INTO `usuario_metas` (`id`, `usuario_id`, `meta_id`, `monto_acumulado`, `fecha_asignacion`, `fecha_actualizacion`) VALUES
(1, 2, 1, 0.00, '2026-01-22 12:21:21', '2026-01-22 12:22:05'),
(2, 2, 2, 0.00, '2026-01-22 12:22:09', '2026-01-22 12:22:48');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `metas`
--
ALTER TABLE `metas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indices de la tabla `usuario_metas`
--
ALTER TABLE `usuario_metas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_usuario_meta` (`usuario_id`,`meta_id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_meta_id` (`meta_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `metas`
--
ALTER TABLE `metas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario_metas`
--
ALTER TABLE `usuario_metas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `usuario_metas`
--
ALTER TABLE `usuario_metas`
  ADD CONSTRAINT `fk_usuario_metas_meta` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_metas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
