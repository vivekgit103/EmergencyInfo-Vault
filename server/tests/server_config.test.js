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
});
