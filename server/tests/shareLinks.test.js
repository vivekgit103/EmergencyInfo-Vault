const request = require('supertest');
const app = require('../app');
const ShareLink = require('../models/ShareLink');

describe('Share Links Management', () => {
  let cookieUserA;
  let cookieUserB;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'link_a@example.com',
      password: 'password123'
    });
    cookieUserA = resA.headers['set-cookie'];

    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'link_b@example.com',
      password: 'password123'
    });
    cookieUserB = resB.headers['set-cookie'];
  });

  test('Creates a share link with 24h expiry by default', async () => {
    const res = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '24h' });

    expect(res.status).toBe(201);
    expect(res.body.shareLink).toHaveProperty('token');
    expect(res.body.shareLink.hasPin).toBe(false);
    expect(res.body.shareLink.isRevoked).toBe(false);

    // Verify unguessable 32-character token length (16 bytes hex)
    expect(res.body.shareLink.token.length).toBe(32);

    // Verify expiry date is roughly 24 hours from now
    const expiresAt = new Date(res.body.shareLink.expiresAt);
    const expected = Date.now() + 24 * 60 * 60 * 1000;
    expect(Math.abs(expiresAt.getTime() - expected)).toBeLessThan(5000);
  });

  test('Creates a PIN-protected share link with hashed PIN', async () => {
    const res = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '1h', pin: '5678' });

    expect(res.status).toBe(201);
    expect(res.body.shareLink).toHaveProperty('token');
    expect(res.body.shareLink.hasPin).toBe(true);
    // PIN hash must NOT be returned in JSON response
    expect(res.body.shareLink.pinHash).toBeUndefined();

    // Check DB directly: PIN must be hashed, never plain text
    const dbLink = await ShareLink.findOne({ token: res.body.shareLink.token });
    expect(dbLink.pinHash).toBeDefined();
    expect(dbLink.pinHash).not.toBe('5678');
    expect(await dbLink.matchPin('5678')).toBe(true);
    expect(await dbLink.matchPin('0000')).toBe(false);
  });

  test('Lists all share links for authenticated owner', async () => {
    await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '1h' });

    await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '7d' });

    const res = await request(app)
      .get('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(res.status).toBe(200);
    expect(res.body.shareLinks.length).toBe(2);
  });

  test('Revokes an active share link', async () => {
    const createRes = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '24h' });

    const linkId = createRes.body.shareLink._id;

    const revokeRes = await request(app)
      .delete(`/api/share-links/${linkId}`)
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(revokeRes.status).toBe(200);
    expect(revokeRes.body.shareLink.isRevoked).toBe(true);

    const checkLink = await ShareLink.findById(linkId);
    expect(checkLink.isRevoked).toBe(true);
  });

  test('User Data Isolation: User B cannot revoke User A share link', async () => {
    const createRes = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '24h' });

    const linkId = createRes.body.shareLink._id;

    const revokeRes = await request(app)
      .delete(`/api/share-links/${linkId}`)
      .set('Cookie', cookieUserB)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(revokeRes.status).toBe(404);
  });
});
