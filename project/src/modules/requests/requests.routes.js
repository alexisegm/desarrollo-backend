// STARTER NOTE — these are the CLASS-03 routes, still synchronous and
// still talking to the in-memory store. Your migration TODOs:
//
//   1. Make every handler async and await the operations.
//   2. Move contract/domain decisions into requests.service.js and leave
//      here only: extract path/query/body -> invoke -> translate to HTTP.
//   3. Add GET /:id/history  (200 events | 404 REQUEST_NOT_FOUND).
//   4. Translate typed errors: contract->400, resource->404, domain->409,
//      infrastructure->503 DATABASE_UNAVAILABLE, unknown->500 INTERNAL_ERROR
//      — never forwarding raw pg errors or secrets to the client.
//
// The external contract of the four existing endpoints MUST NOT change.

// HTTP layer of the requests module. It receives HTTP information, picks the
// operation, and returns HTTP responses. Data lives in requests.store.js and
// lifecycle rules live in request-status.js.

import express from 'express';
import { createRequest, patchRequest, getHistory, AppError } from './requests.service.js';
import {
  listRequests,
  findRequestById,
  addRequest,
  updateRequest
} from './requests.store.js';
import {
  STATUSES,
  isValidStatus,
  isTerminal,
  canTransition
} from './request-status.js';

const router = express.Router();

const PRIORITIES = ['low', 'medium', 'high'];
const UPDATABLE_FIELDS = ['title', 'description', 'priority', 'status'];

// Every error in the API uses the same shape: a machine-readable code and a
// human-readable message.
function errorBody(code, message) {
  return { error: { code, message } };
}

// GET /requests — list the collection, with optional ?status= and ?priority=.
// An empty result is a valid answer: 200 with []. An unknown filter value is
// a client mistake: 400.
// GET /requests — list the collection, with optional ?status= and ?priority=.
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;

    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json(errorBody(
        'INVALID_FILTER',
        `Unknown status "${status}". Valid values: ${STATUSES.join(', ')}.`
      ));
    }

    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return res.status(400).json(errorBody(
        'INVALID_FILTER',
        `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`
      ));
    }

    const data = await listRequests({ status, priority });
    res.status(200).json(data);
  } catch (error) {
    console.error("[GET /requests] Error:", error.message);
    res.status(503).json(errorBody('DATABASE_UNAVAILABLE', 'The service cannot access its data store.'));
  }
});

// GET /requests/:id — a specific resource either exists or is a 404.
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const request = await findRequestById(id);

    if (!request) {
      return res.status(404).json(errorBody(
        'REQUEST_NOT_FOUND',
        `Request ${req.params.id} does not exist.`
      ));
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("[GET /requests/:id] Error:", error.message);
    res.status(503).json(errorBody('DATABASE_UNAVAILABLE', 'The service cannot access its data store.'));
  }
});

// POST /requests — the server owns identity, dates, the initial status and
// the default priority. Unknown fields in the body are ignored.
router.post('/', async (req, res) => {
  try {
    const request = await createRequest(req.body ?? {});
    res.status(201).json(request);
  } catch (error) {
  
    if (error instanceof AppError && error.category === 'contract') {
      return res.status(400).json(errorBody(error.code, error.message));
    }
    
    
    console.error("[POST /requests] Error:", error.message);
    res.status(500).json(errorBody('INTERNAL_ERROR', 'An unexpected error occurred.'));
  }
});

// GET /requests/:id/history — list the lifecycle events of a request.
router.get('/:id/history', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const history = await getHistory(id);
    res.status(200).json(history);
  } catch (error) {
    if (error instanceof AppError && error.category === 'resource') {
      return res.status(404).json(errorBody(error.code, error.message));
    }
    
    console.error("[GET /requests/:id/history] Error:", error.message);
    res.status(500).json(errorBody('INTERNAL_ERROR', 'An unexpected error occurred.'));
  }
});

// PATCH /requests/:id — partial update protected by shape validation and domain rules.
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const changes = {};
    
    for (const field of UPDATABLE_FIELDS) {
      if (body[field] !== undefined) changes[field] = body[field];
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json(errorBody(
        'NO_UPDATABLE_FIELDS',
        `The body must include at least one of: ${UPDATABLE_FIELDS.join(', ')}.`
      ));
    }

    // Shape validation
    if (changes.title !== undefined && (typeof changes.title !== 'string' || changes.title.trim() === '')) {
      return res.status(400).json(errorBody('TITLE_REQUIRED', 'The title cannot be empty.'));
    }

    if (changes.priority !== undefined && !PRIORITIES.includes(changes.priority)) {
      return res.status(400).json(errorBody(
        'INVALID_PRIORITY',
        `Unknown priority "${changes.priority}". Valid values: ${PRIORITIES.join(', ')}.`
      ));
    }

    if (changes.status !== undefined && !isValidStatus(changes.status)) {
      return res.status(400).json(errorBody(
        'INVALID_STATUS',
        `Unknown status "${changes.status}". Valid values: ${STATUSES.join(', ')}.`
      ));
    }

    if (changes.title !== undefined) changes.title = changes.title.trim();

    // El servicio se encarga de las reglas de dominio y la transacción
    const updated = await patchRequest(id, changes);
    res.status(200).json(updated);
    
  } catch (error) {
    if (error instanceof AppError) {
      if (error.category === 'resource') {
        return res.status(404).json(errorBody(error.code, error.message));
      }
      if (error.category === 'domain') {
        return res.status(409).json(errorBody(error.code, error.message));
      }
    }
    
    console.error("[PATCH /requests/:id] Error:", error.message);
    res.status(500).json(errorBody('INTERNAL_ERROR', 'An unexpected error occurred.'));
  }
});

export default router;