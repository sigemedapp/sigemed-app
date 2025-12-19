<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SiGEMed - Sistema de Gestión de Equipo Médico

Sistema completo de gestión de inventario de equipo médico con frontend en React/TypeScript y backend en Node.js/Express.

## Run Locally

**Prerequisites:** Node.js (v18 or higher), MySQL/MariaDB database

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=your_user
# DB_PASSWORD=your_password
# DB_NAME=sigemed_db
# PORT=4000
# FRONTEND_URL=http://localhost:3000

npm start
```

The backend should start on `http://localhost:4000`

### 2. Frontend Setup

```bash
# Return to project root
cd ..
npm install

# Create .env.local file from example
cp .env.example .env.local

# Edit .env.local and set:
# GEMINI_API_KEY=your_gemini_api_key
# VITE_API_BASE_URL=http://localhost:4000

npm run dev
```

The frontend will start on `http://localhost:3000`

## Production Deployment

- **Frontend**: Deploy to Hostinger (static build with `npm run build`)
- **Backend**: Deploy to Render
- Update environment variables:
  - Frontend: Set `VITE_API_BASE_URL` to your Render backend URL
  - Backend: Set `FRONTEND_URL` to your Hostinger domain

## Features

- User authentication and role management
- Equipment inventory management with CSV bulk upload
- Work order tracking
- Supplier management
- Audit logging
- Dark mode support

View app in AI Studio: https://ai.studio/apps/drive/1Vkk-w9F69Ph_-YRwShrnINiT1NmU8DGW
