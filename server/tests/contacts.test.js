const request = require('supertest');
const app = require('../app');

describe('Emergency Contacts CRUD & Isolation', () => {
  let cookieUserA;
  let cookieUserB;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'password123'
    });
    cookieUserA = resA.headers['set-cookie'];

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'password123'
    });
    cookieUserB = resB.headers['set-cookie'];
  });

  test('Accessing contacts requires authentication (401)', async () => {
    const res = await request(app).get('/api/contacts');
    expect(res.status).toBe(401);
  });

  test('User A can create and retrieve contacts sorted by priority', async () => {
    // Create Secondary Contact
    await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUserA)
      .send({
        name: 'Dr. Smith',
        relationship: 'Doctor',
        phone: '+1-555-0199',
        priority: 'secondary',
        showInEmergency: true
      });

    // Create Primary Contact
    await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUserA)
      .send({
        name: 'Jane Spouse',
        relationship: 'Spouse',
        phone: '+1-555-0100',
        priority: 'primary',
        showInEmergency: true
      });

    const res = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserA);

    expect(res.status).toBe(200);
    expect(res.body.contacts.length).toBe(2);
    // Primary contact should be sorted first
    expect(res.body.contacts[0].priority).toBe('primary');
    expect(res.body.contacts[1].priority).toBe('secondary');
  });

  test('Contact validation rejects invalid phone numbers', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUserA)
      .send({
        name: 'Invalid Contact',
        relationship: 'Friend',
        phone: 'invalid-letters'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.field === 'phone')).toBe(true);
  });

  test('User A can update and delete their own contact', async () => {
    const createRes = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUserA)
      .send({
        name: 'Original Name',
        relationship: 'Friend',
        phone: '+1-555-0111'
      });

    const contactId = createRes.body.contact._id;

    // Update
    const updateRes = await request(app)
      .put(`/api/contacts/${contactId}`)
      .set('Cookie', cookieUserA)
      .send({
        name: 'Updated Name',
        relationship: 'Best Friend',
        phone: '+1-555-0122'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.contact.name).toBe('Updated Name');

    // Delete
    const deleteRes = await request(app)
      .delete(`/api/contacts/${contactId}`)
      .set('Cookie', cookieUserA);

    expect(deleteRes.status).toBe(200);

    // Verify gone
    const listRes = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserA);

    expect(listRes.body.contacts.length).toBe(0);
  });

  test('User Data Isolation: User B cannot view, edit, or delete User A contacts', async () => {
    // User A creates contact
    const createRes = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUserA)
      .send({
        name: 'User A Secret Contact',
        relationship: 'Confidant',
        phone: '+1-555-0155'
      });

    const contactId = createRes.body.contact._id;

    // User B lists contacts - should be empty
    const listB = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserB);

    expect(listB.body.contacts.length).toBe(0);

    // User B tries to update User A contact - should return 404
    const updateB = await request(app)
      .put(`/api/contacts/${contactId}`)
      .set('Cookie', cookieUserB)
      .send({ name: 'Hacked by B' });

    expect(updateB.status).toBe(404);

    // User B tries to delete User A contact - should return 404
    const deleteB = await request(app)
      .delete(`/api/contacts/${contactId}`)
      .set('Cookie', cookieUserB);

    expect(deleteB.status).toBe(404);

    // Contact still exists under User A
    const listA = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserA);

    expect(listA.body.contacts.length).toBe(1);
    expect(listA.body.contacts[0].name).toBe('User A Secret Contact');
  });
});
