# Matriz de acceso — Request API v5

Dos roles exactos: `requester` y `agent`. Sin `admin`.

Completa cada celda con `Sí`, `No`, `Propias` o `Propia y abierta`.
La matriz puede discutirse, pero la implementación converge en la baseline
del taller (lámina Contrato fijo).

# Matriz de acceso

| Operación | Anónimo | Requester | Agent |
| --- | --- | --- | --- |
| `POST /auth/register` | Sí | Sí | Sí |
| `POST /auth/login` | Sí | Sí | Sí |
| `GET /auth/me` | No | Sí | Sí |
| `GET /requests` | No | Propias | Todas |
| `GET /requests/:id` | No | Propia | Todas |
| `GET /requests/:id/history` | No | Propia | Todas |
| `POST /requests` | No | Sí | No |
| `PATCH` título/descripción | No | Propia y abierta | No |
| `PATCH` prioridad | No | No | Sí |
| `PATCH` estado | No | No | Sí |

## Campos controlados por el servidor

Lista aquí los campos que el cliente JAMÁS puede enviar, en el registro y en las solicitudes, y qué respuesta exacta produce intentarlo.

- **En POST /auth/register:** El cliente jamás puede enviar campos como `role`, `id`, `createdAt` o `createdBy`. Intentarlo produce la respuesta `400 Bad Request` con el código exacto `SERVER_CONTROLLED_FIELD`.
- **En POST /requests:** El cliente jamás puede enviar `createdBy` (ya que se debe tomar del token del usuario autenticado) ni `status` (toda solicitud nace "open"). Produce el error `400 SERVER_CONTROLLED_FIELD`.
- **En PATCH /requests/:id:** El cliente no puede enviar el campo `changedBy` para falsear el historial. El actor siempre se saca del token.

## Solicitudes heredadas

¿Quién ve las solicitudes sin propietario (`created_by IS NULL`)? ¿Por qué?

Las ven únicamente los actores con el rol de `agent` (y en el endpoint que trae "Todas"). 
¿Por qué? Porque un `requester` está estrictamente aislado y la regla dicta que "sólo ve sus Propias solicitudes" (donde su ID coincida con el `created_by`). Como las solicitudes heredadas (las de las clases anteriores) no tienen ID de propietario asignado, automáticamente caen fuera del alcance visual del requester y pasan a ser administradas por los agentes del sistema.