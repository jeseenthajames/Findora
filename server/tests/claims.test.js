import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, teardownTestDB, clearDatabase } from './setup.js';

let finderToken;
let claimantToken;
let claimant2Token;
let foundItemId;

before(async () => {
  await setupTestDB();
});

after(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();

  // Finder (User 1)
  const finder = await request(app).post('/api/auth/register').send({
    name: 'Finder User',
    email: 'finder@campus.edu',
    password: 'Password123!'
  });
  finderToken = finder.body.token;

  // Claimant 1 (User 2)
  const claimant = await request(app).post('/api/auth/register').send({
    name: 'Claimant One',
    email: 'claimant1@campus.edu',
    password: 'Password123!'
  });
  claimantToken = claimant.body.token;

  // Claimant 2 (User 3)
  const claimant2 = await request(app).post('/api/auth/register').send({
    name: 'Claimant Two',
    email: 'claimant2@campus.edu',
    password: 'Password123!'
  });
  claimant2Token = claimant2.body.token;

  // Finder creates a found item
  const itemRes = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${finderToken}`)
    .send({
      title: 'Found Apple Watch Series 8',
      category: 'Electronics',
      description: 'Found on locker room bench with sport loop band.',
      reportType: 'found',
      location: 'Athletic Center',
      eventDate: new Date().toISOString()
    });

  foundItemId = itemRes.body.data._id;
});

test('Claims: should create claim request for found item', async () => {
  const claimRes = await request(app)
    .post(`/api/claims/${foundItemId}`)
    .set('Authorization', `Bearer ${claimantToken}`)
    .send({
      message: 'This is my watch. It has an engraving on the back that says Alex 2023.'
    });

  assert.equal(claimRes.status, 201);
  assert.equal(claimRes.body.success, true);
  assert.equal(claimRes.body.data.status, 'pending');

  // Verify item status updated to claim_pending
  const itemRes = await request(app).get(`/api/items/${foundItemId}`);
  assert.equal(itemRes.body.data.status, 'claim_pending');
});

test('Claims: should prevent finder from claiming their own found item', async () => {
  const selfClaim = await request(app)
    .post(`/api/claims/${foundItemId}`)
    .set('Authorization', `Bearer ${finderToken}`)
    .send({
      message: 'I found this but I want to claim it.'
    });

  assert.equal(selfClaim.status, 400);
  assert.match(selfClaim.body.message, /cannot submit a claim for an item you reported/i);
});

test('Claims: should prevent duplicate pending claims from the same user', async () => {
  await request(app)
    .post(`/api/claims/${foundItemId}`)
    .set('Authorization', `Bearer ${claimantToken}`)
    .send({
      message: 'This is my watch with the engraving.'
    });

  // Second claim attempt by same user
  const dupClaim = await request(app)
    .post(`/api/claims/${foundItemId}`)
    .set('Authorization', `Bearer ${claimantToken}`)
    .send({
      message: 'I am sending another claim for the same watch.'
    });

  assert.equal(dupClaim.status, 400);
  assert.match(dupClaim.body.message, /already have a pending claim/i);
});

test('Claims: should prevent unauthorized user from approving claim', async () => {
  const claimRes = await request(app)
    .post(`/api/claims/${foundItemId}`)
    .set('Authorization', `Bearer ${claimantToken}`)
    .send({
      message: 'This is my watch with the engraving.'
    });

  const claimId = claimRes.body.data._id;

  // Claimant 2 attempts to approve Claimant 1's claim (neither is finder nor admin)
  const unauthApproval = await request(app)
    .patch(`/api/claims/${claimId}/approve`)
    .set('Authorization', `Bearer ${claimant2Token}`);

  assert.equal(unauthApproval.status, 403);
});

test('Claims: should allow finder to approve claim and resolve item', async () => {
  const claim1Res = await request(app)
    .post(`/api/claims/${foundItemId}`)
    .set('Authorization', `Bearer ${claimantToken}`)
    .send({
      message: 'This is my watch with the engraving.'
    });

  const claim2Res = await request(app)
    .post(`/api/claims/${foundItemId}`)
    .set('Authorization', `Bearer ${claimant2Token}`)
    .send({
      message: 'No, this watch is mine, blue sport loop.'
    });

  const claim1Id = claim1Res.body.data._id;
  const claim2Id = claim2Res.body.data._id;

  // Finder approves Claim 1
  const approvalRes = await request(app)
    .patch(`/api/claims/${claim1Id}/approve`)
    .set('Authorization', `Bearer ${finderToken}`);

  assert.equal(approvalRes.status, 200);
  assert.equal(approvalRes.body.data.status, 'approved');

  // Verify item is now resolved
  const resolvedItem = await request(app).get(`/api/items/${foundItemId}`);
  assert.equal(resolvedItem.body.data.status, 'resolved');
  assert.ok(resolvedItem.body.data.resolvedAt);

  // Verify claimant 2's claim was automatically rejected
  const incomingClaims = await request(app)
    .get('/api/claims/incoming')
    .set('Authorization', `Bearer ${finderToken}`);

  const claim2 = incomingClaims.body.data.find((c) => String(c._id) === String(claim2Id));
  assert.equal(claim2.status, 'rejected');
});
