# Reflexión — Clase 05

1. **¿Qué diferencia hay entre identidad, autenticación y autorización?**
   La identidad es quién afirmas ser (ej. un ID o correo). La autenticación es demostrar matemáticamente que eres esa persona (mediante contraseña o firma de token). La autorización es verificar si esa identidad demostrada tiene permiso para realizar una acción específica.

2. **¿Por qué `createdBy` y `changedBy` nunca llegan desde el body?**
   Porque confiar en el cuerpo de la petición permitiría escalamiento de privilegios. Un usuario malicioso podría inyectar el ID de un administrador. Estos campos deben ser poblados exclusivamente en el backend leyendo el objeto `req.auth` generado por el token validado.

3. **¿Qué diferencia hay entre `401` y `403`? ¿Y por qué a veces `404`?**
   El 401 significa "No sé quién eres o tu credencial es inválida". El 403 significa "Sé quién eres, pero no tienes permiso para esto". Se usa el 404 (en lugar del 403) al intentar acceder a registros ajenos para evitar ataques de enumeración (IDOR), haciendo imposible saber si el registro existe o no.

4. **¿Por qué decodificar un JWT no permite confiar en él?**
   Decodificar solo traduce el Base64 a texto legible. Cualquier persona puede modificar el contenido en texto plano y volver a codificarlo. Solo verificando la firma (que requiere la clave secreta) podemos asegurar que el token fue emitido por nosotros y no fue alterado en tránsito.

5. **¿Por qué el `agent` sigue sujeto a la máquina de estados?**
   Porque las reglas de dominio son inmutables e independientes del rol de acceso. Un agente, aunque tenga permisos elevados para modificar estados, no puede violar la lógica del negocio (como reabrir un ticket cerrado sin pasar por el flujo correspondiente).

6. **¿Qué intentó romper el validador y qué limitación conserva esta solución?**
   El validador intentó suplantar usuarios modificando el payload del JWT, intentó editar recursos ajenos adivinando IDs, y envió peticiones mixtas. La principal limitación que conserva nuestra solución es la falta de revocación de tokens (si un agente es despedido hoy, su token sigue siendo válido hasta que el tiempo expire).