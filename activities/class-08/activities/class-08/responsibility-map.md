# Responsibility map — Clase 08

Mapa de responsabilidades del handler cargado ANTES de refactorizar.
Complétalo mientras lees `GET /:id/history` en `requests.routes.js`.

## El handler analizado

Ruta/operación: `GET /requests/:id/history`

## Clasificación de bloques

Para cada bloque del handler, anota a qué categoría pertenece y qué líneas
lo forman (aprox.):

| Categoría | ¿Qué hace ese bloque aquí? | ¿A qué archivo debería moverse? |
| --- | --- | --- |
| HTTP (leer params/identidad) | Leía `req.params.id`, lo validaba y convertía a número; usaba `req.auth` para identificar al actor. | `requests.routes.js` para leer la petición; `parse-id.js` para validar el parámetro. |
| Aplicación (coordinar el caso) | Buscaba primero la solicitud y luego su historial; la coordinación no tenía una función propia. | `requests.service.js` (`getHistory`). |
| Negocio (¿puede verse?) | Comprobaba si el actor era agente o dueño; ocultaba una solicitud ajena respondiendo igual que si no existiera. | `request.policy.js` (`canViewHistory` / `canViewRequest`), invocada desde el service. |
| Persistencia (SQL) | Ejecutaba consultas parametrizadas para leer la solicitud y los eventos, directamente desde el handler. | `requests.store.js` (`findById`, `findHistory`). |
| Presentación (construir respuesta) | Transformaba filas SQL a objetos públicos camelCase y omitía campos internos, inline. | `request.mapper.js` (`mapRequestRow`, `mapHistoryEventRow`). |
| Observabilidad (errores/requestId) | El handler podía lanzar errores; el request ID, el logging y la traducción central a HTTP ya los gestiona middleware fuera de este handler. | No mover desde aquí; se conserva en `middleware/request-id.js`, `middleware/request-logger.js` y `middleware/error-handler.js`. |

## Las preguntas del análisis

* ¿Cuántas RAZONES distintas tiene esta función para cambiar?

  Al menos cinco: cambia el contrato HTTP/validación del ID, la coordinación del caso, la regla de visibilidad, las consultas/esquema de persistencia y la representación pública de los eventos. La observabilidad ya está centralizada y no era una responsabilidad inline del handler.

* ¿Qué piezas ya existentes del proyecto duplica? (pista: mira store, mapper y policy)

  Duplica consultas que corresponden a `findById` y `findHistory` del store; la conversión de filas a la respuesta que corresponde a los mappers; y la regla agente/propietario que corresponde a `canViewHistory` de la policy.

* ¿Qué NO se puede probar de forma aislada mientras todo viva junto?

  No se puede probar la regla de visibilidad como función pura sin HTTP ni base de datos, ni probar por separado la conversión de eventos SQL a la representación pública. La extracción permite probar policy y mapper aparte, y deja la integración HTTP/SQL a las pruebas de API.
