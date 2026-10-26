import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { setupTestDB, teardownTestDB, clearDatabase } from './setup.js';

before(async () => {
  await setupTestDB();
});

after(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
});

test('Auth: should register a new user successfully', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Jane Doe',
      email: 'jane@campus.edu',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.user.name, 'Jane Doe');
  assert.equal(res.body.user.email, 'jane@campus.edu');
  assert.equal(res.body.user.role, 'user');

  // Verify password is not exposed
  assert.equal(res.body.user.passwordHash, undefined);

  // Verify stored password in DB is hashed
  const storedUser = await User.findOne({ email: 'jane@campus.edu' }).select('+passwordHash');
  assert.ok(storedUser.passwordHash !== 'SecurePassword123!');
});

test('Auth: should prevent registration with duplicate email', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Original User',
      email: 'test@campus.edu',
      password: 'Password123!'
    });

  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Duplicate User',
      email: 'test@campus.edu',
      password: 'Password123!'
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /already exists/i);
});

test('Auth: should fail registration when passwords do not match or fields invalid', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'J',
      email: 'invalid-email',
      password: '123',
      confirmPassword: '456'
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('Auth: should login existing user and reject invalid credentials', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Login Tester',
      email: 'tester@campus.edu',
      password: 'ValidPassword123!'
    });

  // Valid login
  const validRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'tester@campus.edu',
      password: 'ValidPassword123!'
    });

  assert.equal(validRes.status, 200);
  assert.equal(validRes.body.success, true);
  assert.ok(validRes.body.token);

  // Invalid password
  const invalidRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'tester@campus.edu',
      password: 'WrongPassword'
    });

  assert.equal(invalidRes.status, 401);
  assert.equal(invalidRes.body.success, false);
});

test('Auth: should access protected /api/auth/me with token and block request without token', async () => {
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Token Tester',
      email: 'tokentester@campus.edu',
      password: 'ValidPassword123!'
    });

  const token = regRes.body.token;

  // Unauthenticated request
  const unauthRes = await request(app).get('/api/auth/me');
  assert.equal(unauthRes.status, 401);

  // Authenticated request
  const authRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(authRes.status, 200);
  assert.equal(authRes.body.user.email, 'tokentester@campus.edu');
});
