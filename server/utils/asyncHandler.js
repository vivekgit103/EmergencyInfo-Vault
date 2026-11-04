/**
 * Central async error wrapper for Express routes
 * Avoids repetitive try/catch blocks and passes errors to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
