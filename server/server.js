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
let server;

if (require.main === module) {
  connectDB()
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`[SERVER] EmergencyInfo Vault running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('[SERVER FATAL] Failed to start server:', err.message);
      process.exit(1);
    });

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    console.log('[SERVER] SIGTERM received. Initiating graceful shutdown...');
    if (server) {
      server.close(async () => {
        console.log('[SERVER] HTTP server closed.');
        try {
          const mongoose = require('mongoose');
          await mongoose.disconnect();
          console.log('[SERVER] Database disconnected gracefully.');
          process.exit(0);
        } catch (dbErr) {
          console.error('[SERVER] Error disconnecting database during shutdown:', dbErr.message);
          process.exit(1);
        }
      });
    } else {
      process.exit(0);
    }
  });

  // Logging and safety for unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[SERVER UNHANDLED REJECTION] Unhandled Promise Rejection at:', promise, 'reason:', reason);
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
}

module.exports = app;
