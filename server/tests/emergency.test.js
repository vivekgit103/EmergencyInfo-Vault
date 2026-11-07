const request = require('supertest');
const app = require('../app');
const ShareLink = require('../models/ShareLink');

describe('Public Emergency Card Access & Security', () => {
  let cookieUser;
  let normalShareToken;
  let pinShareToken;

  beforeEach(async () => {
    // Register owner
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dr. John Watson',
      email: 'watson@example.com',
      password: 'password123'
    });
    cookieUser = res.headers['set-cookie'];

    // Create Emergency Contacts
    // 1. Secondary visible
    await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUser)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        name: 'Mrs. Hudson',
        relationship: 'Landlady',
        phone: '+1-555-0188',
        priority: 'secondary',
        showInEmergency: true
      });

    // 2. Primary visible
    await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUser)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        name: 'Sherlock Holmes',
        relationship: 'Partner',
        phone: '+1-555-0100',
        priority: 'primary',
        showInEmergency: true
      });

    // 3. Other - HIDDEN in emergency
    await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUser)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        name: 'Inspector Lestrade',
        relationship: 'Colleague',
        phone: '+1-555-0199',
        priority: 'other',
        showInEmergency: false
      });

    // Create Instructions
    // Visible
    await request(app)
      .post('/api/instructions')
      .set('Cookie', cookieUser)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        title: 'Penicillin Allergy',
        text: 'Patient has severe anaphylactic reaction to penicillin.',
        showInEmergency: true
      });

    // Hidden in emergency
    await request(app)
      .post('/api/instructions')
      .set('Cookie', cookieUser)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        title: 'Desk Safe Combination',
        text: 'The desk safe code is 3829.',
        showInEmergency: false
      });

    // Create Normal Share Link
    const normalLinkRes = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUser)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '24h' });
    normalShareToken = normalLinkRes.body.shareLink.token;

    // Create PIN protected Share Link
    const pinLinkRes = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookieUser)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ expiry: '24h', pin: '987654' });
    pinShareToken = pinLinkRes.body.shareLink.token;
  });

  test('Nonexistent token returns 404 with strict privacy headers', async () => {
    const res = await request(app).post('/api/emergency/nonexistent-token-12345');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not exist/i);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  test('GET /api/emergency/:token status check returns strict privacy headers', async () => {
    const res = await request(app).get(`/api/emergency/${normalShareToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  test('Public access returns minimal payload with only visible items sorted by priority', async () => {
    const res = await request(app).post(`/api/emergency/${normalShareToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ownerName', 'Dr. John Watson');
    expect(res.body).toHaveProperty('contacts');
    expect(res.body).toHaveProperty('instructions');

    // Security check: NEVER reveal owner email or sensitive user model properties
    expect(res.body).not.toHaveProperty('email');
    expect(res.body).not.toHaveProperty('userId');
    expect(res.body).not.toHaveProperty('password');

    // Verify privacy and anti-indexing headers on /api/emergency
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');

    // Security & privacy check: internal database _id must NOT be exposed on public cards
    expect(res.body.contacts[0]).not.toHaveProperty('_id');
    expect(res.body.contacts[1]).not.toHaveProperty('_id');
    expect(res.body.instructions[0]).not.toHaveProperty('_id');

    // Only 2 visible contacts returned (Sherlock Holmes & Mrs. Hudson)
    expect(res.body.contacts.length).toBe(2);
    // Verified sorted by priority: primary first, secondary next
    expect(res.body.contacts[0].name).toBe('Sherlock Holmes');
    expect(res.body.contacts[0].priority).toBe('primary');
    expect(res.body.contacts[1].name).toBe('Mrs. Hudson');
    expect(res.body.contacts[1].priority).toBe('secondary');

    // Lestrade (showInEmergency = false) must NOT appear
    expect(res.body.contacts.some(c => c.name === 'Inspector Lestrade')).toBe(false);

    // Only 1 visible instruction returned (Penicillin Allergy)
    expect(res.body.instructions.length).toBe(1);
    expect(res.body.instructions[0].title).toBe('Penicillin Allergy');
    // Safe combination (showInEmergency = false) must NOT appear
    expect(res.body.instructions.some(i => i.title === 'Desk Safe Combination')).toBe(false);
  });

  test('Expired share link returns 410', async () => {
    // Manually set expiry date to the past
    await ShareLink.updateOne({ token: normalShareToken }, { expiresAt: new Date(Date.now() - 10000) });

    const res = await request(app).post(`/api/emergency/${normalShareToken}`);
    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/expired/i);
  });

  test('Revoked share link returns 403', async () => {
    await ShareLink.updateOne({ token: normalShareToken }, { isRevoked: true });

    const res = await request(app).post(`/api/emergency/${normalShareToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/revoked/i);
  });

  describe('PIN-protected Emergency Link and Lockout', () => {
    test('Access without PIN returns 401 with requiresPin: true', async () => {
      const res = await request(app).post(`/api/emergency/${pinShareToken}`);

      expect(res.status).toBe(401);
      expect(res.body.requiresPin).toBe(true);
      expect(res.body.message).toMatch(/protected with a PIN/i);
    });

    test('Incorrect PIN decrements remaining attempts', async () => {
      const res = await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .send({ pin: '000000' });

      expect(res.status).toBe(401);
      expect(res.body.requiresPin).toBe(true);
      expect(res.body.remainingAttempts).toBe(4);
    });

    test('5 consecutive incorrect PIN attempts locks the card with 429', async () => {
      // 4 wrong attempts
      for (let i = 0; i < 4; i++) {
        const res = await request(app)
          .post(`/api/emergency/${pinShareToken}`)
          .send({ pin: '000000' });
        expect(res.status).toBe(401);
      }

      // 5th wrong attempt triggers lockout
      const lockRes = await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .send({ pin: '000000' });

      expect(lockRes.status).toBe(429);
      expect(lockRes.body.message).toMatch(/locked/i);
      expect(lockRes.body).toHaveProperty('lockedUntil');

      // Subsequent attempt even with correct PIN is blocked while locked
      const blockedRes = await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .send({ pin: '987654' });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.message).toMatch(/temporarily locked/i);
    });

    test('Correct PIN returns emergency payload and clears previous failed attempts', async () => {
      // 1 wrong attempt
      await request(app).post(`/api/emergency/${pinShareToken}`).send({ pin: '111111' });

      // Correct attempt
      const res = await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .send({ pin: '987654' });

      expect(res.status).toBe(200);
      expect(res.body.ownerName).toBe('Dr. John Watson');
      expect(res.body.contacts.length).toBe(2);

      // Verify attempts reset in DB
      const dbLink = await ShareLink.findOne({ token: pinShareToken });
      expect(dbLink.pinAttempts).toBe(0);
    });

    test('Automatically resets pinAttempts when a temporary lock expires', async () => {
      // Simulate an expired lock in the database
      await ShareLink.updateOne(
        { token: pinShareToken },
        { pinAttempts: 5, lockedUntil: new Date(Date.now() - 5000) }
      );

      // Status check should now succeed and reset attempts in DB
      const statusRes = await request(app).get(`/api/emergency/${pinShareToken}`);
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.requiresPin).toBe(true);

      const dbLink = await ShareLink.findOne({ token: pinShareToken });
      expect(dbLink.pinAttempts).toBe(0);
      expect(dbLink.lockedUntil).toBeNull();

      // Entering correct PIN now succeeds immediately
      const res = await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .send({ pin: '987654' });
      expect(res.status).toBe(200);
      expect(res.body.ownerName).toBe('Dr. John Watson');
    });

    test('Expired lock on POST endpoint also resets attempts and allows correct PIN', async () => {
      // Set expired lock with 5 failed attempts
      await ShareLink.updateOne(
        { token: pinShareToken },
        { pinAttempts: 5, lockedUntil: new Date(Date.now() - 5000) }
      );

      // Attempting with correct PIN after expiry should reset and succeed
      const res = await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .send({ pin: '987654' });

      expect(res.status).toBe(200);
      expect(res.body.ownerName).toBe('Dr. John Watson');

      const dbLink = await ShareLink.findOne({ token: pinShareToken });
      expect(dbLink.pinAttempts).toBe(0);
      expect(dbLink.lockedUntil).toBeNull();
    });
  });

  describe('Access Counter & Timestamp Tracking (Item 20)', () => {
    test('Records access counter and lastAccessedAt without storing IP or User-Agent', async () => {
      // 1. Initial state: accessCount 0, lastAccessedAt null
      let link = await ShareLink.findOne({ token: normalShareToken });
      expect(link.accessCount).toBe(0);
      expect(link.lastAccessedAt).toBeNull();

      // 2. First public access via GET (normal link without PIN)
      const res1 = await request(app)
        .get(`/api/emergency/${normalShareToken}`)
        .set('User-Agent', 'Mozilla/5.0 EmergencyResponder')
        .set('X-Forwarded-For', '203.0.113.195');

      expect(res1.status).toBe(200);

      link = await ShareLink.findOne({ token: normalShareToken });
      expect(link.accessCount).toBe(1);
      expect(link.lastAccessedAt).toBeInstanceOf(Date);
      expect(Math.abs(Date.now() - link.lastAccessedAt.getTime())).toBeLessThan(5000);

      // Verify privacy: no IP or User-Agent logged on the document
      const rawDoc = link.toObject();
      expect(rawDoc.ip).toBeUndefined();
      expect(rawDoc.ipAddress).toBeUndefined();
      expect(rawDoc.userAgent).toBeUndefined();
      expect(rawDoc.ua).toBeUndefined();

      // 3. Second access via POST (PIN link with correct PIN)
      let pinLink = await ShareLink.findOne({ token: pinShareToken });
      expect(pinLink.accessCount).toBe(0);

      const res2 = await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .set('User-Agent', 'Paramedic Tablet')
        .set('X-Forwarded-For', '198.51.100.42')
        .send({ pin: '987654' });

      expect(res2.status).toBe(200);

      pinLink = await ShareLink.findOne({ token: pinShareToken });
      expect(pinLink.accessCount).toBe(1);
      expect(pinLink.lastAccessedAt).toBeInstanceOf(Date);

      // 4. Repeated access increments counter again
      await request(app)
        .post(`/api/emergency/${pinShareToken}`)
        .send({ pin: '987654' });

      pinLink = await ShareLink.findOne({ token: pinShareToken });
      expect(pinLink.accessCount).toBe(2);
    });
  });
});
