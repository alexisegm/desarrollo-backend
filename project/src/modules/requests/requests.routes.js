import express from 'express';
import { requests, generateId } from './requests.store.js';

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

  // Validación de forma: Título obligatorio con el nuevo formato de error
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: { code: 'MISSING_TITLE', message: 'Title is required' }
    });
  }

  // Validación de forma: Prioridad conocida y asignación por defecto
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

  // El servidor genera las fechas en formato ISO
  const now = new Date().toISOString();

  const request = {
    id: generateId(),
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    status: 'open', // Regla: siempre inicia en open
    priority: finalPriority,
    createdAt: now,
    updatedAt: now
  };

  requests.push(request);
  res.status(201).json(request);
});

export default router;
