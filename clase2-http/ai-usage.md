# AI usage

## What I asked for
* Solicité asistencia para comprender la sintaxis de Express e identificar los fallos semánticos en las rutas y los códigos de estado HTTP originales en la fase Lite.
* Pedí apoyo para generar la estructura de los archivos Markdown requeridos (`lite-analysis.md` y `comparison.md`) y las sentencias `curl` de prueba.
* Para la fase Full, redacté el archivo `http-contract.md` a mano y utilicé la IA únicamente como herramienta de acompañamiento para verificar que el contenido fuera veraz, exacto y correspondiera con lo solicitado en las rúbricas de la materia.
* Solicité la implementación de los manejadores de rutas basándome en una especificación estricta (`specs.md`), exigiendo que se respetaran las exclusiones (sin bases de datos, sin capas extra).

## What the AI proposed
* Propuso borradores para las preguntas guía del análisis y una refactorización inicial para `server.js`.
* Validó mi contrato HTTP redactado manualmente y sugirió ajustes de formato para los bloques de código.
* Para la API Full, propuso el código de `requests.routes.js` utilizando los métodos nativos de Express, validando el título con `.trim()` y retornando los códigos 200, 201, 400 y 404 de acuerdo con el contrato.

## What I accepted
* Acepté la estructura técnica de los archivos Markdown y la refactorización lógica del servidor Lite, ya que solucionaban la falla crítica de los estados 200 genéricos.
* Acepté sus confirmaciones teóricas y ajustes visuales sobre mi redacción manual del contrato HTTP.
* Acepté la implementación del router en la API Full porque respetaba estrictamente el contrato definido y no inventaba funcionalidades fuera de alcance.

## What I changed or rejected
* **Pruebas omitidas (Lite):** La IA omitió comandos críticos de prueba (A1b, A4, A6, B1, B4) en un inicio. Detecté este fallo, descarté su análisis inicial incompleto y exigí la inclusión de todos los casos de prueba.
* **Pérdida de contexto:** Durante el desarrollo, la IA perdió repetidas veces el hilo de la rúbrica. Tuve que intervenir, descartar sus asunciones erróneas y redirigirla constantemente.
* **Errores de formato Markdown (Full):** Al ayudarme a formatear el archivo de contrato `http-contract.md`, la IA cerró incorrectamente múltiples bloques de código JSON, rompiendo la previsualización del documento. Tuve que exigir la corrección de la sintaxis.

## How I verified it
* Validé exhaustivamente las respuestas teóricas mediante mi propio análisis empírico y observación de consola.
* Ejecuté manualmente todos los casos de prueba con `curl` para ambas APIs, confirmando que las respuestas y códigos de estado coincidieran exactamente con lo esperado en el contrato.

## What I still do not understand
* Aún me resulta algo abstracto comprender el flujo interno exacto de los "middlewares" (como `express.json()`). Aunque entiendo de manera práctica que interceptan la petición para transformar el body en un objeto JSON antes de que llegue a mi manejador de rutas, visualizar cómo Express maneja ese flujo de ejecución asíncrono "por debajo" sigue siendo un reto conceptual.