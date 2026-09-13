export const validTransitions = {
  open: ['in_progress', 'resolved', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: ['closed'],
  closed: []
};

export const statusMap = {
  open: 'Abierto',
  in_progress: 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado'
};

export const priorityMap = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta'
};
