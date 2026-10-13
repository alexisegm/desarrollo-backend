// API tests for FEATURE-801 — INCOMPLETE, on purpose. The behavior matrix
// of the claim, through HTTP. Convert each stub as the feature grows; use
// the existing helpers (unique data per run, cleanup of what you create).
import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, createRequestAs } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';

let agentToken;
let agentUser;
let requesterToken;

before(async () => {
  agentUser = await createUser({ name: 'claim_agent', role: 'agent' });
  agentToken = await loginAs(agentUser);

  const requesterUser = await createUser({ name: 'claim_requester' });
  requesterToken = await loginAs(requesterUser);
});

after(async () => {
  await cleanupCreatedData();
  await closePool();
});

test('claim requires authentication', async () => {
  const req = await createRequestAs(requesterToken);
  
  const response = await request(app)
    .post(`/requests/${req.id}/claim`)
    .send({});
  
  assert.equal(response.status, 401);
});

test('a requester cannot claim a request', async () => {
  const req = await createRequestAs(requesterToken);
  
  const response = await request(app)
    .post(`/requests/${req.id}/claim`)
    .set('Authorization', `Bearer ${requesterToken}`)
    .send({});
  
  assert.equal(response.status, 403);
});

test('an agent claims an open request: 200, assignedTo from the token, in_progress', async () => {
  const req = await createRequestAs(requesterToken);
  
  const response = await request(app)
    .post(`/requests/${req.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({});
  
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'in_progress');
  assert.equal(response.body.assignedTo, agentUser.id);
});

test('claiming a nonexistent request answers 404', async () => {
  const response = await request(app)
    .post(`/requests/999999999/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({});
  
  assert.equal(response.status, 404);
});

test('a second claim answers 409 REQUEST_ALREADY_ASSIGNED', async () => {
  const req = await createRequestAs(requesterToken);
  
  // First claim
  await request(app)
    .post(`/requests/${req.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({});
  
  // Second claim
  const response = await request(app)
    .post(`/requests/${req.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({});
  
  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, 'REQUEST_ALREADY_ASSIGNED');
  assert.ok(response.body.requestId); // Traceability contract
});

test('a terminal request cannot be claimed', async () => {
  const req = await createRequestAs(requesterToken);
  
  // Cancel it first
  await request(app)
    .patch(`/requests/${req.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ status: 'cancelled' });
  
  // Try to claim
  const response = await request(app)
    .post(`/requests/${req.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({});
  
  assert.equal(response.status, 409);
});

test('assignedTo in the body is rejected as a server-controlled field', async () => {
  const req = await createRequestAs(requesterToken);
  
  const response = await request(app)
    .post(`/requests/${req.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ assignedTo: 'some-other-uuid' });
  
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'SERVER_CONTROLLED_FIELD');
});

test('the claim leaves a request_claimed event in the history', async () => {
  const req = await createRequestAs(requesterToken);
  
  await request(app)
    .post(`/requests/${req.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({});
  
  const response = await request(app)
    .get(`/requests/${req.id}/history`)
    .set('Authorization', `Bearer ${agentToken}`);
  
  const claimEvent = response.body.find(e => e.type === 'request_claimed');
  
  assert.ok(claimEvent, 'Expected to find a request_claimed event in the history');
  assert.equal(claimEvent.fromStatus, 'open');
  assert.equal(claimEvent.toStatus, 'in_progress');
});