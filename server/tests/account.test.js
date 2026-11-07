const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Instruction = require('../models/Instruction');
const ShareLink = require('../models/ShareLink');

describe('Account Deletion & Data Cascade', () => {
  let authCookie;
  let userId;

  beforeEach(async () => {
    // Register user
    const res = await request(app).post('/api/auth/register').send({
      name: 'Account To Delete',
      email: 'delete_me@example.com',
      password: 'password123'
    });
    authCookie = res.headers['set-cookie'];
    userId = res.body.user.id;

    // Create a contact
    await request(app)
      .post('/api/contacts')
      .set('Cookie', authCookie)
      .send({
        name: 'Contact to delete',
        relationship: 'Friend',
        phone: '+1-555-0199'
      });

    // Create an instruction
    await request(app)
      .post('/api/instructions')
      .set('Cookie', authCookie)
      .send({
        title: 'Instruction to delete',
        text: 'This should be wiped out completely.'
      });

    // Create a share link
    await request(app)
      .post('/api/share-links')
      .set('Cookie', authCookie)
      .send({ expiry: '24h' });
  });

  test('DELETE /api/account fails without password confirmation', async () => {
    const res = await request(app)
      .delete('/api/account')
      .set('Cookie', authCookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/validation/i);
  });

  test('DELETE /api/account fails with incorrect password', async () => {
    const res = await request(app)
      .delete('/api/account')
      .set('Cookie', authCookie)
      .send({ password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/incorrect password/i);
  });

  test('DELETE /api/account cascades and permanently deletes user and all data', async () => {
    // Confirm data exists before deletion
    expect(await Contact.countDocuments({ userId })).toBe(1);
    expect(await Instruction.countDocuments({ userId })).toBe(1);
    expect(await ShareLink.countDocuments({ userId })).toBe(1);
    expect(await User.countDocuments({ _id: userId })).toBe(1);

    // Perform deletion with correct password
    const res = await request(app)
      .delete('/api/account')
      .set('Cookie', authCookie)
      .send({ password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/permanently deleted/i);

    // Verify all associated data has been wiped
    expect(await Contact.countDocuments({ userId })).toBe(0);
    expect(await Instruction.countDocuments({ userId })).toBe(0);
    expect(await ShareLink.countDocuments({ userId })).toBe(0);
    expect(await User.countDocuments({ _id: userId })).toBe(0);

    // Cookie is cleared
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
  });
});
