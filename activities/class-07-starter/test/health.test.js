// Health and readiness tests — COMPLETED.
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
import app from '../src/app.js';
import { createHealthRouter } from '../src/modules/health/health.routes.js';

test('GET /health answers 200 ok without touching PostgreSQL', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('GET /ready answers 200 when PostgreSQL responds', async () => {
  const response = await request(app).get('/ready');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ready', database: 'available' });
});

test('GET /ready answers 503 when the database check fails', async () => {
  const failingRouter = createHealthRouter({
    checkDatabase: async () => {
      throw new Error('Database connection failed');
    }
  });
  
  const testApp = express();
  testApp.use(failingRouter);

  const response = await request(testApp).get('/ready');
  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: 'not_ready', database: 'unavailable' });
});

test('the readiness response never reveals connection details', async () => {
  const sensitiveUri = 'postgres://admin:superSecretPassword123@db.internal:5432/prod_db';
  const failingRouter = createHealthRouter({
    checkDatabase: async () => {
      throw new Error(`Failed to connect to ${sensitiveUri}`);
    }
  });

  const testApp = express();
  testApp.use(failingRouter);

  const response = await request(testApp).get('/ready');
  assert.equal(response.status, 503);

  const bodyString = JSON.stringify(response.body);
  assert.equal(bodyString.includes('superSecretPassword123'), false);
  assert.equal(bodyString.includes('db.internal'), false);
});