# Refactor log — Clase 08

Registro del refactor seguro. Un cambio pequeño por fila, SIEMPRE con las
pruebas como red. Regla: si cambió la ruta, el status, el body o el
permiso, no fue solamente un refactor.

## Antes de empezar

* Prueba(s) que protegen la operación: `test/requests-history.test.js`, en particular `the owner can read the history, oldest event first`, `a stranger requester gets the same 404 as a missing request`, `an agent can read any history` y `history events never expose sensitive information`.
* Resultado de la suite ANTES del refactor: el README de clase documenta el baseline esperado como `39 pass, 13 todo`; no se encontró en los artefactos una salida guardada de esa ejecución concreta, así que no la presento como salida verificada.
* Commit de partida: `f53774e` (`class-08-baseline`).

## Pasos

| # | Qué extraje / moví | ¿A dónde? | Suite después (pass/fail) |
| --- | --- | --- | --- |
| 1 | Extraje del handler la búsqueda de solicitud e historial, la autorización de lectura y el mapeo de eventos; el handler quedó a cargo de leer el ID y responder. | `getHistory` en `requests.service.js`; `findById`/`findHistory` en `requests.store.js`; `canViewHistory` en `request.policy.js`; `mapHistoryEventRow` en `request.mapper.js`. | No hay salida de la suite de ese punto guardada en estos documentos. |

## Verificación final

* Diff revisado: el commit `53c32bb` cambia el interior del handler de historial y añade la coordinación en service; conserva `GET /requests/:id/history`, el status 200, la representación y las respuestas de acceso. No se observó cambio contractual en ese diff.
* Suite completa en verde: la suite actual fue reportada por el estudiante como `52 pass`; no se adjuntó su salida en estos documentos. La prueba `npm run test:claim` sí se ejecutó después del arreglo de `assignedTo`: `8 pass, 0 fail`. Esto verifica claim, no reemplaza la salida completa del momento del refactor.
* Commit del refactor: `class-08-refactor` — `53c32bbea424bf07a86d914a36eab804421d66de`.

## Qué preguntaste a la IA (y qué verificaste)

* Pregunta: por qué el test de `assignedTo` recibía 500 en lugar de 400. Respuesta útil: la ruta lanzaba un `Error` genérico que el middleware central no convierte a 400; el service ya tenía la validación adecuada como `AppError` de categoría `contract`. Se verificó quitando la comprobación duplicada de la ruta y pasando `req.body` al service; `npm run test:claim` terminó con 8 pruebas aprobadas, incluida `assignedTo in the body is rejected as a server-controlled field`.

## Qué propuesta de la IA descartaste por sobrearquitectura

* No consta en esta conversación una propuesta concreta de capa/patrón que se haya descartado, así que no atribuyo una decisión que no está documentada. En el refactor se reutilizaron las capas existentes (`service`, `store`, `policy`, `mapper`) sin añadir una arquitectura paralela.
