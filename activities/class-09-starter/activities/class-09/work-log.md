# Work log

Registro del trabajo con IA durante el TALLER (la evaluación tiene su
propio historial obligatorio en assessment/). No copies conversaciones
completas aquí: registra el criterio, no el chat.

## What I observed before asking AI

Ejecute los comandos de inicializacion del proyecto (npm run doctor, npm run db:migrate, npm run db:seed y npm test), en los cuales obtuve los 7/7 pass del chequeo de environment, las migraciones saltadas y la suite de pruebas en verde con los 5 todos de la actividad.

## What I asked

[COMPLETAR — las preguntas, resumidas.]

## What the AI proposed

[COMPLETAR]

## Evidence I checked

[COMPLETAR — archivo por archivo: qué afirmación verificaste y contra qué.]

## What I accepted

[COMPLETAR]

## What I rejected
*   **Rechazado:** Filtrar `createdBy` directamente en el `store.js` o en la consulta SQL para el detalle.
*   **Por qué lo rechacé:** Mezcla visibilidad con acceso a datos; un agente también usa ese camino y si filtramos en SQL, el error de "no tienes permiso" ya no sería distinguible de "el ID no existe". Además, la decisión pertenece a la capa de políticas (`request.policy.js`).
*   **Rechazado:** Devolver un código HTTP `403 Forbidden` al usuario sin permisos.
*   **Por qué lo rechacé:** Aunque parezca semánticamente correcto, rompería la regla de no-enumeración de este sistema. El historial ya responde con `404` indistinguible y el ticket pedía igualar este comportamiento.

## What I changed

[COMPLETAR — archivos y qué cambió en cada uno.]

## How I verified it

[COMPLETAR — pruebas, validator, comandos y sus resultados reales.]

## What I still cannot explain

[COMPLETAR — honesto. Alimenta la sección 9 del dossier.]
