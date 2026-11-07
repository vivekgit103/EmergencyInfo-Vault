const { detectSensitiveData } = require('../utils/sensitivePatterns');

/**
 * Middleware to check request body for prohibited sensitive data patterns
 * Rejects instruction titles or text containing 12-digit IDs or 13-19 digit card numbers
 */
const sensitiveDataGuard = (req, res, next) => {
  const fieldsToCheck = ['title', 'text', 'name', 'relationship'];

  for (const field of fieldsToCheck) {
    if (req.body && req.body[field]) {
      const detection = detectSensitiveData(req.body[field]);
      if (detection.hasSensitiveData) {
        return res.status(400).json({
          message: 'Sensitive data detected. For security and privacy, sensitive credentials, card numbers, and ID numbers cannot be saved.',
          errors: [
            {
              field,
              message: detection.reason
            }
          ]
        });
      }
    }
  }

  next();
};

module.exports = sensitiveDataGuard;
