// STARTER NOTE — this is still the CLASS-03 in-memory store. Your job is
// to replace its internals with SQL against PostgreSQL, keeping these
// contracts (see persistence-contract.md):
//
//   findAll(filters, db = pool)                    -> rows[]
//   findById(id, db = pool)                        -> row | null
//   insertRequest({title, description, priority}, db) -> row   (INSERT ... RETURNING)
//   updateRequest(id, changes, db)                 -> row | null (UPDATE ... RETURNING)
//   insertStatusHistory(requestId, prev, next, db) -> void
//   findHistory(requestId, db)                     -> rows[]
//
// Rules: parameterized queries only ($1, $2...), explicit columns, and the
// optional `db` parameter so the service can pass a transaction client.
// TODO: convert one function at a time and verify each with curl.

// In-memory storage for requests. It owns the array and the identity of each
// request. It knows nothing about HTTP and nothing about which transitions
// are legal — that lives in request-status.js.

import { pool } from '../../database/pool.js';
import { mapRequestRow, mapHistoryRow } from './request.mapper.js';

export async function listRequests(filters = {}, db = pool) {
  const conditions = [];
  const values = [];

  // Filtros dinámicos seguros
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }
  if (filters.priority) {
    values.push(filters.priority);
    conditions.push(`priority = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT id, title, description, priority, status, created_at, updated_at 
     FROM requests 
     ${whereClause} 
     ORDER BY created_at DESC`,
    values
  );

  return result.rows.map(mapRequestRow);
}

export async function findRequestById(id, db = pool) {
  const result = await db.query(
    `SELECT id, title, description, priority, status, created_at, updated_at 
     FROM requests 
     WHERE id = $1`,
    [id]
  );

  return mapRequestRow(result.rows[0]);
}

export async function addRequest({ title, description, priority }, db = pool) {
  const result = await db.query(
    `INSERT INTO requests (title, description, priority)
     VALUES ($1, $2, $3)
     RETURNING id, title, description, priority, status, created_at, updated_at`,
    [title, description, priority]
  );
  
  return mapRequestRow(result.rows[0]);
}

export async function insertStatusHistory(requestId, previousStatus, newStatus, db = pool) {
  await db.query(
    `INSERT INTO request_status_history (request_id, previous_status, new_status)
     VALUES ($1, $2, $3)`,
    [requestId, previousStatus, newStatus]
  );
}


export async function updateRequest(id, changes, db = pool) {
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  
  for (const [key, value] of Object.entries(changes)) {
    setClauses.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }


  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id); // El ID es el último parámetro

  const result = await db.query(
    `UPDATE requests
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, title, description, priority, status, created_at, updated_at`,
    values
  );

  return mapRequestRow(result.rows[0]);
}

export async function findHistory(requestId, db = pool) {
  const result = await db.query(
    `SELECT previous_status, new_status, changed_at
     FROM request_status_history
     WHERE request_id = $1
     ORDER BY changed_at ASC`,
    [requestId]
  );
  
  return result.rows.map(mapHistoryRow);
}