# Preserve request status history

## Context
What requirement produced this decision?
La clase 03 y el dominio establecen la necesidad de auditar y preservar la historia de cada solicitud. Una simple actualización en una columna anula el conocimiento de cómo y cuándo ocurrió el cambio.

## Options

### Option 1: Keep only the current status
**Benefits:**
* Escritura simple y rápida: un solo `UPDATE` en la tabla principal.
* Menor consumo de almacenamiento en la base de datos.
* No requiere el uso de transacciones lógicas complejas.

**Costs:**
* Se pierde el rastro de auditoría completo. No hay forma de responder "quién o cuándo se cambió a in_progress".
* Imposibilidad de medir métricas de negocio (ej. cuánto tiempo pasa una solicitud abierta antes de resolverse).

### Option 2: Store every status transition
**Benefits:**
* Trazabilidad absoluta: cada cambio es un evento inmutable registrado en el tiempo.
* Permite responder a preguntas analíticas y reconstruir la línea temporal de cada problema.

**Costs:**
* Exige dos operaciones de escritura por cada cambio de estado.
* Requiere implementar transacciones (`BEGIN`, `COMMIT`, `ROLLBACK`) para garantizar que ambas escrituras sean atómicas y evitar inconsistencias.
* Mayor complejidad arquitectónica y consumo de almacenamiento.

## Decision
Which option did we select and why?
**Option 2**. Decidimos almacenar cada transición en la tabla `request_status_history`. El dominio de mantenimiento requiere auditoría y control de tiempos; sacrificar la historia por simplicidad técnica rompería el requerimiento principal.

## Consequences

**What do we gain?**
Trazabilidad completa. El historial exacto de cada solicitud desde su nacimiento hasta su estado terminal, posibilitando auditorías futuras.

**What additional data and code appear?**
Aparece una nueva tabla `request_status_history` con su clave foránea. En el código, aparece un orquestador transaccional (`withTransaction`) para garantizar que el `UPDATE` en `requests` y el `INSERT` en el historial actúen como un solo bloque lógico.

**What consistency problem must be handled?**
El riesgo de escrituras parciales. Si el estado cambia pero el historial falla, la base miente silenciosamente. Obliga al uso de un único cliente TCP para ejecutar un `ROLLBACK` y abortar ambas operaciones si alguna falla.

**What queries become possible?**
`SELECT previous_status, new_status, changed_at FROM request_status_history WHERE request_id = $1` permite reconstruir la línea de vida de cualquier solicitud.

**What may need to change later?**
Si el sistema crece, podríamos necesitar un mecanismo para archivar historiales muy antiguos o crear índices específicos sobre `changed_at` para optimizar consultas de reportes mensuales.