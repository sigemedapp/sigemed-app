
import express from 'express';
import db from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads dir exists (redundant if mkdir was run, but good practice)
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to save base64 file
const saveFile = (base64Data, originalName) => {
    if (!base64Data) return null;

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        // Handle raw base64 without prefix if necessary, but frontend should send data URL
        return null;
    }

    const fileBuffer = Buffer.from(matches[2], 'base64');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(originalName) || '.pdf';
    const filename = `manual-${uniqueSuffix}${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, fileBuffer);

    // Return relative URL
    // Ideally this should use an env var for base URL, but we'll return /uploads/filename
    // The frontend can prepend API base URL if needed, or if served from same domain it works 

    // Note: server.js serves /uploads mapped to uploads dir.
    // So URL is /uploads/filename
    return `/uploads/${filename}`;
};

// Initialize tables
async function initTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS procedures (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                file_url VARCHAR(512),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS trainings (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                year INT,
                file_url VARCHAR(512),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Manuals and Trainings tables initialized.');
    } catch (error) {
        console.error('Error initializing manuals tables:', error);
    }
}
initTables();

// --- PROCEDURES ---

router.get('/procedures', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM procedures ORDER BY created_at DESC');
        res.json(rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            fileUrl: row.file_url
        })));
    } catch (error) {
        console.error('Error fetching procedures:', error);
        res.status(500).json({ error: 'Failed to fetch procedures' });
    }
});

router.post('/procedures', async (req, res) => {
    const { id, name, description, category, fileData, fileName } = req.body;
    try {
        const fileUrl = saveFile(fileData, fileName);
        if (!fileUrl) {
            return res.status(400).json({ error: 'Invalid file data' });
        }

        await db.execute(
            'INSERT INTO procedures (id, name, description, category, file_url) VALUES (?, ?, ?, ?, ?)',
            [id, name, description, category, fileUrl]
        );
        res.status(201).json({ success: true, fileUrl });
    } catch (error) {
        console.error('Error adding procedure:', error);
        res.status(500).json({ error: 'Failed to add procedure' });
    }
});

router.delete('/procedures/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Optional: Delete file from disk too.
        // First get the file path
        const [rows] = await db.execute('SELECT file_url FROM procedures WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].file_url) {
            const filePath = path.join(UPLOADS_DIR, path.basename(rows[0].file_url));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.execute('DELETE FROM procedures WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting procedure:', error);
        res.status(500).json({ error: 'Failed to delete procedure' });
    }
});

// --- TRAININGS ---

router.get('/trainings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM trainings ORDER BY year DESC, created_at DESC');
        res.json(rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            year: row.year,
            fileUrl: row.file_url
        })));
    } catch (error) {
        console.error('Error fetching trainings:', error);
        res.status(500).json({ error: 'Failed to fetch trainings' });
    }
});

router.post('/trainings', async (req, res) => {
    const { id, name, description, year, fileData, fileName } = req.body;
    try {
        const fileUrl = saveFile(fileData, fileName);
        if (!fileUrl) {
            return res.status(400).json({ error: 'Invalid file data' });
        }

        await db.execute(
            'INSERT INTO trainings (id, name, description, year, file_url) VALUES (?, ?, ?, ?, ?)',
            [id, name, description, year, fileUrl]
        );
        res.status(201).json({ success: true, fileUrl });
    } catch (error) {
        console.error('Error adding training:', error);
        res.status(500).json({ error: 'Failed to add training' });
    }
});

router.delete('/trainings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT file_url FROM trainings WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].file_url) {
            const filePath = path.join(UPLOADS_DIR, path.basename(rows[0].file_url));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.execute('DELETE FROM trainings WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting training:', error);
        res.status(500).json({ error: 'Failed to delete training' });
    }
});

export default router;
