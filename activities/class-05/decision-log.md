# Registro de decisiones — Clase 05

Una entrada por decisión no obvia: qué decidiste, qué alternativas había y por
qué. Como mínimo: dónde guardas la identidad del actor, por qué los recursos
ajenos responden lo que responden, y qué pasa con las solicitudes heredadas.
# Registro de decisiones — Clase 05

* **Ubicación de la identidad:** Decidí almacenar la identidad confiable exclusivamente en `req.auth` dentro del middleware de autenticación, después de verificar criptográficamente el JWT. Nunca se confía en parámetros enviados desde el cliente.
* **Prevención de Enumeración (IDOR):** Ante peticiones de recursos ajenos, decidí responder con un `404 REQUEST_NOT_FOUND` en lugar de un `403`. Un 403 confirmaría a un atacante que el ID existe; un 404 oculta la existencia de la información a usuarios no autorizados.
* **Solicitudes Heredadas:** Las solicitudes sin dueño (`created_by IS NULL`) se programaron para ser invisibles para el rol `requester`. Al aplicar el filtro `userId` en SQL, el valor `null` nunca produce coincidencia con el ID del solicitante, dejándolas accesibles únicamente para el rol `agent`.
* **Protección de Campos:** Se decidió rechazar por completo la petición (Cero cambios parciales) lanzando un `400 SERVER_CONTROLLED_FIELD` si el cliente intenta manipular campos como `createdBy` o `changedBy`.