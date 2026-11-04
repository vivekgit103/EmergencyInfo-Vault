const request = require('supertest');
const app = require('../app');

describe('Instructions CRUD & Sensitive Data Guard', () => {
  let tokenUserA;
  let tokenUserB;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'instruction_a@example.com',
      password: 'password123'
    });
    tokenUserA = resA.body.token;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'instruction_b@example.com',
      password: 'password123'
    });
    tokenUserB = resB.body.token;
  });

  test('Valid instruction can be created and retrieved', async () => {
    const res = await request(app)
      .post('/api/instructions')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Asthma Inhaler',
        text: 'Inhaler is in the left bag pocket. Take 2 puffs in emergency.',
        showInEmergency: true
      });

    expect(res.status).toBe(201);
    expect(res.body.instruction.title).toBe('Asthma Inhaler');

    const listRes = await request(app)
      .get('/api/instructions')
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.instructions.length).toBe(1);
  });

  test('Rejects instructions exceeding character limits', async () => {
    const longTitle = 'A'.repeat(61);
    const longText = 'B'.repeat(301);

    const resTitle = await request(app)
      .post('/api/instructions')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: longTitle,
        text: 'Normal text'
      });

    expect(resTitle.status).toBe(400);

    const resText = await request(app)
      .post('/api/instructions')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Normal Title',
        text: longText
      });

    expect(resText.status).toBe(400);
  });

  describe('Sensitive-Data Guard Enforcement', () => {
    test('Rejects instruction containing formatted 12-digit ID number (Aadhaar format)', async () => {
      const res = await request(app)
        .post('/api/instructions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'My ID info',
          text: 'My government ID number is 1234 5678 9012 please check'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/sensitive data/i);
    });

    test('Rejects instruction containing continuous 12-digit number', async () => {
      const res = await request(app)
        .post('/api/instructions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'ID Number',
          text: 'National ID: 987654321098'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/sensitive data/i);
    });

    test('Rejects instruction containing 16-digit credit card number', async () => {
      const res = await request(app)
        .post('/api/instructions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Emergency card for expenses',
          text: 'Card details: 4111 2222 3333 4444'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/sensitive data/i);
    });

    test('Rejects instruction containing unformatted 16-digit number in title or text', async () => {
      const res = await request(app)
        .post('/api/instructions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Card 1234567890123456',
          text: 'Call bank'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/sensitive data/i);
    });

    test('Accepts valid safe instructions with harmless numbers (dosages, apartment, times)', async () => {
      const res = await request(app)
        .post('/api/instructions')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Medication Schedule',
          text: 'Take 2 pills of 500mg Metformin at 8:00 AM. Apartment number is 402B.'
        });

      expect(res.status).toBe(201);
    });
  });

  test('User Data Isolation: User B cannot edit or delete User A instruction', async () => {
    const createRes = await request(app)
      .post('/api/instructions')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Secret Info',
        text: 'Only for User A'
      });

    const instId = createRes.body.instruction._id;

    // User B tries to update
    const updateRes = await request(app)
      .put(`/api/instructions/${instId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ title: 'Tampered' });

    expect(updateRes.status).toBe(404);

    // User B tries to delete
    const deleteRes = await request(app)
      .delete(`/api/instructions/${instId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(deleteRes.status).toBe(404);
  });
});
