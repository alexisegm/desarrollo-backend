
# AI usage

## My design before AI
Diseñé la arquitectura inicial del frontend basándome en Vanilla JavaScript, separando mentalmente la lógica de UI y las peticiones a la API para evitar un componente monolítico. Planifiqué la bifurcación de la interfaz extrayendo el rol directamente del payload del JWT.

## What I asked
Solicité asistencia para refactorizar y modularizar el archivo principal, manejar correctamente los distintos estados de error HTTP exigidos por la rúbrica y renderizar de forma dinámica las transiciones de estado exclusivas para el rol de Agente.

## What the AI proposed
La IA propuso una reestructuración en carpetas `core/`, `features/` y `services/`. También recomendó el uso de `sessionStorage` para el manejo del token y propuso el uso del método HTTP `PUT` para las actualizaciones de estado en la vista del Agente. Adicionalmente, sugirió código para intentar registrar y leer cambios de prioridad en el historial de las solicitudes.

## What I accepted
Acepté la arquitectura de modularización (Core, Features, Services) y la recomendación de usar `sessionStorage` por encima de `localStorage`, entendiendo que, aunque ambos sufren vulnerabilidades XSS, el borrado automático al cerrar la pestaña reduce la ventana de ataque. También implementé el patrón de Commits Semánticos para mantener un historial de control de versiones estructurado paso a paso.

## What I rejected
Rechacé tajantemente el uso del método `PUT` propuesto por la IA para la modificación de solicitudes. Tras validar el flujo y el contrato del backend, confirmé que el método correcto y esperado por el servidor era `PATCH`, descartando el código de la IA por estar fuera de contexto. 
También rechacé la implementación de lectura de registros de prioridad en el historial, ya que al inspeccionar las respuestas JSON del backend, identifiqué que este no devuelve la prioridad como valor en los logs, haciendo inviable su renderizado en el cliente.

## Security mistakes I detected
Detecté que la IA intentaba forzar actualizaciones asumiendo el comportamiento del servidor. Al analizar el payload del backend directamente en la pestaña Network del navegador, evité inyectar código en el frontend que buscara propiedades inexistentes (como el historial anidado en la petición principal o los logs de prioridad), previniendo fallos silenciosos en la UI.

## How I verified the implementation
Realicé pruebas manuales forzando códigos de error: apagué el servidor Node.js local para detonar el error 503, borré el token del Storage manualmente para verificar la captura del 401, intenté transiciones de estado ilógicas para asegurar la aparición del 409, y documenté cada escenario exitoso mediante capturas de pantalla integradas en el README.

## What I still do not understand
Aún necesito explorar cómo automatizar de forma más eficiente el refresh del token (silent auth) en el frontend antes de que el `sessionStorage` expire durante una sesión activa de trabajo prolongado.