-- ============================================
-- ESQUEMA DE BASE DE DATOS POSTGRESQL
-- Calculadora de Meta Financiera - Supabase
-- ============================================

-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: usuarios
-- Almacena la información de los usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- ============================================
-- TABLA: metas
-- Almacena las metas financieras disponibles
-- ============================================
CREATE TABLE IF NOT EXISTS metas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    monto_meta DECIMAL(15,2) NOT NULL,
    fecha_objetivo DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para nombre
CREATE INDEX IF NOT EXISTS idx_metas_nombre ON metas(nombre);

-- ============================================
-- TABLA: usuario_metas
-- Relación entre usuarios y sus metas asignadas
-- ============================================
CREATE TABLE IF NOT EXISTS usuario_metas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    meta_id INTEGER NOT NULL,
    monto_acumulado DECIMAL(15,2) DEFAULT 0.00,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción única: un usuario no puede tener la misma meta dos veces
    CONSTRAINT uk_usuario_meta UNIQUE (usuario_id, meta_id),
    
    -- Claves foráneas
    CONSTRAINT fk_usuario_metas_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_metas_meta FOREIGN KEY (meta_id) 
        REFERENCES metas(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuario_metas_usuario_id ON usuario_metas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_metas_meta_id ON usuario_metas(meta_id);

-- ============================================
-- FUNCIÓN PARA ACTUALIZAR fecha_actualizacion
-- ============================================
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion automáticamente
CREATE TRIGGER trigger_usuarios_fecha_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER trigger_metas_fecha_actualizacion
    BEFORE UPDATE ON metas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER trigger_usuario_metas_fecha_actualizacion
    BEFORE UPDATE ON usuario_metas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar usuarios de ejemplo
INSERT INTO usuarios (nombre, email, password, fecha_creacion, fecha_actualizacion) VALUES
('Test User', 'test@example.com', '$2a$10$JVBtqynMTmOQdn1jEmt9K.tVmFM4ktHdsWA4hPJg3zM3ShRlhcSrO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mauricio Rivero', 'rivero.mauricio@gmail.com', '$2a$10$P9Ni14VN1O8yLRnM3MgET.qoTFMFk0c0KsWV73PhNyftNEewRag3y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insertar metas de ejemplo
INSERT INTO metas (nombre, descripcion, monto_meta, fecha_objetivo, fecha_creacion, fecha_actualizacion) VALUES
('Vacaciones en san andres', NULL, 6000000.00, '2026-12-18', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Comprar Macbook Pro M4 Pro Max', NULL, 8000000.00, '2026-12-31', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insertar asignaciones de ejemplo (ajustar IDs según sea necesario)
INSERT INTO usuario_metas (usuario_id, meta_id, monto_acumulado, fecha_asignacion, fecha_actualizacion) VALUES
(2, 1, 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (usuario_id, meta_id) DO NOTHING;
