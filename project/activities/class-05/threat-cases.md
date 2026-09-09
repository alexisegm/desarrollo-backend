# Casos adversariales — Request API v5

Describe al menos ocho ataques que tu implementación deberá resistir, con el
resultado exacto esperado (código HTTP + `error.code`). Piensa como quien NO
respeta tu frontend: registro con `role`, `createdBy` inventado, IDs ajenos,
tokens editados o vencidos, bodies mixtos, headers extraños…

1. Intento de escalada de privilegios durante el registro enviando el campo "role": "agent" o "id" en el cuerpo de la petición.
   → 400 SERVER_CONTROLLED_FIELD

2. Registro de cuenta utilizando un correo electrónico que ya se encuentra previamente registrado en la base de datos.
   → 409 ACCOUNT_CANNOT_BE_CREATED

3. Intento de falsificación de propiedad enviando el campo "createdBy" manipulado al momento de crear una solicitud en POST /requests.
   → 400 SERVER_CONTROLLED_FIELD

4. Acceso a recursos ajenos mediante GET /requests/:id intentando ver una solicitud que pertenece a otro usuario diferente al autenticado.
   → 404 NOT_FOUND (se responde exactamente igual que si la solicitud no existiera).

5. Manipulación de identidad enviando una petición GET /auth/me con un token JWT cuyo payload fue modificado manualmente (ej. cambiando el rol) sin refirmar el token.
   → 401 UNAUTHORIZED

6. Intento de actualización mixta enviando un método PATCH que combina un campo permitido (ej. "title") y un campo prohibido (ej. "priority") por un usuario con rol de requester.
   → 403 FORBIDDEN

7. Prevención de enumeración de cuentas intentando hacer login con un correo electrónico desconocido o con una contraseña incorrecta.
   → 401 INVALID_CREDENTIALS (ambos casos generan respuestas idénticas).

8. Edición fuera de tiempo intentando hacer PATCH al título o descripción por parte del usuario creador (requester) cuando la solicitud ya no se encuentra en estado "open".
   → 403 FORBIDDEN

9. Violación de flujo de trabajo enviando un PATCH para cambiar el estado de "open" directamente a "closed" saltando el progreso por parte de un agente.
   → 409 INVALID_STATUS_TRANSITION

10. Violación de propiedad de contenido enviando un método PATCH para modificar la descripción de una solicitud por parte de un usuario con rol de agente.
   → 403 FORBIDDEN
