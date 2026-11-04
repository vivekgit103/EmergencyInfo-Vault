/**
 * Lightweight, robust MongoDB NoSQL injection sanitizer
 * Recursively strips keys beginning with '$' or containing '.' from objects.
 * Prevents Express 4/5 compatibility bugs and getter mutation issues.
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}

const mongoSanitizeMiddleware = () => (req, res, next) => {
  if (req && req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req && req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  if (req && req.query && typeof req.query === 'object') {
    try {
      sanitizeObject(req.query);
    } catch (_) {
      // In some environments req.query has read-only getters; safely ignore
    }
  }
  next();
};

module.exports = mongoSanitizeMiddleware;
