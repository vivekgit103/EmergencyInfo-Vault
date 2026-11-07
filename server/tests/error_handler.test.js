const errorHandler = require('../middleware/errorHandler');

describe('errorHandler Middleware (Item 18)', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('Masks status >= 500 error messages with "Internal server error" only in production', () => {
    process.env.NODE_ENV = 'production';

    const err = new Error('Sensitive database credentials leak or query syntax failure');
    err.statusCode = 500;

    let sentStatus = null;
    let sentJson = null;

    const req = { method: 'GET', originalUrl: '/api/sensitive' };
    const res = {
      statusCode: 500,
      status(code) {
        sentStatus = code;
        return this;
      },
      json(data) {
        sentJson = data;
        return this;
      }
    };
    const next = jest.fn();

    // Spy on console.error to keep test output clean
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(sentStatus).toBe(500);
    expect(sentJson).toEqual({ message: 'Internal server error' });
    expect(sentJson.message).not.toContain('Sensitive database');
    expect(sentJson.stack).toBeUndefined();

    consoleSpy.mockRestore();
  });

  test('Preserves client-facing 4xx error messages in production', () => {
    process.env.NODE_ENV = 'production';

    const err = new Error('Resource not found');
    err.statusCode = 404;

    let sentStatus = null;
    let sentJson = null;

    const req = { method: 'GET', originalUrl: '/api/contacts/999' };
    const res = {
      statusCode: 404,
      status(code) {
        sentStatus = code;
        return this;
      },
      json(data) {
        sentJson = data;
        return this;
      }
    };
    const next = jest.fn();

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(sentStatus).toBe(404);
    expect(sentJson.message).toBe('Resource not found');

    consoleSpy.mockRestore();
  });

  test('Returns detailed error message in development mode', () => {
    process.env.NODE_ENV = 'development';

    const err = new Error('Debug info for developer');
    err.statusCode = 500;

    let sentStatus = null;
    let sentJson = null;

    const req = { method: 'GET', originalUrl: '/api/test' };
    const res = {
      statusCode: 500,
      status(code) {
        sentStatus = code;
        return this;
      },
      json(data) {
        sentJson = data;
        return this;
      }
    };
    const next = jest.fn();

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(sentStatus).toBe(500);
    expect(sentJson.message).toBe('Debug info for developer');
    expect(sentJson.stack).toBeDefined();

    consoleSpy.mockRestore();
  });
});

