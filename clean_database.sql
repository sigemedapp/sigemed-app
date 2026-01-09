-- Script de limpieza para la base de datos de SiGEMed (Hostinger)
-- ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS de las tablas seleccionadas.

SET FOREIGN_KEY_CHECKS = 0;

-- Clean all equipment
TRUNCATE TABLE equipment;

-- Clean all work orders (Reported faults, Maintenance orders, etc.)
TRUNCATE TABLE work_orders;

-- Optional: Clean other tables if needed
-- TRUNCATE TABLE manuals;

-- TRUNCATE TABLE trainings;

SET FOREIGN_KEY_CHECKS = 1;

-- Confirmación visual
SELECT 'Base de datos limpiada correctamente. Tabla equipment vacía.' as status;
