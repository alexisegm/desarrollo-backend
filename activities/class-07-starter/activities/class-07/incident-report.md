# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

Which command confirmed the starting state?
`npm run class-07:doctor` y `npm test`.

## Incident 701

### Report

(what support said, in one or two lines)
Algunos identificadores de solicitudes alfanuméricos o con formatos incorrectos devuelven un error interno del servidor (500) en lugar de un código de error controlado.

### Reproduction

(the exact request: method, path, user/role, body if any)
`GET /requests/not-a-number` con un token de autenticación válido de rol requester.

### Expected result
Un código de estado HTTP 400 con el código de error controlado `INVALID_REQUEST_ID` y estructura JSON estandarizada.

### Actual result

(status and body actually received — copy them)
Respuesta con fallo interno de servidor (500) o un cuerpo de error plano que no cumplía con el formato de contrato esperado.

### Hypotheses

(at least two, ordered by probability, each with HOW you would check it)
1. La validación del ID lanza un error que no está siendo traducido correctamente al código HTTP 400 por la capa de rutas. (Comprobado revisando los bloques `try/catch` y el manejador de respuestas local).
2. El middleware central de errores no está recibiendo la excepción debido a capturas previas en las rutas.

### Evidence

(what you observed: terminal output, the line where the value travels…
never paste a connection string or a token here)
Las trazas de la terminal y los logs mostraban respuestas con códigos 500 y discrepancias en la forma del objeto de error devuelto a las pruebas.

### Confirmed cause
Los bloques `try/catch` repetidos en `src/modules/requests/requests.routes.js` interceptaban localmente las excepciones y respondían de forma aislada mediante funciones antiguas de respuesta, evitando que el error fluyera hacia el middleware centralizado `errorHandler`.

### Correction

(the minimal change: file and what it does — not the whole diff)
En `src/modules/requests/requests.routes.js`: eliminación de los bloques `try/catch` locales en los verbos HTTP para permitir que Express 5 reenvíe de forma natural los errores al middleware central `errorHandler`.

### Regression test

(which test now fails without the fix and passes with it)
`an alphabetic id answers 400 INVALID_REQUEST_ID, not 500` y las pruebas de validación de formato de IDs decimales, cero y negativos.

## Incident 702

### Report
Actualizar ciertas prioridades en las solicitudes produce fallos no controlados o respuestas inconsistentes en la API.

### Reproduction
`PATCH /requests/227` enviando un cuerpo con una prioridad inválida.

### Expected result
Respuesta HTTP 400 con el código `INVALID_PRIORITY` antes de tocar la capa de base de datos.

### Actual result
Propagación de errores no estructurados y respuestas sin el formato unificado de error.

### Hypotheses
1. El middleware de rutas intercepta la excepción de prioridad mediante un `try/catch` local e impide que el middleware central formateé la respuesta.

### Evidence
Las aserciones de las pruebas fallaban al no coincidir la forma del cuerpo del error (`error.code`, `error.message`, `requestId`).

### Confirmed cause
Intercepción prematura del error en los bloques locales de las rutas de solicitudes.

### Correction
Eliminación de los bloques `try/catch` locales en `src/modules/requests/requests.routes.js` para unificar el tratamiento de errores en el middleware central.

### Regression test
`an invalid priority answers 400 INVALID_PRIORITY before touching SQL`.

## Error flow

Where is the error created?
En las funciones de validación de parámetros (como `parseRequestId`), servicios, o ante fallos de infraestructura en la base de datos.

How does it reach the error middleware?
A través del flujo nativo de Express 5 para promesas rechazadas y errores lanzados, una vez removidos los bloques `try/catch` locales que bloqueaban su propagación.

What is returned to the client?
Un objeto JSON estandarizado con el formato `{ error: { code, message }, requestId }` y su respectivo código de estado HTTP, ocultando cualquier detalle interno.

What remains only in the server log?
Los detalles completos del error, nombres, trazas (`stack`) y mensajes internos exclusivamente a través del registrador de eventos (`logger`).

## Request ID

How did I prove that the response and log belong to the same request?
Mediante la inclusión consistente del mismo identificador (`requestId`) tanto en el encabezado HTTP de respuesta (`X-Request-Id`) como en la línea estructurada de log generada por el `requestLogger`.

## AI assistance

What did AI help me understand?
El flujo de propagación de errores en Express 5 y cómo los bloques `try/catch` locales impedían que el middleware centralizado procesara adecuadamente las excepciones.

Which hypothesis did it propose?
Proponer que la discrepancia en la forma del error y los fallos de aserción ocurrían por la captura prematura en las rutas en lugar de dejar actuar al `errorHandler` central.

How did I verify it?
Ejecutando iterativamente la suite con `npm test` y el script oficial de validación con `npm run validate:class-07`.

What suggestion was incomplete or incorrect?
Sugerencias iniciales enfocadas en modificar middlewares aislados antes de identificar que el bloqueo principal residía en los bloques `try/catch` locales del archivo de rutas.

## Remaining doubt

What part do I still not understand?
Profundizar en los detalles de optimización de concurrencia y tiempos de ejecución del test runner nativo de Node.js bajo escenarios de alta carga simulada.