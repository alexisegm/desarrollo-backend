# Persistence contract — operaciones del store

Fase 1 · se completa antes de usar IA y antes de tocar código.
Los contratos también existen entre módulos: este documento es la promesa del store hacia el service. Completa una sección por operación.

## findAll(filters)
*   **Entrada:** Acepta un objeto `filters` opcional con las claves `status` y `priority`. Solo valores permitidos por el dominio.
*   **Consulta:** Ejecuta un `SELECT id, title, description, priority, status, created_at, updated_at FROM requests`. Las condiciones (`WHERE status = $1`) y los valores se arman dinámicamente según los filtros presentes, parametrizando los valores para evitar inyecciones.
*   **Salida:** Devuelve representaciones completas en camelCase, no las filas crudas.
*   **Ausencia de datos:** Devuelve un arreglo vacío `[]` si ningún registro coincide.
*   **Errores posibles:** Errores de infraestructura (ej. base caída). El store los relanza y las rutas los atrapan como 503.
*   **¿Necesita transacción?:** No, es una operación de solo lectura simple.
*   **Mapeo:** La fila SQL se traduce usando `mapRequestRow` en `request.mapper.js`.

## findById(id)
*   **Entrada:** Recibe el identificador numérico `id` de la solicitud.
*   **Consulta:** `SELECT id, title, description, priority, status, created_at, updated_at FROM requests WHERE id = $1`.
*   **Salida:** Devuelve la representación en camelCase de la solicitud.
*   **Ausencia de datos:** Devuelve `null`. El store no juzga la ausencia; es el servicio/ruta quien decide lanzar un 404 `REQUEST_NOT_FOUND`.
*   **Errores posibles:** Errores de infraestructura.
*   **¿Necesita transacción?:** No, es lectura individual.
*   **Mapeo:** A través de `mapRequestRow`.

## create(input)
*   **Entrada:** Objeto con `title`, `description`, y `priority`. 
*   **Consulta(s):** Ejecuta un `INSERT INTO requests (...) VALUES (...) RETURNING *` y posteriormente un `INSERT INTO request_status_history (...) VALUES (...)`.
*   **Salida:** Devuelve la representación de la solicitud recién creada.
*   **Errores posibles:** Fallos por violaciones de restricción (`CHECK` o `NOT NULL`) o infraestructura.
*   **¿Necesita transacción?:** Sí. Se deben registrar dos escrituras simultáneas: el nacimiento en la tabla principal y el historial inicial (`NULL -> open`). Ambas deben confirmarse juntas (`COMMIT`) o revertirse (`ROLLBACK`).
*   **Mapeo:** A través de `mapRequestRow`.

## update(id, changes)
*   **Entrada:** El `id` numérico y el objeto `changes` con los campos actualizables enviados por el cliente.
*   **Consulta(s):** Ejecuta un `UPDATE requests SET ... WHERE id = $x RETURNING *`. Si el estado cambió, incluye un `INSERT INTO request_status_history`.
*   **Salida:** Devuelve la representación de la solicitud actualizada.
*   **Ausencia de datos:** Si el UPDATE no afecta filas, devuelve `null`.
*   **Errores posibles:** Violación de `CHECK` (ej. estado inexistente) o infraestructura.
*   **¿Necesita transacción?:** Sí, siempre que la actualización incluya un cambio de estado (`status`), para poder guardar el nuevo registro en el historial en la misma unidad lógica de trabajo.
*   **Mapeo:** A través de `mapRequestRow`.

## findHistory(requestId)
*   **Entrada:** El `requestId` numérico al que pertenece el historial.
*   **Consulta:** `SELECT previous_status, new_status, changed_at FROM request_status_history WHERE request_id = $1 ORDER BY changed_at ASC`.
*   **Salida:** Un arreglo de representaciones de los eventos históricos.
*   **Ausencia de datos:** Devuelve `[]` si está vacío. El servicio es quien verifica primero si la solicitud existe (para lanzar 404) o si simplemente su historial está vacío (aunque el evento de nacimiento garantiza que tenga al menos uno).
*   **Errores posibles:** Infraestructura.
*   **¿Necesita transacción?:** No, es una consulta de solo lectura.
*   **Mapeo:** Cada fila se traduce usando `mapHistoryRow`.