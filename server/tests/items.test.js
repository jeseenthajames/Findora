import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, teardownTestDB, clearDatabase } from './setup.js';

let userToken1;
let userToken2;

before(async () => {
  await setupTestDB();
});

after(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();

  // Create User 1
  const u1 = await request(app).post('/api/auth/register').send({
    name: 'Alice User',
    email: 'alice@campus.edu',
    password: 'Password123!'
  });
  userToken1 = u1.body.token;

  // Create User 2
  const u2 = await request(app).post('/api/auth/register').send({
    name: 'Bob User',
    email: 'bob@campus.edu',
    password: 'Password123!'
  });
  userToken2 = u2.body.token;
});

test('Items: should create lost and found item reports', async () => {
  const lostRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'Lost Campus ID Card',
      category: 'ID Cards & Documents',
      description: 'Lost my red lanyard with student ID card.',
      reportType: 'lost',
      location: 'Library 2nd Floor',
      eventDate: new Date().toISOString()
    });

  assert.equal(lostRes.status, 201);
  assert.equal(lostRes.body.success, true);
  assert.equal(lostRes.body.data.title, 'Lost Campus ID Card');
  assert.equal(lostRes.body.data.status, 'open');

  const foundRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken2}`)
    .send({
      title: 'Found Metal Water Bottle',
      category: 'Bottles & Containers',
      description: 'Found a silver insulated water bottle.',
      reportType: 'found',
      location: 'Cafeteria Table 4',
      eventDate: new Date().toISOString()
    });

  assert.equal(foundRes.status, 201);
  assert.equal(foundRes.body.data.reportType, 'found');
});

test('Items: should reject invalid item report creation', async () => {
  const invalidRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'No', // Too short
      category: 'InvalidCategory',
      description: 'Bad',
      reportType: 'not-valid'
    });

  assert.equal(invalidRes.status, 400);
  assert.equal(invalidRes.body.success, false);
});

test('Items: should filter and search items', async () => {
  await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'Blue Mathematics Textbook',
      category: 'Books & Stationery',
      description: 'Calculus early transcendentals book.',
      reportType: 'lost',
      location: 'Math Building 101',
      eventDate: new Date().toISOString()
    });

  await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken2}`)
    .send({
      title: 'Green Umbrella',
      category: 'Clothing & Accessories',
      description: 'Small folding umbrella with checked pattern.',
      reportType: 'found',
      location: 'Gymnasium Lobby',
      eventDate: new Date().toISOString()
    });

  // Filter by reportType lost
  const lostList = await request(app).get('/api/items?reportType=lost');
  assert.equal(lostList.status, 200);
  assert.equal(lostList.body.data.length, 1);
  assert.equal(lostList.body.data[0].title, 'Blue Mathematics Textbook');

  // Search by keyword
  const searchList = await request(app).get('/api/items?search=Umbrella');
  assert.equal(searchList.status, 200);
  assert.equal(searchList.body.data.length, 1);
  assert.equal(searchList.body.data[0].title, 'Green Umbrella');
});

test('Items: should prevent unauthorized user from updating another user report', async () => {
  const createRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'Original Title',
      category: 'Keys',
      description: 'House and bike keys.',
      reportType: 'lost',
      location: 'Student Union',
      eventDate: new Date().toISOString()
    });

  const itemId = createRes.body.data._id;

  // Bob (user 2) tries to edit Alice's report
  const unauthorizedEdit = await request(app)
    .put(`/api/items/${itemId}`)
    .set('Authorization', `Bearer ${userToken2}`)
    .send({
      title: 'Hacked Title'
    });

  assert.equal(unauthorizedEdit.status, 403);

  // Alice (user 1) edits her own report
  const authorizedEdit = await request(app)
    .put(`/api/items/${itemId}`)
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'Updated Alice Keys'
    });

  assert.equal(authorizedEdit.status, 200);
  assert.equal(authorizedEdit.body.data.title, 'Updated Alice Keys');
});

test('Items: should mark item as resolved', async () => {
  const createRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken1}`)
    .send({
      title: 'Laptop Charger',
      category: 'Electronics',
      description: 'USB-C 65W white charger.',
      reportType: 'lost',
      location: 'Study Hall',
      eventDate: new Date().toISOString()
    });

  const itemId = createRes.body.data._id;

  const resolveRes = await request(app)
    .patch(`/api/items/${itemId}/resolve`)
    .set('Authorization', `Bearer ${userToken1}`);

  assert.equal(resolveRes.status, 200);
  assert.equal(resolveRes.body.data.status, 'resolved');
  assert.ok(resolveRes.body.data.resolvedAt);
});
