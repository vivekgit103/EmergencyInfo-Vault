const express = require('express');
const { viewEmergencyCard, checkEmergencyStatus } = require('../controllers/emergencyController');
const { emergencyLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Public emergency routes protected by rate limiter
router.get('/:token', emergencyLimiter, checkEmergencyStatus);
router.post('/:token', emergencyLimiter, viewEmergencyCard);

module.exports = router;
