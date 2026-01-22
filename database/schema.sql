-- ============================================
-- ESQUEMA DE BASE DE DATOS
-- Calculadora de Meta Financiera
-- ============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS meta_financiera
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE meta_financiera;

-- ============================================
-- TABLA: usuarios
-- Almacena la información de los usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: metas
-- Almacena las metas financieras disponibles
-- ============================================
CREATE TABLE IF NOT EXISTS metas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    monto_meta DECIMAL(15, 2) NOT NULL,
    fecha_objetivo DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: usuario_metas
-- Tabla de relación entre usuarios y metas
-- Almacena el progreso de cada usuario en cada meta
-- ============================================
CREATE TABLE IF NOT EXISTS usuario_metas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    meta_id INT NOT NULL,
    monto_acumulado DECIMAL(15, 2) DEFAULT 0.00,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Restricción de unicidad: un usuario solo puede tener una asignación por meta
    UNIQUE KEY uk_usuario_meta (usuario_id, meta_id),
    
    -- Claves foráneas
    CONSTRAINT fk_usuario_metas_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT fk_usuario_metas_meta 
        FOREIGN KEY (meta_id) REFERENCES metas(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_meta_id (meta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS DE EJEMPLO (opcional)
-- ============================================

-- Insertar usuario de prueba (contraseña: "123456" hasheada con bcrypt)
-- INSERT INTO usuarios (nombre, email, password) VALUES 
-- ('Usuario Demo', 'demo@example.com', '$2a$10$example_hash_here');

-- Insertar metas de ejemplo
-- INSERT INTO metas (nombre, descripcion, monto_meta, fecha_objetivo) VALUES
-- ('Fondo de Emergencia', 'Ahorro para emergencias equivalente a 6 meses de gastos', 10000000.00, '2025-12-31'),
-- ('Vacaciones', 'Viaje familiar de vacaciones', 5000000.00, '2025-06-30'),
-- ('Nuevo Computador', 'Computador para trabajo', 3500000.00, '2025-03-31');
