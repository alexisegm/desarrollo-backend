// HTTP layer of the requests module: it extracts path, query, body and
// the authenticated actor, invokes the operation, and translates results
// and typed errors into HTTP responses. It contains no SQL and no domain
// rules. The router assumes app.js mounted it behind `authenticate`, so
// req.auth is always present here.

import express from 'express';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory
} from './requests.service.js';
import { respondError } from '../../http/respond-error.js';
import { AppError } from '../../app-error.js';

const router = express.Router();

const ID_REGEX = /^[1-9]\d{0,17}$/;

function parseRequestId(rawId) {
  if (typeof rawId !== 'string' || !ID_REGEX.test(rawId)) {
    throw new AppError('contract', 'INVALID_REQUEST_ID', 'Request id must be a positive integer.');
  }
  return Number(rawId);
}

router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    res.status(200).json(await listRequests(req.auth, { status, priority }));
  } catch (error) {
    respondError(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseRequestId(req.params.id);
    res.status(200).json(await getRequest(req.auth, id));
  } catch (error) {
    respondError(res, error);
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const id = parseRequestId(req.params.id);
    res.status(200).json(await getHistory(req.auth, id));
  } catch (error) {
    respondError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await createRequest(req.auth, req.body));
  } catch (error) {
    respondError(res, error);
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = parseRequestId(req.params.id);
    res.status(200).json(await patchRequest(req.auth, id, req.body));
  } catch (error) {
    respondError(res, error);
  }
});

export default router;