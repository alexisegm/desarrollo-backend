# Contrato de autenticación — Request API v5

Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
(código HTTP + `error.code`).

# Contrato de Autenticación

## POST /auth/register
- **Éxito**: Responde `201 Created` con el ID del usuario generado. No debe revelar hashes ni contraseñas.
- **Errores**: 
  - `409 Conflict` (código `ACCOUNT_CANNOT_BE_CREATED`) si el correo ya existe. Respuesta genérica.
  - `400 Bad Request` si se intentan enviar campos controlados por el servidor como el rol.

## POST /auth/login
- **Éxito**: Responde `200 OK` entregando un objeto con `accessToken`, `tokenType` (que debe ser exactamente "Bearer") y `expiresIn`.
- **Errores**: 
  - `401 Unauthorized` (código genérico `INVALID_CREDENTIALS` tanto para correos que no existen como para contraseñas incorrectas, previniendo enumeración).

## GET /auth/me
- **Éxito**: Responde `200 OK` con la identidad del token (id, email y rol).
- **Errores**: 
  - `401 Unauthorized` si no hay token Bearer, está vacío, expiró o su firma fue adulterada.

## Semántica de Errores de Acceso
- **401 Unauthorized**: Ausencia de identidad confiable. El usuario no demostró quién es.
- **403 Forbidden**: Actor identificado correctamente, pero no está autorizado para realizar ESTA acción.
- **404 Not Found**: Se utiliza tanto para recursos que no existen como para recursos ajenos, evitando revelar que el recurso de otra persona existe.

¿Cuándo responde tu API `401`? ¿Cuándo `403`? ¿Cuándo `404` aunque el recurso
exista? ¿Cuándo `409`? Escribe el criterio, no solo ejemplos.
