# System dossier

Un solo expediente para todo el análisis del taller. Regla de oro: cada
afirmación cita su evidencia (archivo y función, prueba, tabla o salida de
comando) o se declara como duda en la sección 9. "El service maneja la
lógica" sin nombres no cuenta como inventario.

## 1. How the system starts

* **Comando de arranque:** `npm start` o `npm run dev` (evidencia: bloque scripts en `package.json`).
* **Archivo que ejecuta Node:** `src/server.js`.
* **Qué construye la aplicación:** El archivo `src/app.js` es el encargado de instanciar Express (`const app = express()`) y establecer el orden estricto de los middlewares y las rutas.
* **Qué queda escuchando:** `src/server.js` importa la aplicación ya construida desde `app.js` y ejecuta `app.listen(PORT, ...)`, dejando el proceso escuchando (generalmente en el puerto 3000).

## 2. Main components

| Componente | Archivo o recurso | Responsabilidad | Evidencia | Duda |
| --- | --- | --- | --- | --- |
| Punto de entrada | src/server.js | Arranca el proceso de Node y abre el puerto. No conoce mas rutas | app.listen(PORT, ...) | Ninguna de momento |
| Construcción de la app | src/app.js | Ensambla los middlewares globales y enruta los modulos en orden | const app = express(); app.use(...) | Ninguna de momento |
| Router principal | src/app.js | Deriva el trafico hacia la rutas de dominio (/auth y /requests) inyectando autenticacion global | app.use('/requests', authenticate, requestsRoutes); | |
| Módulos | src/modules/ | Agrupar dominio (rutas, servicios, stores, policies) separando auth de requests. | import requestsRoutes from './modules/requests/requests.routes.js' en app.js | |
| Middleware global | src/middleware/ | Procesar aspectos transversales antes del enrutamiento (CORS, RequestId, Body Parsing). | Llamadas a app.use(corsPolicy), app.use(express.json()) en app.js | |
| Autenticación | src/middleware/authenticate.js | Extrae y verifica la firma del JWT; construye req.auth | verifyToken(token) e inyección de req.auth = { userId: payload.sub, role: payload.role }; | |
| Autorización (policies) | src/modules/requests/request.policy.js | Inferido) Debe contener reglas de negocio puras para la visibilidad. | Se importa en requests.service.js, ej. canViewHistory | Estan cubiertos los casos de asimetria? |
| Services | src/modules/requests/requests.service | Orquesta flujos de negocio sin saber de HTTP (rutas) ni de bases de datos (SQL) | export async function getRequest(actor, id) | |
| Stores / acceso a datos | src/modules/requests/requests.store.js | Ejecutar consultas SQL parametrizadas y manejar transacciones si se le pasa un pool cliente | findById(id) ejecutando un SELECT parametrizado con $1 | |
| Conexión PostgreSQL | src/database/pool.js | Establecer y mantener el pool de conexiones. | Se importa pool en requests.store.js como base de datos por defecto | |
| Manejo de errores | src/middleware/error-handler.js | Traducir AppError e imprevistos en respuestas JSON homogéneas sin fugas internas | El objeto de salida errorBody(code, message, id) | |
| Logging | src/logging/logger.js (y request-logger.js) | Registrar eventos con estructura JSON asociando siempre el request ID | Invocación de logger.error(..., { requestId }) en error-handler | |
| Health / readiness | src/routes/health.routes.js | Sondear estado de Node (/health) y PostgreSQL (/ready) | /ready devuelve 503 si la DB cae, no expone error.message | |
| Pruebas | test/*.test.js | Proteger contratos y comportamiento (documentación ejecutable) | El comando "test" en package.json y la salida del npm test | |
| Scripts operativos | scripts/ | Ejecutar diagnósticos, migraciones y validaciones | "db:migrate": "node scripts/migrate.js" en package.json. | |
| Dependencias externas | express, pg, node:test | Proveer servidor HTTP, conexión nativa a DB y framework de pruebas. | import express from 'express' | |

## 3. Request trace

Recorrido completo de `GET /requests/:id` — en orden, con archivo y
función en cada paso:

1. **Router:** `requests.routes.js` intercepta la petición en `router.get('/:id', ...)`.
2. **Middlewares que atraviesa:** Según `app.js`, pasa primero por los globales (`corsPolicy`, `requestId`, `requestLogger`, `express.json()`) y luego por `authenticate` al entrar a las rutas de `/requests`.
3. **Dónde se valida el parámetro `id`:** En el enrutador (`requests.routes.js`), usando la función `parseIdParam(req.params.id)` ANTES de pasarlo al service.
4. **Dónde nace la identidad autenticada:** En `src/middleware/authenticate.js`, que extrae el token del header `Authorization`, lo verifica usando `verifyToken()` y construye `req.auth = { userId, role }`.
5. **Policy consultada (¿se consulta?):** Aquí está el problema. Para `getRequest()`, **NO SE CONSULTA** ninguna policy. Hay un comentario: `// TEMP(REQ-442): visibility check disabled...`.
6. **Service:** `requests.service.js` en su función `getRequest(actor, id)`. Llama al store y lanza `notFound(id)` si no encuentra la fila.
7. **Store y query:** Llama a la función `findById(id)` (que asumo está en `requests.store.js` por las importaciones).
8. **Transformación fila → JSON:** A través de la función `mapRequestRow(row)` antes de devolver el objeto.
9. **Respuesta y manejo de errores:** El enrutador (`requests.routes.js`) recibe la respuesta y la envía con `res.status(200).json(...)`. Si ocurre un error, Express lo deriva al `errorHandler` global.
10. **Pruebas existentes que cubren este recorrido:** Las salidas del log inicial muestran que se prueba que el owner puede leerla y que los parámetros maliciosos o IDs que no existen devuelven los errores correspondientes. Las pruebas de asimetría están como `todo`.

## 4. Database inventory

* **Tablas principales:** `requests` (almacena las solicitudes, su estado, prioridad, asignación) y `request_history` (registro de cambios como auditoría o ledger).
* **Claves relevantes:** `requests.id` es la clave primaria; `request_history.request_id` actúa como foreign key. `created_by` y `assigned_to` asocian al actor.
* **Migraciones:** Las tablas fueron creadas por migraciones (001 a 005) como reportó el Baseline ("todas SKIPPED").
* **Siembra (Seed):** Se siembra usando el script `npm run db:seed` que es repetible y provee usuarios como `ana.requester.seed@example.test` y `maria.agent.seed@example.test`.
* **La query del recorrido GET:** Llama a `findById`, ejecutando `SELECT id, title, description... FROM requests WHERE id = $1`, parametrizada para evitar inyecciones SQL.

## 5. Authentication and authorization

* **Dónde se verifica el JWT:** En `src/middleware/authenticate.js` con la función `verifyToken(token)`.
* **Qué contiene `req.auth`:** Contiene la identidad extraída del JWT y mapeada: `{ userId: payload.sub, role: payload.role }`.
* **Dónde viven las reglas de permiso:** En `src/modules/requests/request.policy.js` (funciones puras sin dependencias de Express ni SQL).
* **Un ejemplo de regla:** `canViewRequest(actor, request)` devuelve `true` si el actor es `agent` o si `request.createdBy === actor.userId`.
* **¿Algún lugar lee identidad de query o body?** No, la identidad siempre nace de `req.auth`, inyectado por el middleware en la ruta.

## 6. Errors, logs and operational checks

* **Formato de error único:** Todo error termina como `{ "error": { "code", "message" }, "requestId": "..." }`. La traducción central ocurre en `src/middleware/error-handler.js`.
* **Logs (Qué se registra):** El `requestLogger` captura cada petición con su ID, método, path, status, y el tiempo (durationMs). En caso de fallas imprevistas, `errorHandler` registra nombre, mensaje y stack trace usando `logger.error` vinculando siempre el mismo `requestId` que recibe el cliente.
* **Logs (Qué JAMÁS se registra):** Jamás se registra el contenido del encabezado `Authorization`, los tokens, cadenas de conexión, secretos o el payload del body que podría contener datos sensibles.
* **Health:** `/health` reporta si el proceso Node está corriendo, y devuelve `{status: 'ok'}` de inmediato sin tocar la base de datos.
* **Readiness:** `/ready` verifica activamente la dependencia (PostgreSQL) usando una consulta económica (`SELECT 1`). Si PostgreSQL no responde, devuelve 503 sin revelar errores de conexión.

## 7. Minimum-practices audit

Clasificaciones permitidas: COMPLIES · PARTIAL · DOES_NOT_COMPLY ·
NOT_FOUND · NOT_UNDERSTOOD. Cada fila cita evidencia o reconoce duda.

| Área | Pregunta | Clasificación | Evidencia / duda |
| --- | --- | --- | --- |
| Configuración | ¿Los secretos están fuera del código? | COMPLIES | Se usa un archivo `.env` y `process.env.PORT` en `server.js`. |
| Entrada | ¿Se validan datos externos? | COMPLIES | `parseIdParam(req.params.id)` en `requests.routes.js` valida el ID antes de tocar SQL. |
| SQL | ¿Las consultas están parametrizadas? | COMPLIES | `findById` usa variables `$1` para evitar inyecciones SQL. |
| Identidad | ¿El JWT se verifica? | COMPLIES | `verifyToken(token)` valida la firma antes de armar `req.auth`. |
| Permisos | ¿Existe autorización además de autenticación? | COMPLIES | Reglas separadas en `request.policy.js` (ej. `canViewRequest`). |
| Ownership | ¿Se limita el acceso al propietario cuando corresponde? | DOES_NOT_COMPLY | Comentario `TEMP(REQ-442)` en `requests.service.js` anula la política para el detalle. BUG-901[cite: 7]. |
| Dominio | ¿Los campos del servidor están protegidos? | COMPLIES | `rejectServerControlledFields` descarta IDs y roles del payload. |
| Consistencia | ¿Las escrituras relacionadas usan transacción? | COMPLIES | `withTransaction` agrupa inserción e historial en `createRequest`. |
| Errores | ¿Existe un formato consistente? | COMPLIES | `errorHandler` siempre responde `{ error: { code, message }, requestId }`. |
| Logs | ¿Ayudan a investigar sin exponer secretos? | COMPLIES | `logger.error` incluye stack trace, vinculando el request ID, sin imprimir headers Auth. |
| Pruebas | ¿Existen casos positivos y negativos? | PARTIAL | La suite cubre 59 casos pero tiene 5 `todo` justo en las reglas de ownership/asimetría. |
| Migraciones | ¿El esquema está versionado? | COMPLIES | Comando `npm run db:migrate` detectó y saltó versiones de esquema 001 a 005. |
| Seed | ¿Puede repetirse de forma controlada? | COMPLIES | Comando `npm run db:seed` permite levantar el estado inicial rápidamente. |
| Arquitectura | ¿HTTP, reglas y SQL están separados razonablemente? | COMPLIES | `routes.js`, `service.js`, `policy.js` y `store.js` no mezclan sus dominios. |
| Operación | ¿Health y readiness tienen propósitos distintos? | COMPLIES | `/health` es instantáneo; `/ready` hace un ping ligero a DB con `SELECT 1`|

## 8. Change impact

### Observable behavior
Actualmente, un `requester` recibe `200 OK` al pedir el detalle de una solicitud ajena[cite: 7]. Con el cambio, recibirá un `404 REQUEST_NOT_FOUND` indistinguible de una solicitud que no existe, eliminando la enumeración de IDs. El historial ya se comporta así.

### Files likely affected
`src/modules/requests/requests.service.js` (función `getRequest`).
`test/request-detail.test.js` (convertir pruebas `todo` a reales).

### Rule to protect
Un `requester` solo puede consultar las solicitudes creadas por él.

### Data required
Para tomar la decisión se requiere el `actor` (inyección desde el token, contiene `userId` y `role`) y el `request` (la fila de la base de datos, que contiene `createdBy`).

### Status codes
| Actor | Recurso | Código esperado |
| --- | --- | --- |
| Sin token | Cualquiera | `401 AUTHENTICATION_REQUIRED` |
| Agent | Existente (ajeno o propio) | `200 OK` |
| Requester (Owner) | Propio | `200 OK` |
| Requester (Extraño)| Ajeno | `404 REQUEST_NOT_FOUND` |
| Cualquiera | Inexistente | `404 REQUEST_NOT_FOUND` |

### Tests to add or change
Se deben convertir los 3 `test.todo` en `request-detail.test.js` (stranger requester 404, query param injection, agent 200).

### Behavior that must remain unchanged
El dueño y los agentes deben seguir recibiendo `200 OK`. El esquema JSON de la respuesta no debe perder ni ganar ningún campo.

### Risks
Un error en la política podría bloquear a los verdaderos dueños o a los agentes. Debemos asegurarnos de pasar el objeto mapeado correcto a la política.

### Unknowns
Ninguno para este ticket. La política requerida ya existe (`canViewRequest` en `request.policy.js`).

## 9. Unknowns and questions
*   ¿Por qué se tomó la decisión original de usar 404 en lugar de 403 para el acceso horizontal en este sistema heredado?
*   ¿Cómo maneja PostgreSQL internamente el pool de conexiones cuando hay alta concurrencia en `/requests`?

### Files likely affected

[COMPLETAR]

### Rule to protect

[COMPLETAR — la regla de negocio, en una frase.]

### Data required

[COMPLETAR — qué datos necesita la regla para decidir (rol, createdBy…).]

### Status codes

[COMPLETAR — tabla de casos y códigos, incluida la decisión 404.]

### Tests to add or change

[COMPLETAR]

### Behavior that must remain unchanged

[COMPLETAR — owner, agent, schema, endpoints vecinos.]

### Risks

[COMPLETAR]

### Unknowns

[COMPLETAR]

## 9. Unknowns and questions

[COMPLETAR — lo que todavía no entiendes del sistema, como preguntas
concretas. Esta sección NUNCA debe quedar vacía: un junior sin dudas no
ha mirado suficiente.]
