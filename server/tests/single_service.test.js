const request = require('supertest');
const path = require('path');
const fs = require('fs');

describe('Single-Service Production Mode', () => {
  let originalEnv;
  let prodApp;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const distPath = path.join(__dirname, '../../client/dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, '<!DOCTYPE html><html><body><div id="root">EmergencyInfo Vault</div></body></html>');
    }

    jest.isolateModules(() => {
      prodApp = require('../app');
    });
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('Serves index.html for non-API client routes like /login or /dashboard', async () => {
    const res = await request(prodApp).get('/login');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('EmergencyInfo Vault');
  });

  test('Returns 404 JSON for non-existent /api routes rather than falling back to HTML', async () => {
    const res = await request(prodApp).get('/api/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
