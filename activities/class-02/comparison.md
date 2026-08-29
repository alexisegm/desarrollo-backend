# Comparación — Lite vs Full

Esta comparación evalúa la evolución del proyecto desde una arquitectura de un solo archivo (Lite) hacia una estructura de responsabilidades separadas (Full), guiada por el cumplimiento estricto de un contrato HTTP.

## Tabla de dimensiones

| Dimensión | Request API Lite | Request API Full |
| :--- | :--- | :--- |
| **Contrato** | Observado de forma empírica y corregido *a posteriori* tras detectar fallos. | Definido estrictamente en `http-contract.md` *antes* de generar cualquier código. |
| **Organización** | Todo agrupado en un único archivo (`server.js`), mezclando datos, configuración y rutas. | Responsabilidades separadas en módulos lógicos (`server.js`, `app.js`, `requests.routes.js`, `requests.js`). |
| **IA** | Utilizada como herramienta de apoyo posterior para refinar el análisis y corregir errores lógicos. | Utilizada desde el inicio como motor de generación bajo restricciones estrictas impuestas por mí. |
| **Lectura** | Recorrido lineal; fácil de leer de arriba hacia abajo, pero propenso al desorden. | Navegación por archivos; requiere entender cómo se exportan e importan los módulos. |
| **Modificación** | Modificar un endpoint implicaba el riesgo de romper la configuración global del servidor. | Los cambios están aislados en el router (`requests.routes.js`), sin afectar la app ni los datos. |
| **Complejidad** | Baja. Ejecución directa sin necesidad de seguir el hilo de los módulos. | Moderada. Introdujo la lógica de montajes de Express (ej: `app.use('/requests', router)`). |
| **Verificación** | Ejecución probando las rutas para descubrir qué hacían realmente. | Pruebas manuales validadas contra los casos de uso esperados y el contrato previo. |
| **Extensibilidad** | Muy limitada; añadir más entidades (ej: usuarios) haría el archivo inmanejable. | Preparada para crecer de forma limpia añadiendo nuevos archivos en la carpeta `routes`. |

## Preguntas de reflexión

**1. ¿Qué problemas del Lite eran problemas HTTP?**
Los códigos de estado incorrectos (devolver 200 en lugar de 404 o 201) y las rutas mal nombradas incluyendo verbos de acción (`/getRequests`), lo que violaba la semántica REST.

**2. ¿Qué problemas eran decisiones de organización?**
El tener el arreglo de datos en memoria, la inicialización del puerto y la lógica de las rutas mezcladas dentro de un solo entorno global en el archivo `server.js`.

**3. ¿Qué resolvió la estructura del Full?**
Resolvió la mezcla de responsabilidades. Ahora el servidor solo escucha peticiones, la aplicación configura el entorno, los datos viven aislados y el router solo se encarga de manejar los endpoints.

**4. ¿Qué complejidad introdujo?**
Introdujo la necesidad de comprender el sistema de módulos de Node (ES Modules con `import`/`export`) y cómo funciona el enrutamiento montado mediante middlewares en Express.

**5. ¿Qué generó bien la IA?**
La lógica de validación estructural (el uso de `.trim()` para evitar cadenas vacías) y la correcta asignación de los códigos HTTP basándose al pie de la letra en la especificación que le proveí.

**6. ¿Qué añadió innecesariamente?**
En la generación de la documentación, introdujo errores de sintaxis en el formato Markdown al no cerrar correctamente los bloques de código JSON, lo cual requirió de mi intervención para arreglar el renderizado visual.

**7. ¿Cuál versión fue más fácil de entender?**
A primera vista, la versión Lite es más rápida de leer por ser un solo archivo. Sin embargo, a nivel arquitectónico, la versión Full es mucho más fácil de comprender porque cada pieza de código tiene un propósito singular y claro.

**8. ¿Cuál sería más fácil de extender?**
Definitivamente la versión Full. Si necesitara crear un endpoint para "empleados", simplemente agregaría un `employees.routes.js` sin tocar para nada la lógica existente de las solicitudes de mantenimiento.

**9. ¿Qué contrato permanecería igual si cambiamos Express?**
Todo el contrato HTTP. Las rutas (`/requests`), los métodos, los códigos de estado y la estructura del JSON serían idénticos independientemente de si usamos Express, Python o Java, porque HTTP es un protocolo universal.

**10. ¿Por qué HTTP es suficiente para este proyecto?**
Porque el modelo de comunicación requerido es simple y transaccional: el cliente solicita una acción (listar, consultar o crear) y el servidor responde de manera inmediata cerrando el ciclo.

**11. ¿Qué cambiaría si necesitáramos actualizaciones en vivo?**
El paradigma de comunicación. Ya no podríamos depender exclusivamente de peticiones del cliente (pull), sino que necesitaríamos un mecanismo para que el servidor envíe datos de forma proactiva (push) al cliente cuando ocurra un cambio.

**12. ¿Utilizaríamos SSE o WebSocket para mostrar progreso?**
Para simplemente "mostrar progreso" de forma unidireccional (del servidor al cliente), Server-Sent Events (SSE) sería la opción más adecuada y ligera. WebSocket lo reservaríamos si el cliente también necesitara enviar flujos constantes de datos al servidor.

**13. ¿Qué ocurriría si crear una solicitud iniciara un proceso de veinte minutos?**
La petición HTTP tradicional se quedaría colgando hasta agotar el tiempo de espera (timeout). Lo correcto sería que la API devolviera inmediatamente un estado `202 Accepted` indicando que el proceso comenzó, en lugar de un `201 Created`.

**14. ¿Cuándo sería razonable una cola de mensajes?**
Sería razonable si tuviéramos picos de tráfico masivos donde cientos de solicitudes deban procesarse simultáneamente. La cola aseguraría que ninguna petición se pierda de forma asíncrona, incluso si el servidor principal está bajo carga máxima.

## Cierre

**Si tuviera que empezar de nuevo el proyecto Full, ¿qué haría distinto y por qué?**
Dedicaría aún más atención a la planificación del archivo `specs.md` inicial para incluir directrices estrictas sobre el formato de salida documental (como el manejo de Markdown). Aprendí que mientras más precisos y exhaustivos sean los límites establecidos por mí al principio, menos tiempo tendré que invertir luego corrigiendo detalles de sintaxis generados por la IA.