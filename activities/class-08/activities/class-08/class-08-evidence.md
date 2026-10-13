# Class 08 evidence — para el checkpoint de la PRÓXIMA clase

El tema 8 NO se evalúa hoy: primero se aprende y se practica. Al comenzar
la próxima clase ejecutarás un checkpoint breve SOLO del tema 8. Este
archivo reúne desde ya la evidencia que ese checkpoint pedirá.

## Evidencia mínima del tema 8

* Baseline anterior al refactor (commit `class-08-baseline`): `f53774e`.
* Commits separados de refactor y feature: `class-08-refactor` es `53c32bbea424bf07a86d914a36eab804421d66de`. FEATURE-801 aún tiene cambios sin commit en el worktree; no se registra un hash de `class-08-feature` hasta crear ese commit.
* `responsibility-map.md` completo: sí, completado en esta revisión a partir del diff entre baseline y refactor.
* Separación route/service/store/policy: la route parsea `:id` y responde; `requests.service.js` coordina autorización, operación e historial; `requests.store.js` contiene las consultas parametrizadas (`assignRequest`, `insertHistoryEvent`); `request.policy.js` decide si el actor puede reclamar. `request.mapper.js` adapta filas SQL a la representación pública.
* Migración de assignment aplicada (005): pendiente de adjuntar la salida real de `npm run db:migrate`; el archivo `database/migrations/005_add_request_assignment.sql` existe, pero su existencia por sí sola no demuestra que se aplicó en la base usada.
* Endpoint claim funcionando: en la ejecución de `npm run test:claim`, el caso de agente reclamando una solicitud abierta respondió 200 y los 8 tests del archivo terminaron aprobados; además, el test de `assignedTo` comprobó 400 `SERVER_CONTROLLED_FIELD`.
* Historial y transacción consistentes: `claimRequest` ejecuta `assignRequest` e `insertHistoryEvent` dentro del mismo `withTransaction`; registra `request_claimed` con `open → in_progress`. Si una operación falla, la transacción evita que asignación e historial queden desincronizados.
* Pruebas de policy (sin HTTP) y de API: `test/request-policy.test.js` y `test/requests-claim.test.js`. La API de claim quedó verificada con 8 pass, 0 fail; el estudiante reporta que `npm test` terminó con 52 pass, pero se debe guardar la salida de esa ejecución para adjuntarla como evidencia.
* Resultado del validador: pendiente. Ejecutar `npm run validate:class-08` y guardar su salida completa en `validation-evidence.txt`; no afirmar `PASSED` hasta observar `FINAL RESULT: PASSED`.

## Explicación integradora (bórrala de memoria: escríbela con el proyecto abierto)

> Explica qué parte de tu trabajo fue refactor y cuál fue nueva
> funcionalidad. Ubica una regla en policy, una coordinación en service,
> una operación SQL en store y explica cómo las pruebas demostraron que el
> comportamiento anterior se conservó.


El refactor de `GET /requests/:id/history` separó responsabilidades sin cambiar su contrato: la route parsea el ID y devuelve los eventos, el service coordina la operación, la policy comprueba quién puede ver el historial, el store ejecuta SQL parametrizado y el mapper construye la respuesta pública.
FEATURE-801 agrega la acción de reclamar una solicitud: la identidad del agente sale del actor autenticado y no del body.
La policy permite reclamar solo si el actor es agente y la solicitud está abierta y sin asignar.
El service reúne esa decisión con la persistencia en una transacción.
El store actualiza `assigned_to` y `status`, y escribe el evento `request_claimed` en la misma transacción.
La prueba de policy ejercita las reglas sin HTTP; las pruebas de API comprueban status, respuesta, permisos y conflictos a través de Express.
El test de `assignedTo` confirmó que el campo controlado por el servidor se rechaza con 400.
Evidencia de npm run db:migrate: npm run db:migrate

> class-08-request-api@8.0.0 db:migrate
> node scripts/migrate.js

DATABASE MIGRATIONS

[SKIPPED] 001_create_users.sql
[SKIPPED] 002_create_requests.sql
[SKIPPED] 003_create_request_history.sql
[SKIPPED] 004_add_constraints_and_indexes.sql
[SKIPPED] 005_add_request_assignment.sql

No pending migrations.

Evidencia de `npm test`: 
ℹ suites 0
ℹ pass 52
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 103852.0968

 Evidencia de `npm run validate:class-08`:
> class-08-request-api@8.0.0 validate:class-08
> node scripts/validate-class-08.js

CLASS 08 ARCHITECTURE VALIDATION

Baseline
[01/12] Previous behavior preserved .......... PASS
[02/12] Existing tests pass .................. PASS

Claim request
[03/12] Authentication required .............. PASS
[04/12] Requester cannot claim ............... PASS
[05/12] Agent can claim open request ......... PASS
[06/12] Agent id comes from token ............ PASS
[07/12] Request becomes in_progress .......... PASS
[08/12] Second claim returns conflict ........ PASS
[09/12] Terminal request cannot be claimed ... PASS
[10/12] History event is created ............. PASS

Boundaries
[11/12] Routes contain no SQL ................ PASS
[12/12] Service does not depend on Express ... PASS

Cleanup
Temporary validation data removed successfully.

FINAL RESULT: PASSED