# Error map — Entrega 04

Fase 1 · clasifica cada situación por categoría y define la respuesta externa.
Regla transversal: la respuesta al cliente jamás incluye contraseñas, hosts, sentencias SQL, stack traces ni errores crudos de PostgreSQL.

## Categorías

| Categoría | Significado | Estado HTTP |
| :--- | :--- | :--- |
| **Contrato** | La petición está mal en sí misma | 400 |
| **Recurso** | El recurso referido no existe | 404 |
| **Dominio** | Petición válida que el estado actual prohíbe | 409 |
| **Persistencia** | La base rechazó algo que la app creía válido | 500 |
| **Infraestructura**| La base no está disponible | 503 |
| **Interno** | Error inesperado no identificado | 500 |

## Situaciones concretas

| Situación | Categoría | Estado | Código de error |
| :--- | :--- | :--- | :--- |
| Falta `title` al crear | Contrato | 400 | `TITLE_REQUIRED` |
| Prioridad desconocida | Contrato | 400 | `INVALID_PRIORITY` |
| Filtro con valor desconocido | Contrato | 400 | `INVALID_FILTER` |
| Solicitud inexistente | Recurso | 404 | `REQUEST_NOT_FOUND` |
| Transición inválida | Dominio | 409 | `INVALID_STATUS_TRANSITION` |
| Solicitud terminal | Dominio | 409 | `REQUEST_IN_TERMINAL_STATUS` |
| Restricción CHECK rechaza un INSERT | Persistencia | 500 | `INTERNAL_ERROR` |
| Base pausada / sin red | Infraestructura | 503 | `DATABASE_UNAVAILABLE` |
| Error de pg no identificado | Interno | 500 | `INTERNAL_ERROR` |

## Qué se registra en el log interno
* **Se documenta (para diagnóstico):** El código de error nativo de PostgreSQL (ej. `error.code` de `pg`), la tabla afectada, el tipo de operación que falló y mensajes descriptivos que no expongan datos sensibles.
* **Queda explícitamente prohibido loggear:** La cadena de conexión (`DATABASE_URL`), contraseñas en texto plano, la dirección de los hosts internos de Supabase, las sentencias SQL completas concatenadas con datos del usuario, y las trazas de pila (stack traces) enviadas en el cuerpo de la respuesta HTTP hacia el cliente.