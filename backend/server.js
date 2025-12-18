
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error("--- FATAL ERROR: COULD NOT LOAD .env FILE ---");
  process.exit(1);
}

import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentado para cargas masivas

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
  res.send('SiGEMed Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
