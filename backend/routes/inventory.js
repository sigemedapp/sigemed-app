
import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/inventory - Obtener todos los equipos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM equipment');
        // Mapear nombres de columnas de DB (snake_case) a Frontend (camelCase)
        const equipment = rows.map(eq => ({
            id: eq.id,
            name: eq.name,
            brand: eq.brand,
            model: eq.model,
            serialNumber: eq.serial_number,
            location: eq.location,
            status: eq.status,
            lastMaintenanceDate: eq.last_maintenance_date ? eq.last_maintenance_date.toISOString().split('T')[0] : '',
            nextMaintenanceDate: eq.next_maintenance_date ? eq.next_maintenance_date.toISOString().split('T')[0] : '',
            lastCalibrationDate: eq.last_calibration_date ? eq.last_calibration_date.toISOString().split('T')[0] : null,
            nextCalibrationDate: eq.next_calibration_date ? eq.next_calibration_date.toISOString().split('T')[0] : null,
            imageUrl: eq.image_url
        }));
        res.json(equipment);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ success: false, message: 'Error al obtener el inventario.' });
    }
});

// POST /api/inventory - Crear un nuevo equipo
router.post('/', async (req, res) => {
    const { name, brand, model, serialNumber, location, status, lastMaintenanceDate, nextMaintenanceDate, imageUrl } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre del equipo es obligatorio.' });
    }

    try {
        const query = `
            INSERT INTO equipment 
            (name, brand, model, serial_number, location, status, last_maintenance_date, next_maintenance_date, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [
            name,
            brand || 'Genérica',
            model || 'Desconocido',
            serialNumber || `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generar SN único si no existe
            location || 'Almacén General',
            status || 'Operativo',
            lastMaintenanceDate || null,
            nextMaintenanceDate || null,
            imageUrl || null
        ]);

        const newId = result.insertId;
        const newEquipment = {
            id: newId,
            name,
            brand: brand || 'Genérica',
            model: model || 'Desconocido',
            serialNumber: serialNumber || `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Maintain consistency
            location: location || 'Almacén General',
            status: status || 'Operativo',
            lastMaintenanceDate: lastMaintenanceDate || '',
            nextMaintenanceDate: nextMaintenanceDate || '',
            imageUrl: imageUrl || null
        };

        res.status(201).json({ success: true, message: 'Equipo creado exitosamente.', equipment: newEquipment });
    } catch (error) {
        console.error('Error creating equipment:', error);
        // Handle duplicate serial number error specifically
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'El número de serie ya existe en la base de datos. Por favor, use un número de serie diferente.' });
        }
        res.status(500).json({ success: false, message: 'Error al crear el equipo.' });
    }
});

// POST /api/inventory/bulk-upload - Carga masiva robusta
router.post('/bulk-upload', async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Datos inválidos. Se espera un array de items.' });
    }

    const connection = await db.getConnection();
    const results = {
        total: items.length,
        success: 0,
        failed: 0,
        warnings: [],
        errors: []
    };

    // Helper para sanitizar fechas
    const sanitizeDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        // Verificar si es una fecha válida
        if (isNaN(date.getTime())) return null;
        // Retornar en formato YYYY-MM-DD para MySQL
        return date.toISOString().split('T')[0];
    };

    try {
        // NOTA: Eliminamos la transacción global para permitir éxito parcial (Ingesta de Máximo Esfuerzo)

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const rowIndex = i + 1; // Para referencia del usuario

            // 1. Sanitización y Valores por Defecto (Maximum Effort)
            const sanitizedItem = {
                name: item.name || `Equipo Importado #${rowIndex}`, // Garantizar nombre
                brand: item.brand || 'Genérica',
                model: item.model || 'Desconocido',
                serialNumber: item.serialNumber || `SN-AUTO-${Date.now()}-${rowIndex}`, // Garantizar Unique Key si aplica
                location: item.location || 'Almacén General',
                status: ['Operativo', 'En Mantenimiento', 'Baja', 'Por Revisar'].includes(item.status) ? item.status : 'Por Revisar',
                lastMaintenanceDate: sanitizeDate(item.lastMaintenanceDate),
                nextMaintenanceDate: sanitizeDate(item.nextMaintenanceDate)
            };

            // Registrar advertencias si se modificaron datos críticos
            if (!item.name) results.warnings.push(`Fila ${rowIndex}: Se asignó nombre genérico.`);
            if (item.lastMaintenanceDate && !sanitizedItem.lastMaintenanceDate) results.warnings.push(`Fila ${rowIndex}: Fecha de mant. inválida ignorada.`);

            try {
                const query = `
                    INSERT INTO equipment 
                    (name, brand, model, serial_number, location, status, last_maintenance_date, next_maintenance_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    brand = VALUES(brand),
                    model = VALUES(model),
                    location = VALUES(location),
                    status = VALUES(status),
                    last_maintenance_date = VALUES(last_maintenance_date),
                    next_maintenance_date = VALUES(next_maintenance_date)
                `;

                await connection.execute(query, [
                    sanitizedItem.name,
                    sanitizedItem.brand,
                    sanitizedItem.model,
                    sanitizedItem.serialNumber,
                    sanitizedItem.location,
                    sanitizedItem.status,
                    sanitizedItem.lastMaintenanceDate,
                    sanitizedItem.nextMaintenanceDate
                ]);

                results.success++;

            } catch (innerError) {
                // Si falla la inserción individual (ej. error de conexión momentáneo o constraint muy estricto no previsto)
                console.error(`Error processing row ${rowIndex}:`, innerError);
                results.failed++;
                results.errors.push(`Fila ${rowIndex}: ${innerError.sqlMessage || innerError.message}`);
            }
        }

        res.json({
            success: true,
            message: `Proceso completado. ${results.success} equipos procesados.`,
            details: results
        });

    } catch (error) {
        console.error('Critical error in bulk upload:', error);
        res.status(500).json({
            success: false,
            message: `Error crítico del servidor: ${error.message}`
        });
    } finally {
        connection.release();
    }
});

// PUT /api/inventory/:id - Actualizar equipo
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, brand, model, serialNumber, location, status, lastMaintenanceDate, nextMaintenanceDate, imageUrl } = req.body;

    try {
        const query = `
            UPDATE equipment 
            SET name = ?, brand = ?, model = ?, serial_number = ?, location = ?, status = ?, last_maintenance_date = ?, next_maintenance_date = ?, image_url = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [
            name,
            brand,
            model,
            serialNumber,
            location,
            status,
            lastMaintenanceDate || null,
            nextMaintenanceDate || null,
            imageUrl || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Equipo no encontrado.' });
        }

        res.json({ success: true, message: 'Equipo actualizado correctamente.' });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el equipo.' });
    }
});

export default router;
