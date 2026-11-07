/**
 * Validate essential environment variables (Fail Fast)
 * @param {object} env 
 */
const validateEnv = (env = process.env) => {
  const required = ['JWT_SECRET', 'COOKIE_SECRET', 'MONGODB_URI', 'CLIENT_ORIGIN'];
  const missing = required.filter(key => !env[key] || env[key].trim() === '');
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
  if (env.NODE_ENV === 'production') {
    const secret = env.JWT_SECRET;
    if (secret.length < 32 || /replace|example|secret_key/i.test(secret)) {
      throw new Error('In production, JWT_SECRET must be at least 32 characters and cannot match /replace|example|secret_key/i');
    }
  }
};

module.exports = validateEnv;

