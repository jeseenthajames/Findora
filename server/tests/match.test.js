import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, teardownTestDB, clearDatabase } from './setup.js';
import { calculateItemMatch } from '../src/utils/matchAlgorithm.js';

let userToken;

before(async () => {
  await setupTestDB();
});

after(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();

  const user = await request(app).post('/api/auth/register').send({
    name: 'Matcher User',
    email: 'matcher@campus.edu',
    password: 'Password123!'
  });
  userToken = user.body.token;
});

test('Matching Algorithm: should accurately calculate score and explainable reasons', () => {
  const lostItem = {
    title: 'Lost Blue Hydro Flask Water Bottle',
    category: 'Bottles & Containers',
    description: 'Cobalt blue 32oz bottle with national park stickers.',
    location: 'Main University Library 3rd Floor',
    eventDate: new Date('2026-10-20')
  };

  const foundItem = {
    title: 'Found Blue Hydro Flask with Stickers',
    category: 'Bottles & Containers',
    description: 'Blue insulated water flask found near study tables.',
    location: 'Main University Library Quiet Area',
    eventDate: new Date('2026-10-21')
  };

  const result = calculateItemMatch(lostItem, foundItem);

  assert.ok(result.score >= 60, `Expected score >= 60, got ${result.score}`);
  assert.equal(result.matchStrength, 'High');
  assert.ok(result.reasons.some((r) => r.includes('Matching category')));
  assert.ok(result.reasons.some((r) => r.includes('hydro') || r.includes('flask') || r.includes('blue')));
});

test('Matching Endpoint: should return scored candidate matches via GET /api/items/:id/matches', async () => {
  // Create lost item
  const lostRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Lost Dell XPS Laptop Charger',
      category: 'Electronics',
      description: 'Black Dell 130W USB-C charger adapter.',
      reportType: 'lost',
      location: 'Engineering Building Room 301',
      eventDate: new Date().toISOString()
    });

  const lostId = lostRes.body.data._id;

  // Create a matching found item
  await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Found Dell USB-C Laptop Charger',
      category: 'Electronics',
      description: 'Found black laptop power supply cord.',
      reportType: 'found',
      location: 'Engineering Building Hallway',
      eventDate: new Date().toISOString()
    });

  // Create an un-related found item
  await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Found Pink Umbrella',
      category: 'Clothing & Accessories',
      description: 'Floral umbrella.',
      reportType: 'found',
      location: 'Campus Gym',
      eventDate: new Date().toISOString()
    });

  const matchRes = await request(app).get(`/api/items/${lostId}/matches`);

  assert.equal(matchRes.status, 200);
  assert.equal(matchRes.body.success, true);
  assert.ok(matchRes.body.data.length >= 1);
  assert.equal(matchRes.body.data[0].item.category, 'Electronics');
  assert.ok(matchRes.body.data[0].score > 30);
  assert.ok(matchRes.body.data[0].reasons.length > 0);
});
