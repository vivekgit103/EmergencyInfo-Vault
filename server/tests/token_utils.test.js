const { parseExpiresInToMs, getCookieOptions } = require('../utils/tokenUtils');

describe('Shared Cookie Options & JWT Expiry Helper', () => {
  const originalEnv = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    process.env.JWT_EXPIRES_IN = originalEnv;
  });

  test('Correctly parses various duration units into milliseconds', () => {
    expect(parseExpiresInToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
    expect(parseExpiresInToMs('24h')).toBe(24 * 60 * 60 * 1000);
    expect(parseExpiresInToMs('60m')).toBe(60 * 60 * 1000);
    expect(parseExpiresInToMs('3600s')).toBe(3600 * 1000);
    expect(parseExpiresInToMs('1800')).toBe(1800 * 1000);
    expect(parseExpiresInToMs(3600)).toBe(3600 * 1000);
  });

  test('Falls back gracefully to 7d for invalid or missing values', () => {
    expect(parseExpiresInToMs(undefined)).toBe(7 * 24 * 60 * 60 * 1000);
    expect(parseExpiresInToMs('invalid')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  test('getCookieOptions returns maxAge matching JWT_EXPIRES_IN', () => {
    process.env.JWT_EXPIRES_IN = '14d';
    const options = getCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.maxAge).toBe(14 * 24 * 60 * 60 * 1000);
  });

  test('getCookieOptions(true) omits maxAge for clearing cookies', () => {
    const clearOptions = getCookieOptions(true);
    expect(clearOptions.httpOnly).toBe(true);
    expect(clearOptions.maxAge).toBeUndefined();
  });
});
