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
      .send({ expiry: '1h', pin: '567890' });

    expect(res.status).toBe(201);
    expect(res.body.shareLink).toHaveProperty('token');
    expect(res.body.shareLink.hasPin).toBe(true);
    // PIN hash must NOT be returned in JSON response
    expect(res.body.shareLink.pinHash).toBeUndefined();

    // Check DB directly: PIN must be hashed, never plain text
    const dbLink = await ShareLink.findOne({ token: res.body.shareLink.token });
    expect(dbLink.pinHash).toBeDefined();
    expect(dbLink.pinHash).not.toBe('567890');
    expect(await dbLink.matchPin('567890')).toBe(true);
    expect(await dbLink.matchPin('000000')).toBe(false);
  });

  test('Rejects invalid PINs with 400 so a link cannot silently be created unpinned', async () => {
    // Fewer than 6 digits
    const resShort = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '1h', pin: '12345' });
    expect(resShort.status).toBe(400);

    // Non-numeric
    const resAlpha = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '1h', pin: 'abcdef' });
    expect(resAlpha.status).toBe(400);

    // Whitespace only
    const resSpaces = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '1h', pin: '      ' });
    expect(resSpaces.status).toBe(400);
  });

  test('Trims PIN whitespace and sets properly', async () => {
    const res = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '1h', pin: '  654321  ' });

    expect(res.status).toBe(201);
    expect(res.body.shareLink.hasPin).toBe(true);
    const dbLink = await ShareLink.findOne({ token: res.body.shareLink.token });
    expect(await dbLink.matchPin('654321')).toBe(true);
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

  test('ShareLink schema configures 7-day TTL index on expiresAt without duplicate token index', () => {
    const indexes = ShareLink.schema.indexes();
    // Look for TTL index on expiresAt
    const ttlIndex = indexes.find(idx => idx[0] && idx[0].expiresAt === 1);
    expect(ttlIndex).toBeDefined();
    expect(ttlIndex[1]).toHaveProperty('expireAfterSeconds', 604800);

    // Verify token has exactly one index definition (unique)
    const tokenIndexes = indexes.filter(idx => idx[0] && idx[0].token === 1);
    expect(tokenIndexes.length).toBe(1);
    expect(tokenIndexes[0][1]).toHaveProperty('unique', true);
  });
});
