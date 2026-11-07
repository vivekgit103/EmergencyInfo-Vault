const jwt = require('jsonwebtoken');

/**
 * Convert JWT_EXPIRES_IN format (e.g. '7d', '24h', '60m', '3600s', '3600') into milliseconds.
 * Viva explanation:
 * Keeps cookie lifespan in exact synchronization with the backend JWT token expiration,
 * ensuring no orphaned cookies or premature session dropouts.
 */
const parseExpiresInToMs = (expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  if (typeof expiresIn === 'number') {
    return expiresIn * 1000;
  }
  const str = String(expiresIn).trim();
  const match = str.match(/^(\d+)([dhms])?$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return value * 1000;
  }
};

/**
 * Generate a JWT token for a user
 * @param {string} userId 
 * @returns {string} token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Shared cookie configuration helper used across login, register, logout, and deleteAccount.
 * @param {boolean} forClear - If true, returns options without maxAge for clearing cookies
 * @returns {object} cookie options
 */
const getCookieOptions = (forClear = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const base = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  };

  if (forClear) {
    return base;
  }

  return {
    ...base,
    maxAge: parseExpiresInToMs(process.env.JWT_EXPIRES_IN)
  };
};

module.exports = {
  generateToken,
  getCookieOptions,
  parseExpiresInToMs
};
