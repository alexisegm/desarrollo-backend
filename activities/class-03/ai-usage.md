# AI usage - Clase 3

## What I asked for
* Solicité asistencia, exclusivamente después de la fase de diseño (tras el tag `class-03-design`), para migrar la estructura del proyecto original a un formato modular (`modules/requests/`) sin romper el funcionamiento existente.
* Pedí apoyo para implementar la máquina de estados en el archivo `request-status.js` y para codificar las validaciones de los endpoints `POST`, `PATCH` y `GET`, asegurándome de que se respetaran las exclusiones (sin bases de datos ni métodos `DELETE`).
* Solicité una revisión de mi borrador manual para la decisión técnica (cancelar vs. borrar), buscando adaptarlo al formato estricto exigido por la rúbrica (Contexto, Opciones, Decisión y Consecuencias).

## What the AI proposed
* Propuso una reestructuración de rutas e importaciones para desacoplar la lógica HTTP del almacenamiento en memoria.
* Propuso el código para centralizar las reglas de negocio en `request-status.js`, incluyendo validadores como `isValidTransition`, `isTerminalStatus` y un validador opcional `isValidStatus`.
* Para los endpoints, propuso la implementación completa de filtros por estado y prioridad en el `GET`, y la lógica para devolver errores `409` en el `PATCH` ante transiciones inválidas.
* Propuso una reestructuración de mi texto de decisión técnica para que encajara visualmente en los bloques requeridos por la rúbrica.

## What I accepted
* Acepté la arquitectura modular propuesta para la máquina de estados, ya que aísla exitosamente las reglas de negocio de los manejadores de rutas (cohesión).
* Acepté el uso del validador opcional `isValidStatus` tras cuestionar su apego al material de la clase; confirmé que cumple con la distinción entre "validar la forma" (error 400) y "proteger la regla" (error 409).
* Acepté la reestructuración de la nota de decisión técnica porque respetó íntegramente mi argumento base sobre la ganancia de auditoría frente a la pérdida de simplicidad.

## What I changed or rejected
* **Comentarios y mensajes de commit:** Rechacé los comentarios excesivos en el código de la máquina de estados generado por la IA; limpié el código para mantenerlo conciso y ajusté los mensajes de los commits a mi propio formato y flujo de trabajo.
* **Separación estricta de fases:** Rechacé la intervención de la IA en la creación inicial de los contratos, mapa de transiciones y matriz de pruebas (Fase 1), garantizando que el diseño original fuera completamente de mi autoría antes del primer commit evaluado.

## How I verified it
* Ejecuté pruebas directas en la terminal con `curl` para confirmar que las importaciones y la nueva estructura de carpetas levantaran el servidor sin errores (`node src/server.js`).
* Sometí el endpoint `PATCH` a pruebas de estrés manuales, confirmando empíricamente que intentar saltar de `open` a `closed` devolvía exactamente el error HTTP 409 con el código `INVALID_STATUS_TRANSITION` estipulado en el diseño.

## What I still do not understand
* Si bien comprendo el flujo de las solicitudes, sus transiciones, la separación de reglas y el concepto general de idempotencia, siento que necesito profundizar mucho más en las implicaciones técnicas de cada uno de estos temas. Considero que son conceptos sumamente complejos para ser asimilados de manera ideal o completa dadas las actuales limitaciones de tiempo, sin el apoyo directo de herramientas de acompañamiento como las IAs. Entiendo y asumo la responsabilidad de buscar la manera de introducirnos de manera personal en la adquisición de este conocimiento, pero la combinación de una alta exigencia técnica y el tiempo limitado dificultan enormemente la tarea de dominar estas arquitecturas de forma autodidacta en principio.