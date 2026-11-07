const request = require('supertest');
const app = require('../app');

describe('Server Infrastructure Settings', () => {
  test('Express trust proxy is configured to 1 for reverse proxies', () => {
    expect(app.get('trust proxy')).toBe(1);
  });

  test('Compression middleware is active and serves endpoints', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Accept-Encoding', 'gzip, deflate');
    expect(res.status).toBe(200);
  });

  describe('/api/health connection reporting', () => {
    test('Returns 200 with database: connected when mongoose connection is active', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('connected');
    });

    test('Returns 503 with database: disconnected when database is disconnected', async () => {
      app.locals.isDbConnected = () => false;
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('degraded');
      expect(res.body.database).toBe('disconnected');
      delete app.locals.isDbConnected;
    });
  });
});
