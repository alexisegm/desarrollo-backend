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

### Persistencia tras reinicio
*(Se documentará en la Fase 6: El 201 con su id → el reinicio → el 200 posterior. Nunca la URL de conexión.)*

### Rollback demostrado
*(Se documentará en la Fase 6: Cómo se provocó el fallo controlado, la respuesta de error, y la consulta que muestra el estado intacto. Documentación de la reversión del fallo.)*