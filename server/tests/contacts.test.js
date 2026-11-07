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
      .set('X-Requested-With', 'XMLHttpRequest')
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
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        name: 'Jane Spouse',
        relationship: 'Spouse',
        phone: '+1-555-0100',
        priority: 'primary',
        showInEmergency: true
      });

    const res = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest');

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
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        name: 'Invalid Contact',
        relationship: 'Friend',
        phone: 'invalid-letters'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.some(e => e.field === 'phone')).toBe(true);
  });

  describe('Contact Sensitive-Data Guard', () => {
    test('Rejects contact name containing 12-digit national ID (1234 5678 9012)', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Cookie', cookieUserA)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          name: 'Jane 1234 5678 9012',
          relationship: 'Sister',
          phone: '+1-555-0100'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/sensitive data/i);
    });

    test('Rejects contact relationship containing real credit card number', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Cookie', cookieUserA)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          name: 'John Doe',
          relationship: 'Card 4111 1111 1111 1111',
          phone: '+1-555-0100'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/sensitive data/i);
    });

    test('Does NOT reject two phone numbers in contact information', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Cookie', cookieUserA)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          name: 'Alice 9876543210 9123456789',
          relationship: 'Colleague',
          phone: '+1-555-0199'
        });

      expect(res.status).toBe(201);
      expect(res.body.contact).toBeDefined();
    });
  });

  test('User A can update and delete their own contact', async () => {
    const createRes = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
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
      .set('X-Requested-With', 'XMLHttpRequest')
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
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(deleteRes.status).toBe(200);

    // Verify gone
    const listRes = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(listRes.body.contacts.length).toBe(0);
  });

  test('User Data Isolation: User B cannot view, edit, or delete User A contacts', async () => {
    // User A creates contact
    const createRes = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        name: 'User A Secret Contact',
        relationship: 'Confidant',
        phone: '+1-555-0155'
      });

    const contactId = createRes.body.contact._id;

    // User B lists contacts - should be empty
    const listB = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserB)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(listB.body.contacts.length).toBe(0);

    // User B tries to update User A contact - should return 404
    const updateB = await request(app)
      .put(`/api/contacts/${contactId}`)
      .set('Cookie', cookieUserB)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ name: 'Hacked by B' });

    expect(updateB.status).toBe(404);

    // User B tries to delete User A contact - should return 404
    const deleteB = await request(app)
      .delete(`/api/contacts/${contactId}`)
      .set('Cookie', cookieUserB)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(deleteB.status).toBe(404);

    // Contact still exists under User A
    const listA = await request(app)
      .get('/api/contacts')
      .set('Cookie', cookieUserA)
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(listA.body.contacts.length).toBe(1);
    expect(listA.body.contacts[0].name).toBe('User A Secret Contact');
  });
});
