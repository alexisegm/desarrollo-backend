// Policy tests — INCOMPLETE, on purpose. This is the payoff of the whole
// class: once canClaimRequest depends on nothing, its entire behavior
// matrix runs here with plain objects. No HTTP. No PostgreSQL. No server.
//
// Convert each stub as you implement the policy. Look at the matrix in
// the FEATURE-801 brief: every row becomes one assertion.
import test from 'node:test';
import assert from 'node:assert/strict';
import { canClaimRequest } from '../src/modules/requests/request.policy.js';

// Mock actors and requests for the tests
const agent = { role: 'agent' };
const requester = { role: 'requester' };
const openUnassigned = { status: 'open', assignedTo: null };
const openAssigned = { status: 'open', assignedTo: 'uuid-1234' };

test('an agent can claim an open, unassigned request', () => {
  const result = canClaimRequest({ actor: agent, request: openUnassigned });
  assert.deepEqual(result, { allowed: true });
});

test('a requester cannot claim, even an open request', () => {
  const result = canClaimRequest({ actor: requester, request: openUnassigned });
  assert.deepEqual(result, { allowed: false, reason: 'NOT_AGENT' });
});

test('an already assigned request cannot be claimed again', () => {
  const result = canClaimRequest({ actor: agent, request: openAssigned });
  assert.deepEqual(result, { allowed: false, reason: 'ALREADY_ASSIGNED' });
});

test('a request that is not open cannot be claimed', () => {
  const invalidStatuses = ['in_progress', 'resolved', 'closed', 'cancelled'];
  
  for (const status of invalidStatuses) {
    const request = { status, assignedTo: null };
    const result = canClaimRequest({ actor: agent, request });
    assert.deepEqual(result, { allowed: false, reason: 'NOT_OPEN' });
  }
});

test('the role rule wins over the state rules', () => {
  // requester + assigned request -> the reported reason is NOT_AGENT.
  // (The caller answers 403 before any state conflict.)
  const result = canClaimRequest({ actor: requester, request: openAssigned });
  assert.deepEqual(result, { allowed: false, reason: 'NOT_AGENT' });
});