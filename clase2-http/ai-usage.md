# Uso de Inteligencia Artificial

## 1. Qué le pedí a la IA
* Solicité asistencia para comprender la sintaxis de Express e identificar los fallos semánticos en las rutas y los códigos de estado HTTP originales.
* Pedí apoyo para generar la estructura de los archivos Markdown requeridos (`lite-analysis.md` y `comparison.md`).
* Requerí las sentencias de `curl` para ejecutar las pruebas manuales locales, así como sugerencias de refactorización para el archivo `server.js`.

## 2. Cuándo la utilicé
* **Fase de Análisis:** Para redactar un borrador de las respuestas a las preguntas guía. Posteriormente, **yo validé exhaustivamente estas respuestas** para asegurar que fueran completamente acordes a mis propias consideraciones, análisis empírico y observaciones de los resultados en consola.
* **Fase de Corrección:** Para aplicar las validaciones lógicas y el manejo de errores (400, 404, 201) en el código.
* **Fase de Documentación Final:** Para estructurar la comparación final de las rutas.

## 3. Qué acepté y qué descarté
* **Aceptado:** La estructura técnica para los archivos Markdown y la refactorización lógica del servidor, ya que solucionaban la falla crítica de los estados 200 genéricos.
* **Descartado / Corregido (Pruebas omitidas):** La IA omitió comandos críticos de prueba (A1b, A4, A6, B1, B4) estipulados en los recursos. Detecté este fallo, descarté su análisis inicial incompleto y exigí la inclusión de todos los casos de prueba.
* **Descartado / Corregido (Pérdida de contexto constante):** Durante el desarrollo, la IA perdió repetidas veces el hilo de la conversación y olvidó detalles cruciales de la rúbrica de documentación proporcionada. Tuve que intervenir, descartar sus asunciones erróneas y redirigirla constantemente para asegurar que los entregables finales cumplieran al pie de la letra con las exigencias del proyecto.