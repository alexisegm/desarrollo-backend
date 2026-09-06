# Transaction plan — el cambio de estado con historia

Fase 1 · se completa antes de escribir la transacción. Si una pregunta no tiene respuesta en papel, el código la va a improvisar.

## ¿Qué operaciones forman la unidad?
Dos operaciones de escritura conforman la unidad lógica: 
1. El `UPDATE` en la tabla `requests` para cambiar el `status` y el `updated_at`.
2. El `INSERT` en la tabla `request_status_history` para registrar la transición.

## ¿Qué ocurre si falla la primera (el UPDATE)?
El error es capturado inmediatamente, se ejecuta un `ROLLBACK` y la transacción se aborta. El `INSERT` subsecuente nunca llega a ejecutarse y la base de datos queda intacta, sin cambios a medias.

## ¿Qué ocurre si falla la segunda (el INSERT de historia)?
Si el `INSERT` falla (por ejemplo, por una violación de restricción en el `new_status`), se ejecuta un `ROLLBACK`. Esto revierte el `UPDATE` de la tabla `requests`, el cual era provisional hasta no ejecutar el `COMMIT`.

## ¿Cuándo se ejecuta COMMIT?
Al final del bloque `try`, justo después de que tanto el `UPDATE` como el `INSERT` se han ejecutado con éxito. 

## ¿Cuándo se ejecuta ROLLBACK?
Dentro del bloque `catch (error)`, en cuanto alguna de las consultas falla, antes de relanzar el error hacia la capa superior (servicio/rutas).

## ¿Qué cliente ejecuta las consultas? (¿por qué no pool.query()?)
Se ejecuta a través de un cliente dedicado obtenido mediante `await pool.connect()`. No se utiliza `pool.query()` porque este método obtiene una conexión disponible del pool por cada consulta individualmente, lo que causaría que el `BEGIN`, el `UPDATE` y el `INSERT` ocurrieran en sesiones distintas y no como una transacción atómica.

## ¿Cuándo se libera el cliente? (¿y si hubo error?)
El cliente se devuelve al pool (`client.release()`) exclusivamente dentro del bloque `finally`. Esto garantiza que se libere siempre, sin importar si la transacción fue exitosa (`COMMIT`) o si falló (`ROLLBACK`).

## ¿Qué inconsistencia concreta evita esta unidad?
Evita que una solicitud cambie su estado en la tabla `requests` sin dejar rastro de cómo o cuándo ocurrió ese cambio. Sin la transacción, si el `INSERT` fallara, la base de datos quedaría contando una mentira silenciosa: un estado nuevo sin evidencia histórica.

## La creación también es una unidad
*   **Escrituras:** 1. `INSERT INTO requests` (la nueva solicitud). 2. `INSERT INTO request_status_history` (el nacimiento `NULL -> open`).
*   **Por qué van juntas:** Porque el dominio exige que toda solicitud tenga historial. Si la segunda escritura falla, tendríamos una solicitud activa huérfana de historia de creación, rompiendo la trazabilidad del sistema.