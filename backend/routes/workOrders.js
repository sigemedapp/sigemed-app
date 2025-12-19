import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all work orders
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM work_orders ORDER BY created_at DESC');

        const workOrders = rows.map(wo => ({
            id: wo.id.toString(),
            equipmentId: wo.equipment_id.toString(),
            type: wo.type,
            description: wo.description,
            assignedTo: wo.assigned_to ? wo.assigned_to.toString() : undefined,
            reportedBy: wo.reported_by ? wo.reported_by.toString() : undefined,
            status: wo.status,
            createdAt: wo.created_at,
            estimatedRepairDate: wo.estimated_repair_date,
            partsNeeded: wo.parts_needed,
            calibrationCertificateUrl: wo.calibration_certificate_url,
            history: wo.history ? JSON.parse(wo.history) : []
        }));

        res.json(workOrders);
    } catch (error) {
        console.error('Error fetching work orders:', error);
        res.status(500).json({ success: false, message: 'Error recuperando órdenes de trabajo' });
    }
});

// POST new work order
router.post('/', async (req, res) => {
    const { equipmentId, type, description, status, assignedTo, reportedBy } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO work_orders 
            (equipment_id, type, description, status, assigned_to, reported_by, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [equipmentId, type, description, status, assignedTo || null, reportedBy || null]
        );

        res.json({ success: true, id: result.insertId.toString() });
    } catch (error) {
        console.error('Error creating work order:', error);
        res.status(500).json({ success: false, message: 'Error creando orden de trabajo' });
    }
});

export default router;
