const request = require('supertest');
const app = require('../app');

describe('CORS Restrictions (Item 4)', () => {
  const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  test('allows requests matching CLIENT_ORIGIN', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', allowedOrigin);

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
  });

  test('allows requests with no Origin header (direct/curl/mobile/test runners)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  test('rejects requests from disallowed origins with 403', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://malicious-attacker.com');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not allowed by cors/i);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
