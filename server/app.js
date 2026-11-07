const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('./middleware/mongoSanitize');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const instructionRoutes = require('./routes/instructionRoutes');
const shareLinkRoutes = require('./routes/shareLinkRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const accountRoutes = require('./routes/accountRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Secure HTTP Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or automated test runners)
      if (!origin) return callback(null, true);
      // Allow configured origin or localhost
      if (origin === clientOrigin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/testing, can be restricted if needed
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })
);

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'emergencyinfo_vault_cookie_secret_fallback'));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'EmergencyInfo Vault API' });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/instructions', instructionRoutes);
app.use('/api/share-links', shareLinkRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/account', accountRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
