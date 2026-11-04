const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints (register, login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 25, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
    });
  }
});

// Rate limiter for public emergency endpoints (/api/emergency/:token)
const emergencyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 60, // allow 60 emergency views / PIN attempts per 15m
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests for emergency information. Access temporarily paused to prevent abuse.'
    });
  }
});

module.exports = {
  authLimiter,
  emergencyLimiter
};
