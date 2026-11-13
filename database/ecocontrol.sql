-- =========================================================
-- EcoControl - Base de datos MySQL
-- Importar desde phpMyAdmin (XAMPP): pestaña "Importar"
-- o ejecutar todo el archivo en la pestaña "SQL".
-- =========================================================

CREATE DATABASE IF NOT EXISTS ecocontrol
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE ecocontrol;

-- ---------------------------------------------------------
-- Usuarios (clientes) que se registran en el sistema
-- La contraseña se guarda con password_hash() de PHP.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  clave VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Diagnósticos ambientales y su Índice Eco (0 a 100)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnosticos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('Hogar', 'Negocio') NOT NULL,
  indice TINYINT UNSIGNED NOT NULL,
  nivel ENUM('Bajo', 'Medio', 'Alto') NOT NULL,
  energia TINYINT UNSIGNED NOT NULL,
  agua TINYINT UNSIGNED NOT NULL,
  residuos TINYINT UNSIGNED NOT NULL,
  recomendaciones TEXT NOT NULL,          -- lista guardada en formato JSON
  CONSTRAINT fk_diagnostico_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Solicitudes de asesoramiento
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS asesorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  area VARCHAR(50) NOT NULL,
  modalidad VARCHAR(50) NOT NULL,
  telefono VARCHAR(30) NULL,
  mensaje TEXT NOT NULL,
  estado ENUM('Pendiente', 'En curso', 'Finalizada') NOT NULL DEFAULT 'Pendiente',
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_asesoria_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Mensajes del formulario de contacto
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS contactos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  asunto VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Pedidos de recuperación de contraseña
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS recuperaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token CHAR(64) NOT NULL,
  vence DATETIME NOT NULL,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_recuperacion_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Usuario de prueba
-- Correo: demo@ecocontrol.com   Contraseña: eco123
-- ---------------------------------------------------------
INSERT IGNORE INTO usuarios (nombre, email, clave, rol) VALUES
('Usuario Demo', 'demo@ecocontrol.com', '$2y$10$tO/KXt17tIU3LLF20PU3MeOw4O7mqJx8mMya/64PBrE2rh1kXZARy', 'cliente');
