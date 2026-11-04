const fs = require('fs');
const path = require('path');

// 1. Ensure .env exists in server directory for local development
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('[CONFIG] Created server/.env from .env.example with default values.');
}

require('dotenv').config();

// 2. Validate essential environment variables (Fail Fast)
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');

if (missingVars.length > 0) {
  console.error(`[SERVER FATAL] Missing required environment variable(s): ${missingVars.join(', ')}`);
  console.error('Please configure them in server/.env before starting the server.');
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// 3. Connect to Database and start listening
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[SERVER] EmergencyInfo Vault running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[SERVER FATAL] Failed to start server:', err.message);
    process.exit(1);
  });
