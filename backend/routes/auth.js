import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.trim() : '';
        const password = req.body.password ? req.body.password.trim() : '';

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos.' });
        }

        const [rows] = await db.query(
            'SELECT id, name, email, password_hash, role, area FROM users WHERE email = ?',
            [email]
        );

        // In JavaScript, you access the first element of an array with [0].
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (isPasswordValid) {
            const { password_hash, ...userToSend } = user;
            res.status(200).json({
                success: true,
                message: 'Login exitoso.',
                user: userToSend
            });
        } else {
            res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos.' });
        }

    } catch (error) {
        console.error('--- UNEXPECTED ERROR DURING LOGIN ---', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

export default router;