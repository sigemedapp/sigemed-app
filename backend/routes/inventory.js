
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

// POST /api/inventory/bulk-upload - Carga masiva
router.post('/bulk-upload', async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Datos inválidos.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (const item of items) {
            // Generar ID si no existe
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
                item.name || 'Sin Nombre', // Name cannot be null in DB
                item.brand || null,
                item.model || null,
                item.serialNumber || null,
                item.location || null,
                item.status || 'Operativo',
                item.lastMaintenanceDate || null,
                item.nextMaintenanceDate || null
            ]);
        }

        await connection.commit();
        res.json({ success: true, message: `${items.length} equipos procesados correctamente.` });
    } catch (error) {
        await connection.rollback();
        console.error('Error in bulk upload:', error);
        res.status(500).json({
            success: false,
            message: `Error de BD: ${error.sqlMessage || error.message}`,
            details: error
        });
    } finally {
        connection.release();
    }
});

export default router;
