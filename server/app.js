const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('./middleware/mongoSanitize');
const csrfGuard = require('./middleware/csrfGuard');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const instructionRoutes = require('./routes/instructionRoutes');
const shareLinkRoutes = require('./routes/shareLinkRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const accountRoutes = require('./routes/accountRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxy (e.g. Nginx, Cloudflare, load balancers)
app.set('trust proxy', 1);

// HTTP response compression
app.use(compression());

// Secure HTTP Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or automated test runners)
      if (!origin) return callback(null, true);
      // Allow only configured CLIENT_ORIGIN
      if (origin === process.env.CLIENT_ORIGIN) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With']
  })
);

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'EmergencyInfo Vault API' });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', csrfGuard, contactRoutes);
app.use('/api/instructions', csrfGuard, instructionRoutes);
app.use('/api/share-links', csrfGuard, shareLinkRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/account', csrfGuard, accountRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
