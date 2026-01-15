
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

// Try to load .env file, but don't crash if it doesn't exist (e.g. in production)
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error && process.env.NODE_ENV !== 'production') {
  console.warn("⚠️  Warning: .env file not found. Relying on system environment variables.");
}

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => process.env[varName] === undefined);

if (missingVars.length > 0) {
  console.error("--- FATAL ERROR: MISSING REQUIRED ENVIRONMENT VARIABLES ---");
  console.error("Missing variables:", missingVars.join(', '));
  console.error("Please check your .env file and ensure all required variables are set.");
  console.error("See backend/.env.example for reference.");
  process.exit(1);
}

console.log("✓ Environment variables validated successfully");

import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import workOrderRoutes from './routes/workOrders.js';
import manualsRoutes from './routes/manuals.js';
import './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration for frontend access
const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (frontendUrls.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Aumentado para cargas masivas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/resources', manualsRoutes);

// Serve Static Frontend Files (Optional path for development)
// const publicPath = path.join(__dirname, 'public');
// app.use(express.static(publicPath));

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) => {
  res.send('SiGEMed Backend is running!');
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 SiGEMed Backend Server`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Allowed Origins: ${frontendUrls.join(', ')}`);
  console.log('='.repeat(50));
});
