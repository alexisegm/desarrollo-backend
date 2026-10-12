// HTTP layer of the requests module: it extracts path, query, body and
// the authenticated actor, invokes the operation and answers. It contains
// no SQL and no domain rules — with ONE exception that the team inherited
// and nobody has dared to touch: the history handler grew until it did
// everything by itself. It works. Every test passes. And still, something
// is wrong with it — that is this week's conversation.

import express from 'express';
import { pool } from '../../database/pool.js';
import { AppError } from '../../app-error.js';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory
} from './requests.service.js';
import { parseIdParam } from '../../http/parse-id.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { status, priority } = req.query;
  res.status(200).json(await listRequests(req.auth, { status, priority }));
});

router.get('/:id', async (req, res) => {
  const id = parseIdParam(req.params.id);
  res.status(200).json(await getRequest(req.auth, id));
});

// ─────────────────────────────────────────────────────────────────────
// GET /:id/history — the handler that does EVERYTHING.
// HTTP, visibility rules, SQL, mapping and response, all in one place.
// Behavior is EXACTLY the class 06/07 contract (the tests prove it).
// Ask yourself: how many different reasons does this function have to
// change?
// ─────────────────────────────────────────────────────────────────────
router.get('/:id/history', async (req, res) => {
  const id = parseIdParam(req.params.id);
  const events = await getHistory(req.auth, id);
  res.status(200).json(events);
});

// TODO(FEATURE-801): POST /:id/claim — the new business action. Before
// wiring it here, decide WHERE each responsibility will live. The route's
// job is small: validate the id, read the authenticated actor, call the
// service, answer 200 with the result.

router.post('/', async (req, res) => {
  res.status(201).json(await createRequest(req.auth, req.body));
});

router.patch('/:id', async (req, res) => {
  const id = parseIdParam(req.params.id);
  res.status(200).json(await patchRequest(req.auth, id, req.body));
});

export default router;
