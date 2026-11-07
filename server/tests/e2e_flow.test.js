const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Instruction = require('../models/Instruction');
const ShareLink = require('../models/ShareLink');

describe('Full End-to-End User Flow', () => {
  test('Complete lifecycle: Register -> Login -> CRUD Contacts/Instructions -> Toggle Visibility -> Share Links (PIN & Expiry) -> Responder View -> Cascade Account Deletion', async () => {
    // 1. Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Rivera',
        email: 'jordan@example.com',
        password: 'SecurePassword123!'
      });
    expect(regRes.status).toBe(201);
    expect(regRes.body).not.toHaveProperty('token');
    const authCookie = regRes.headers['set-cookie'];
    expect(authCookie).toBeDefined();

    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jordan@example.com',
        password: 'SecurePassword123!'
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).not.toHaveProperty('token');
    expect(loginRes.body.user.email).toBe('jordan@example.com');
    const sessionCookie = loginRes.headers['set-cookie'];

    // 3. Add Primary Contact
    const contact1Res = await request(app)
      .post('/api/contacts')
      .set('Cookie', sessionCookie)
      .send({
        name: 'Morgan Rivera',
        relationship: 'Spouse',
        phone: '+1-555-0199',
        priority: 'primary',
        showInEmergency: true
      });
    expect(contact1Res.status).toBe(201);
    const contact1Id = contact1Res.body.contact._id;

    // Add Secondary Contact
    const contact2Res = await request(app)
      .post('/api/contacts')
      .set('Cookie', sessionCookie)
      .send({
        name: 'Dr. Evelyn Reed',
        relationship: 'Cardiologist',
        phone: '+1-555-0144',
        priority: 'secondary',
        showInEmergency: true
      });
    expect(contact2Res.status).toBe(201);

    // 4. Add Instruction
    const instRes = await request(app)
      .post('/api/instructions')
      .set('Cookie', sessionCookie)
      .send({
        title: 'Heart Medication',
        text: 'Takes 10mg Lisinopril daily. Water bottle in gym bag.',
        showInEmergency: true
      });
    expect(instRes.status).toBe(201);
    const instId = instRes.body.instruction._id;

    // 5. Sensitive data guard test
    const sensitiveRes = await request(app)
      .post('/api/instructions')
      .set('Cookie', sessionCookie)
      .send({
        title: 'Forbidden ID',
        text: 'My ID is 9876 5432 1098'
      });
    expect(sensitiveRes.status).toBe(400);
    expect(sensitiveRes.body.message).toMatch(/sensitive data/i);

    // 6. Toggle Visibility
    const toggleRes = await request(app)
      .put(`/api/contacts/${contact1Id}`)
      .set('Cookie', sessionCookie)
      .send({ showInEmergency: false });
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.contact.showInEmergency).toBe(false);

    // Toggle it back to true
    await request(app)
      .put(`/api/contacts/${contact1Id}`)
      .set('Cookie', sessionCookie)
      .send({ showInEmergency: true });

    // 7. Generate Share Link with 24h expiry
    const linkRes = await request(app)
      .post('/api/share-links')
      .set('Cookie', sessionCookie)
      .send({ expiry: '24h' });
    expect(linkRes.status).toBe(201);
    const publicToken = linkRes.body.shareLink.token;
    const linkId = linkRes.body.shareLink._id;

    // 8. Open /e/:token in a logged-out state (no auth header, no cookies)
    const publicRes = await request(app)
      .post(`/api/emergency/${publicToken}`)
      .send({});
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.ownerName).toBe('Jordan Rivera');
    expect(publicRes.body.contacts.length).toBe(2);
    // Verified sorted by priority
    expect(publicRes.body.contacts[0].priority).toBe('primary');
    expect(publicRes.body.contacts[1].priority).toBe('secondary');
    expect(publicRes.body.instructions.length).toBe(1);

    // 9. Revoke share link
    const revokeRes = await request(app)
      .delete(`/api/share-links/${linkId}`)
      .set('Cookie', sessionCookie);
    expect(revokeRes.status).toBe(200);

    // Try opening revoked link logged-out
    const revokedViewRes = await request(app)
      .post(`/api/emergency/${publicToken}`)
      .send({});
    expect(revokedViewRes.status).toBe(403);
    expect(revokedViewRes.body.message).toMatch(/revoked/i);

    // 10. Generate link with PIN
    const pinLinkRes = await request(app)
      .post('/api/share-links')
      .set('Cookie', sessionCookie)
      .send({ expiry: '7d', pin: '8899' });
    const pinToken = pinLinkRes.body.shareLink.token;

    // Access without PIN -> 401
    const noPinRes = await request(app).post(`/api/emergency/${pinToken}`).send({});
    expect(noPinRes.status).toBe(401);
    expect(noPinRes.body.requiresPin).toBe(true);

    // Access with wrong PIN -> 401
    const wrongPinRes = await request(app).post(`/api/emergency/${pinToken}`).send({ pin: '0000' });
    expect(wrongPinRes.status).toBe(401);
    expect(wrongPinRes.body.remainingAttempts).toBe(4);

    // Access with correct PIN -> 200
    const correctPinRes = await request(app).post(`/api/emergency/${pinToken}`).send({ pin: '8899' });
    expect(correctPinRes.status).toBe(200);
    expect(correctPinRes.body.ownerName).toBe('Jordan Rivera');

    // 11. Delete Account Cascade
    const deleteAccRes = await request(app)
      .delete('/api/account')
      .set('Cookie', sessionCookie)
      .send({ password: 'SecurePassword123!' });
    expect(deleteAccRes.status).toBe(200);

    // Verify database completely clean for this user
    const userDoc = await User.findOne({ email: 'jordan@example.com' });
    expect(userDoc).toBeNull();
    const contactsCount = await Contact.countDocuments({ name: 'Morgan Rivera' });
    expect(contactsCount).toBe(0);
    const instCount = await Instruction.countDocuments({ title: 'Heart Medication' });
    expect(instCount).toBe(0);
    const linksCount = await ShareLink.countDocuments({ token: pinToken });
    expect(linksCount).toBe(0);
  });
});
