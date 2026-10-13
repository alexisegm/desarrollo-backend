// HTTP layer of the requests module...
import express from 'express';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory,
  claimRequest
} from './requests.service.js';
import { parseIdParam } from '../../http/parse-id.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    res.status(200).json(await listRequests(req.auth, { status, priority }));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    res.status(200).json(await getRequest(req.auth, id));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/history', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    const events = await getHistory(req.auth, id);
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
});

// FEATURE-801: POST /:id/claim
router.post('/:id/claim', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    res.status(200).json(await claimRequest(req.auth, id, req.body));
  } catch (err) {
    next(err);
  }
});

// Ruta POST / para crear solicitudes (esta era la que daba 404)
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await createRequest(req.auth, req.body));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseIdParam(req.params.id);
    res.status(200).json(await patchRequest(req.auth, id, req.body));
  } catch (err) {
    next(err);
  }
});

export default router;