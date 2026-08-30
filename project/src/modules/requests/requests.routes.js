import express from 'express';
import { requests, generateId } from './requests.store.js';
import { isTerminalStatus, isValidTransition, isValidStatus } from './request-status.js';

const router = express.Router();

// This router is mounted at /requests in app.js, so '/' here means GET /requests.

router.get('/', (req, res) => {
  res.status(200).json(requests);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.status(200).json(request);
});

router.post('/', (req, res) => {
  const { title, description, priority } = req.body ?? {};

 
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: { code: 'MISSING_TITLE', message: 'Title is required' }
    });
  }

 
  const validPriorities = ['low', 'medium', 'high'];
  let finalPriority = 'medium'; 
  
  if (priority !== undefined) {
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: { code: 'UNKNOWN_PRIORITY', message: 'Priority must be low, medium, or high' }
      });
    }
    finalPriority = priority;
  }

  
  const now = new Date().toISOString();

  const request = {
    id: generateId(),
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    status: 'open', 
    priority: finalPriority,
    createdAt: now,
    updatedAt: now
  };

  requests.push(request);
  res.status(201).json(request);
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  // 1. Solicitud inexistente -> 404
  if (!request) {
    return res.status(404).json({ 
      error: { code: 'REQUEST_NOT_FOUND', message: `Request ${id} does not exist.` } 
    });
  }

  const { title, description, priority, status } = req.body ?? {};

  // 2. Validación de forma: Body sin campos modificables -> 400
  if (title === undefined && description === undefined && priority === undefined && status === undefined) {
    return res.status(400).json({ 
      error: { code: 'NO_MODIFIABLE_FIELDS', message: 'No valid fields provided for update.' } 
    });
  }

  // 3. Validación de forma: Prioridad o estado desconocido -> 400
  const validPriorities = ['low', 'medium', 'high'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({ 
      error: { code: 'UNKNOWN_PRIORITY', message: 'Priority must be low, medium, or high.' } 
    });
  }
  if (status !== undefined && !isValidStatus(status)) {
    return res.status(400).json({ 
      error: { code: 'UNKNOWN_STATUS', message: `Status '${status}' is not recognized.` } 
    });
  }

  // 4. Regla de negocio: Modificación de solicitud terminal -> 409
  if (isTerminalStatus(request.status)) {
    return res.status(409).json({ 
      error: { code: 'REQUEST_IN_TERMINAL_STATUS', message: 'Cannot modify a request in a terminal status (closed/cancelled).' } 
    });
  }

  // 5. Regla de negocio: Transición inválida -> 409
  if (status !== undefined && !isValidTransition(request.status, status)) {
    return res.status(409).json({ 
      error: { code: 'INVALID_STATUS_TRANSITION', message: `A request cannot move from ${request.status} to ${status}.` } 
    });
  }

  // Si pasamos todas las validaciones y reglas, aplicamos los cambios
  if (title !== undefined) request.title = title.trim();
  if (description !== undefined) request.description = description;
  if (priority !== undefined) request.priority = priority;
  if (status !== undefined) request.status = status;

  // Actualizamos la fecha de modificación según la regla transversal
  request.updatedAt = new Date().toISOString();

  res.status(200).json(request);
});
export default router;
