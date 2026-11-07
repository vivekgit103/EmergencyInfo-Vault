const express = require('express');
const { viewEmergencyCard, checkEmergencyStatus } = require('../controllers/emergencyController');
const { emergencyLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Strict privacy and anti-indexing headers for emergency card access
router.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex',
    'Referrer-Policy': 'no-referrer'
  });
  next();
});

// Public emergency routes protected by rate limiter
router.get('/:token', emergencyLimiter, checkEmergencyStatus);
router.post('/:token', emergencyLimiter, viewEmergencyCard);

module.exports = router;
