// El puente único entre las filas SQL (snake_case) y la representación HTTP (camelCase).
// Ninguna fila cruda debe llegar al cliente.

export function mapRequestRow(row) {
  if (!row) return null;
  
  return {
    id: Number(row.id),
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapHistoryRow(row) {
  if (!row) return null;

  return {
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    changedAt: row.changed_at
  };
}