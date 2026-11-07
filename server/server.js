require('dotenv').config();
const validateEnv = require('./config/validateEnv');

// Validate environment variables on startup
try {
  validateEnv(process.env);
} catch (err) {
  console.error(`[SERVER FATAL] ${err.message}`);
  console.error('Please configure them before starting the server.');
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening only if executed directly
if (require.main === module) {
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
}

module.exports = app;
