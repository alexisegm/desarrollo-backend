# Test matrix — Entrega 04

Fase 1: se declara lo esperado. Fase 6: cada caso se ejecuta y se registra lo observado (línea de estado literal y cuerpo). La columna observado se llena ejecutando, no copiando.

| Caso | Estado previo | Acción | Esperado | Observado |
| :--- | :--- | :--- | :--- | :--- |
| Conectar correctamente | Proyecto activo | `npm run db:check` | Éxito | |
| Crear solicitud | — | `POST /requests` | 201 | |
| Reiniciar servidor | Solicitud creada | `GET /requests/:id` | Persiste | |
| Buscar inexistente | — | `GET /requests/999` | 404 | |
| Filtrar sin resultados | — | Filtro válido | 200 [] | |
| Cambiar prioridad | `open` | `PATCH` | 200 | |
| Transición válida | `open` | `in_progress` | 200 | |
| Transición inválida | `open` | `closed` | 409 | |
| Consultar historia | Transición hecha | `GET …/history` | 200 | |
| Falla del historial | Estado previo | Cambio transaccional | Rollback | |
| Base no disponible | — | Cualquier consulta | Error consistente | |
| Reinicio de Express | Datos existentes | Consultar | Datos conservados | |
| Enviar status al crear | — | `POST /requests` con status terminal | 201 (ignora el status y crea como `open`) | |
| Body vacío en PATCH | Solicitud existente | `PATCH` sin campos | 400 `NO_UPDATABLE_FIELDS` | |

## Evidencia clave (texto, sin secretos)

## Evidencia clave (texto, sin secretos)

### Persistencia tras reinicio
1. Ejecución: `curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d '{ "title": "Survives restarts", "priority": "high" }'`
2. Observado: Respuesta `201 Created` devolviendo la solicitud con `id: 4`.
3. Acción: Detuve el proceso de Express en la terminal (Ctrl+C) y lo volví a iniciar (`node src/server.js`).
4. Verificación: `curl -i http://localhost:3000/requests/4`
5. Observado: Respuesta `200 OK` con los mismos datos intactos, confirmando que el estado vive en PostgreSQL y no en el proceso.

### Rollback demostrado
1. Acción: Introduje un `throw new Error("Fallo simulado")` dentro de `requests.service.js` (en `patchRequest`), justo después del `insertStatusHistory` y antes del `COMMIT`.
2. Ejecución: `curl -i -X PATCH http://localhost:3000/requests/3 -H "Content-Type: application/json" -d '{ "status": "in_progress" }'`
3. Observado: Respuesta `500 Internal Server Error`. El error fue capturado por el bloque catch de `withTransaction`.
4. Verificación: `curl -i http://localhost:3000/requests/3`
5. Observado: La solicitud 3 mantiene su `status` original en `"open"`. El `UPDATE` que se había ejecutado en memoria fue revertido exitosamente mediante el comando SQL `ROLLBACK`.
6. Reversión: Eliminé la línea de error simulado del código y reinicié el servidor, restaurando la operación normal de la API.