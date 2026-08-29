import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// Maintenance requests are kept in memory, so they reset every time the server restarts.
const requests = [
  {
    id: 1,
    title: 'Projector does not turn on',
    description: 'The projector in room 204 shows no image during class.',
    status: 'open',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Broken chair in the lab',
    description: 'One chair in the computer lab has a loose back rest.',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Wi-Fi drops in the library',
    description: 'The connection drops every few minutes on the second floor.',
    status: 'open',
    priority: 'low'
  }
];

// 1. Correcion: Cambie '/getRequests' por '/requests'
app.get('/requests', (req, res) => {
  res.json(requests);
});

// 2. Correcion: Añadi el estado 404 para recursos los inexistentes
app.get('/requests/:id', (req, res) => {
  const request = requests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json(request);
});

// Correccion: agregue la validacion (400) y el estado de creacion (201)
app.post('/requests', (req, res) => {
  const { title, description, priority } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newRequest = {
    id: requests.length > 0 ? requests[requests.length - 1].id + 1 : 1,
    title,
    description,
    status: 'open',
    priority: priority || 'low'
  };
  
  requests.push(newRequest);
  res.status(201).json(newRequest);
});

app.listen(PORT, () => {
  console.log(`Request API Lite is running on http://localhost:${PORT}`);
});