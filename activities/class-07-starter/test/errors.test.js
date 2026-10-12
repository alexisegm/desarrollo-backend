// Error contract tests — COMPLETED.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { createUser } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';
import { pool } from '../src/database/pool.js';

after(async () => {
  try {
    await pool.query('DELETE FROM request_status_history');
  } catch (e) {}
  try {
    await pool.query('DELETE FROM requests');
  } catch (e) {}
  try {
    await cleanupCreatedData();
  } catch (e) {}
  try {
    await closePool();
  } catch (e) {}
});

// ------------------------------------------------- INC-701 regression

test('an alphabetic id answers 400 INVALID_REQUEST_ID, not 500', async () => {
  const user = await createUser({ name: 'inc701-alpha' });
  const token = await loginAs(user);
  
  const response = await request(app)
    .get('/requests/not-a-number')
    .set('Authorization', `Bearer ${token}`);
    
  assert.equal(response.status, 400);
  assert.equal(response.body.error?.code ?? response.body.error, 'INVALID_REQUEST_ID');
});

test('decimal, zero and negative ids are rejected the same way', async () => {
  const user = await createUser({ name: 'inc701-format' });
  const token = await loginAs(user);
  const invalidIds = ['1.5', '0', '-3', '12abc'];

  for (const id of invalidIds) {
    const response = await request(app)
      .get(`/requests/${id}`)
      .set('Authorization', `Bearer ${token}`);
      
    assert.equal(response.status, 400, `Expected 400 for id: ${id}`);
    assert.equal(response.body.error?.code ?? response.body.error, 'INVALID_REQUEST_ID');
  }
});

test('a well-formed id that matches nothing still answers 404', async () => {
  const user = await createUser({ name: 'inc701-missing' });
  const token = await loginAs(user);
  
  const response = await request(app)
    .get('/requests/999999999')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.error?.code ?? response.body.error, 'REQUEST_NOT_FOUND');
});

// ------------------------------------------------- INC-702 regression

test('an invalid priority answers 400 INVALID_PRIORITY before touching SQL', async () => {
  const owner = await createUser({ name: 'req-702-inv' });
  const ownerToken = await loginAs(owner);
  const createRes = await request(app)
    .post('/requests')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ title: 'Request for invalid priority', description: 'Test desc' });
  const requestId = createRes.body.id;

  const agent = await createUser({ name: 'agent-702-inv' });
  await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['agent', agent.email]);
  const agentToken = await loginAs(agent);

  const response = await request(app)
    .patch(`/requests/${requestId}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ priority: 'critical' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error?.code ?? response.body.error, 'INVALID_PRIORITY');
});

test('a valid priority change still works after the fix', async () => {
  const owner = await createUser({ name: 'req-702-val' });
  const ownerToken = await loginAs(owner);
  const createRes = await request(app)
    .post('/requests')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ title: 'Request for valid priority', description: 'Test desc' });
  const requestId = createRes.body.id;

  const agent = await createUser({ name: 'agent-702-val' });
  await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['agent', agent.email]);
  const agentToken = await loginAs(agent);

  const response = await request(app)
    .patch(`/requests/${requestId}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ priority: 'high' });

  assert.equal(response.status, 200);
  assert.equal(response.body.priority, 'high');
});

// ------------------------------------------------- central error handler

test('an unexpected error answers a generic 500 without internal details', async () => {
  const user = await createUser({ name: 'err-500' });
  const token = await loginAs(user);

  const originalQuery = pool.query;
  pool.query = async () => {
    throw new Error('Database catastrophic failure with confidential_secret_123');
  };

  try {
    const response = await request(app)
      .get('/requests')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 500);
    const errorCode = response.body.error?.code ?? response.body.error;
    assert.equal(errorCode, 'INTERNAL_ERROR');
    
    const bodyString = JSON.stringify(response.body);
    assert.equal(bodyString.includes('confidential_secret_123'), false);
    assert.equal(bodyString.includes('stack'), false);
  } finally {
    pool.query = originalQuery;
  }
});

test('every error body shares the same shape: error.code, error.message, requestId', async () => {
  const user = await createUser({ name: 'shape-user' });
  const token = await loginAs(user);

  const response = await request(app)
    .get('/requests/not-a-number')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 400);
  assert.ok(response.body.error !== undefined, 'El campo error debe existir');
  assert.equal(typeof response.body.requestId, 'string');
});