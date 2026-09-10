# AI usage

Este archivo solo puede tener contenido DESPUÉS del checkpoint
`class-05-access-design` (matriz + contrato + amenazas completos).

## My design before AI
Diseñé manualmente la matriz de acceso para los roles `requester` y `agent`, determinando qué operaciones estaban permitidas según el estado de la solicitud y la propiedad del recurso.

## What I asked
Solicité asistencia para implementar la verificación criptográfica de JWT, aislar la propiedad en la capa de datos (prevención de IDOR) y aplicar las políticas puras en el servicio.

## What the AI proposed
El asistente recomendó usar `jwtVerify` de `jose` para validar firmas, implementar un middleware estricto `authenticate` que inyecta `req.auth`, y mover la validación de pertenencia (IDOR) a la cláusula `WHERE` del SQL.

## What I accepted
Acepté la arquitectura sugerida: extraer la identidad en el middleware, aplicar el filtrado en la base de datos (store), y usar funciones puras para las políticas de autorización en la capa de servicio.

## What I rejected
No hubo rechazos mayores; adapté algunos mensajes de error del contrato para que coincidieran exactamente con los requerimientos del validador de la estación.

## Security mistakes I detected
Detecté un error inicial donde la ruta `/auth/me` intentaba procesar el token sin que la verificación estuviera completamente implementada en el servicio, lo que generaba un error 500 en lugar del 401 esperado.

## How I verified the implementation
Ejecutando la suite de pruebas del validador en la terminal (`npm run validate:class-05`) estación por estación, asegurando que cada caso adversarial fuera neutralizado.

## What I still do not understand
Aún necesito explorar cómo manejar la revocación inmediata de un token JWT válido si el usuario es eliminado repentinamente de la base de datos antes de que expire el token.