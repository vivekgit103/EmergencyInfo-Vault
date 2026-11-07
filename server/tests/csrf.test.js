const request = require('supertest');
const app = require('../app');

describe('CSRF Protection via X-Requested-With Header', () => {
  let cookie;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'CSRF Test User',
      email: 'csrf@example.com',
      password: 'password123'
    });
    cookie = res.headers['set-cookie'];
  });

  test('Rejects POST on owner route without X-Requested-With (403)', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookie)
      .send({
        name: 'Emergency Contact',
        relationship: 'Friend',
        phone: '+1-555-0100',
        priority: 'primary'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/X-Requested-With header required/i);
  });

  test('Rejects PUT on owner route without X-Requested-With (403)', async () => {
    const res = await request(app)
      .put('/api/contacts/507f1f77bcf86cd799439011')
      .set('Cookie', cookie)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/X-Requested-With header required/i);
  });

  test('Rejects DELETE on owner route without X-Requested-With (403)', async () => {
    const res = await request(app)
      .delete('/api/contacts/507f1f77bcf86cd799439011')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/X-Requested-With header required/i);
  });

  test('Allows safe GET requests without X-Requested-With header', async () => {
    const res = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
  });

  test('Accepts state-changing requests when X-Requested-With header is present', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookie)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        name: 'Emergency Contact',
        relationship: 'Friend',
        phone: '+1-555-0100',
        priority: 'primary'
      });

    expect(res.status).toBe(201);
    expect(res.body.contact).toBeDefined();
  });

  test('Rejects state-changing requests to instructions and share-links without X-Requested-With', async () => {
    const resInst = await request(app)
      .post('/api/instructions')
      .set('Cookie', cookie)
      .send({ title: 'Test', content: 'Notes', category: 'medical' });
    expect(resInst.status).toBe(403);

    const resLink = await request(app)
      .post('/api/share-links')
      .set('Cookie', cookie)
      .send({ label: 'First Responder' });
    expect(resLink.status).toBe(403);
  });
});
