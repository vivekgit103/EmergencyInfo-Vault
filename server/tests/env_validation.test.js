const validateEnv = require('../config/validateEnv');

describe('Environment Variable Fail-Fast Validation (Item 3)', () => {
  const validBaseEnv = {
    JWT_SECRET: 'a_very_long_secure_jwt_secret_key_for_testing_123',
    COOKIE_SECRET: 'cookie_secret_123',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/test',
    CLIENT_ORIGIN: 'http://localhost:5173',
    NODE_ENV: 'development'
  };

  test('passes validation with all required variables in development', () => {
    expect(() => validateEnv(validBaseEnv)).not.toThrow();
  });

  test('throws if JWT_SECRET is missing', () => {
    const env = { ...validBaseEnv, JWT_SECRET: '' };
    expect(() => validateEnv(env)).toThrow(/Missing required environment variable/i);
  });

  test('throws if COOKIE_SECRET is missing', () => {
    const env = { ...validBaseEnv, COOKIE_SECRET: '' };
    expect(() => validateEnv(env)).toThrow(/Missing required environment variable/i);
  });

  test('throws if MONGODB_URI is missing', () => {
    const env = { ...validBaseEnv, MONGODB_URI: '' };
    expect(() => validateEnv(env)).toThrow(/Missing required environment variable/i);
  });

  test('throws if CLIENT_ORIGIN is missing', () => {
    const env = { ...validBaseEnv, CLIENT_ORIGIN: '' };
    expect(() => validateEnv(env)).toThrow(/Missing required environment variable/i);
  });

  test('in production, rejects JWT_SECRET shorter than 32 characters', () => {
    const env = {
      ...validBaseEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'short_secret_under_32_chars'
    };
    expect(() => validateEnv(env)).toThrow(/must be at least 32 characters/i);
  });

  test('in production, rejects JWT_SECRET containing template words like replace, example, secret_key', () => {
    const env = {
      ...validBaseEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'this_is_a_35_character_string_replace_me'
    };
    expect(() => validateEnv(env)).toThrow(/cannot match \/replace\|example\|secret_key\/i/i);

    const env2 = {
      ...validBaseEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'this_is_a_35_character_string_example_key'
    };
    expect(() => validateEnv(env2)).toThrow(/cannot match \/replace\|example\|secret_key\/i/i);

    const env3 = {
      ...validBaseEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'this_is_a_35_character_string_secret_key'
    };
    expect(() => validateEnv(env3)).toThrow(/cannot match \/replace\|example\|secret_key\/i/i);
  });

  test('in production, accepts valid strong JWT_SECRET >= 32 chars without template keywords', () => {
    const env = {
      ...validBaseEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'production_super_strong_random_hash_982347198273419827341'
    };
    expect(() => validateEnv(env)).not.toThrow();
  });
});
