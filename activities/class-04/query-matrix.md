# Query matrix — Entrega 04

Fase 1 · cada operación con su SQL (parametrizado) y sus parámetros. El SQL de esta matriz debe coincidir con el que termine en el store — si divergen, actualiza la matriz.

| Operación | SQL | Parámetros | Resultado esperado |
| :--- | :--- | :--- | :--- |
| Listar | `SELECT id, title, description, priority, status, created_at, updated_at FROM requests` | — | Filas |
| Buscar por ID | `SELECT id, title, description, priority, status, created_at, updated_at FROM requests WHERE id = $1` | `[id]` | Fila o ausencia |
| Crear | `INSERT INTO requests (title, description, priority) VALUES ($1, $2, $3) RETURNING id, title, description, priority, status, created_at, updated_at` | `[title, description, priority]` | Fila creada |
| Filtrar estado | `SELECT id, title, description, priority, status, created_at, updated_at FROM requests WHERE status = $1` | `[status]` | Colección |
| Filtrar combinado | `SELECT id, title, description, priority, status, created_at, updated_at FROM requests WHERE status = $1 AND priority = $2` | `[status, priority]` | Colección |
| Actualizar | `UPDATE requests SET field1 = $1, field2 = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, title, description, priority, status, created_at, updated_at` *(Nota: Los SET se arman dinámicamente según los campos a actualizar)* | `[valores..., id]` | Fila actualizada |
| Registrar historia | `INSERT INTO request_status_history (request_id, previous_status, new_status) VALUES ($1, $2, $3)` | `[request_id, previous_status, new_status]` | Evento registrado |
| Consultar historia | `SELECT previous_status, new_status, changed_at FROM request_status_history WHERE request_id = $1 ORDER BY changed_at ASC` | `[request_id]` | Eventos |

## Comprobación de seguridad
Ningún valor del cliente aparece DENTRO del texto de la consulta. Todos los valores (id, title, description, priority, status) se envían como variables parametrizadas (`$1`, `$2`, etc.) manejadas de forma segura por el driver de PostgreSQL.