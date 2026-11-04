const { validationResult } = require('express-validator');

/**
 * Middleware that inspects express-validator validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      message: 'Validation failed: please review the highlighted fields',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = validate;
