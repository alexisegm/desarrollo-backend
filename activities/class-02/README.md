# Clase 2: Diseño y Refactorización de APIs HTTP

Este repositorio contiene la resolución de las prácticas de backend enfocadas en el diseño, análisis y refactorización de APIs RESTFUL, manejando correctamente los métodos y códigos de estado HTTP bajo un contrato estricto.

## Estructura del Proyecto

El proyecto está organizado en dos fases, con sus respectivos recursos separados:

*   `/lite-api/`: Contiene la versión de código de un solo archivo (`server.js`), refactorizada a partir de un código defectuoso.
*   `/project/`: Contiene la "Request API Full", construida desde cero bajo una arquitectura de separación de responsabilidades (servidor, app, rutas y datos).
*   `lite-analysis.md`: Evidencia de las fallas de la API Lite previas a cualquier corrección.
*   `ai-usage.md`: Registro detallado de la asistencia de la IA, comandos utilizados y decisiones aceptadas/rechazadas.
*   `comparison.md`: Análisis reflexivo comparando las dimensiones de ambos proyectos.

## Instrucciones de Instalación y Ejecución

Ambos proyectos requieren Node.js (v18+) y funcionan en el puerto 3000. Es imprescindible detener un servidor (Ctrl + C) antes de levantar el otro.

**Para ejecutar API Lite:**

    cd lite-api
    npm install
    npm start

**Para ejecutar API Full:**

    cd project
    npm install
    npm start

## Fase 1: API Lite - Defectos y Correcciones

Durante el análisis inicial independiente, se identificaron y resolvieron los siguientes problemas críticos del contrato HTTP:

1.  **Rutas semánticamente incorrectas:** Se renombró el endpoint `GET /getRequests` a `GET /requests` para respetar la convención de recursos.
2.  **Falsos positivos (200 OK):** Al consultar un ID inexistente (`/requests/999`), el servidor devolvía 200 con un cuerpo de error. Se corrigió para devolver el estado `404 Not Found`.
3.  **Errores de Creación:** El POST para nuevos recursos devolvía un 200 genérico. Se ajustó para retornar `201 Created`.
4.  **Falta de Validación:** El servidor aceptaba peticiones sin `title`, guardando datos corruptos. Se implementó una validación que detiene la ejecución con `400 Bad Request` si falta este campo requerido.

## Fase 2: API Full - Decisiones de Diseño

En la construcción del proyecto transversal se tomaron las siguientes decisiones fundamentales:

*   **Contrato antes que código:** Se redactó íntegramente el archivo `docs/http-contract.md` definiendo formas, restricciones y respuestas esperadas antes de programar la primera ruta.
*   **Aislamiento de lógica (Router):** En `requests.routes.js` se implementó validación estricta usando `.trim()` para rechazar títulos compuestos únicamente por espacios en blanco, protegiendo la integridad de la memoria.
*   **Exclusiones estrictas:** Se rechazó explícitamente el uso de ORMs, bases de datos o capas complejas (controladores/servicios) para mantener el enfoque puramente en las convenciones del protocolo HTTP.

## Tecnologías

* Node.js & Express.js
* Git & GitHub (Historial documentado usando Conventional Commits)