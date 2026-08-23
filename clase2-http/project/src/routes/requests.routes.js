import express from 'express';
import { requests, generateId } from '../data/requests.js';

const router = express.Router();

// This router is mounted at /requests in app.js, so '/' here means GET /requests.

router.get('/', (req, res) => {
  // Retorna la lista completa con status 200
  res.status(200).json(requests);
});

router.get('/:id', (req, res) => {
  // Parsea el ID que entra como string por la URL
  const requestId = parseInt(req.params.id, 10);
  
  // Busca la solicitud
  const request = requests.find(r => r.id === requestId);

  if (!request) {
    // Si no existe, retorna 404
    return res.status(404).json({ error: 'Request not found' });
  }

  // Si existe, retorna 200 y el objeto
  res.status(200).json(request);
});

router.post('/', (req, res) => {
  const { title, description, priority } = req.body;

  // Validación estricta del título (no indefinido y no vacío)
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Creación del nuevo recurso ignorando campos no deseados
  const newRequest = {
    id: generateId(),
    title: title.trim(),
    description: description || '',
    status: 'open',
    priority: priority || 'low' // Asigna 'low' por defecto si no se envía
  };

  requests.push(newRequest);
  
  // Retorna 201 Created y el nuevo objeto
  res.status(201).json(newRequest);
});

export default router;