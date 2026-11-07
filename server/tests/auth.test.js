const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Auth Endpoints & Validation', () => {
  const validUserData = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123'
  };

  test('POST /api/auth/register fails when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('errors');
  });

  test('POST /api/auth/register fails when password is less than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'shortpass@example.com',
        password: 'short'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });

  test('POST /api/auth/register successfully registers new user and sets cookie, no token in body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUserData);

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'jane@example.com');
    expect(res.body.user).not.toHaveProperty('password');

    // Verify cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('token='))).toBe(true);

    // Verify password is encrypted in database
    const dbUser = await User.findOne({ email: 'jane@example.com' });
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBe('password123');
  });

  test('POST /api/auth/register rejects duplicate email address with 409', async () => {
    await request(app).post('/api/auth/register').send(validUserData);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validUserData);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/login fails with invalid credentials', async () => {
    await request(app).post('/api/auth/register').send(validUserData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('POST /api/auth/login succeeds with correct credentials and returns no token in body', async () => {
    await request(app).post('/api/auth/register').send(validUserData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('token');
    expect(res.body.user.email).toBe('jane@example.com');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('token='))).toBe(true);
  });

  test('GET /api/auth/me returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns user profile when authenticated via cookie', async () => {
    const regRes = await request(app).post('/api/auth/register').send(validUserData);
    const cookies = regRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('email', 'jane@example.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('GET /api/auth/me rejects Bearer token when no cookie is sent (cookie-only auth)', async () => {
    const jwt = require('jsonwebtoken');
    const { generateToken } = require('../utils/tokenUtils');
    const dbUser = await User.create({
      name: 'Bearer Test',
      email: 'bearer@example.com',
      password: 'password123'
    });
    const token = generateToken(dbUser._id);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/authentication required/i);
  });

  test('POST /api/auth/logout clears authentication cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
  });
});
