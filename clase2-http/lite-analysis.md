# Análisis del proyecto Lite

## 1. Cómo ejecuté la API
Comando utilizado: `node server.js`
Salida en terminal: `Request API Lite is running on http://localhost:3000`

## 2. Tabla de análisis

| Endpoint | Intención | Entrada | Respuesta actual | Problema | Propuesta |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /getRequests` | Listar solicitudes | Ninguna | *(Pegar evidencia de A1 aquí)* | La ruta incluye un verbo (`getRequests`), violando las convenciones. No admite query parameters. | `GET /requests` devolviendo 200 OK. |
| `GET /requests/:id` | Consultar solicitud existente | `1` | *(Pegar evidencia de A2 aquí)* | Correcto. | Mantener igual, 200 OK. |
| `GET /requests/:id` | Consultar solicitud inexistente | `999` | *(Pegar evidencia de A3 aquí)* | Devuelve un estado `200 OK` con un cuerpo de error, contradiciendo el contrato HTTP. | `GET /requests/:id` devolviendo 404 Not Found. |
| `POST /requests` | Crear solicitud sin título | Body JSON sin `title` | *(Pegar evidencia de A5 aquí)* | Devuelve estado 200 OK en lugar de código de error, no valida los datos requeridos y guarda el registro incompleto. | `POST /requests` devolviendo 400 Bad Request. |
| `GET /requests` | Listar solicitudes por recurso | Ninguna | 404 Not Found (HTML genérico) | La ruta correcta del recurso no existe en el servidor original. | `GET /requests` devolviendo 200 OK. |
| `POST /requests` | Crear solicitud válida | JSON completo con title | 200 OK con el objeto creado | Devuelve un estado 200 genérico en lugar de 201 Created. | `POST /requests` devolviendo 201 Created. |
| `GET /getRequests` | Comprobar efecto de creación | Ninguna | 200 OK con arreglo que incluye el objeto inválido de A5. | El servidor guardó el objeto sin título porque no validó la entrada. | El GET posterior no debe contener objetos malformados. |

## 3. Evidencia

**1. Comando (A1):** `curl -i http://localhost:3000/getRequests`
**Respuesta:**

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 462
    ETag: W/"1ce-UeWGg57KI0WDFqS2DC2oeTJY0HY"
    Date: Sat, 22 Aug 2026 19:21:16 GMT
    Connection: keep-alive
    Keep-Alive: timeout=5

    [{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"},{"id":2,"title":"Broken chair in the lab","description":"One chair in the computer lab has a loose back rest.","status":"in-progress","priority":"medium"},{"id":3,"title":"Wi-Fi drops in the library","description":"The connection drops every few minutes on the second floor.","status":"open","priority":"low"}]

**2. Comando (A1b):** `curl -i http://localhost:3000/requests`
**Respuesta:**

    HTTP/1.1 404 Not Found
    X-Powered-By: Express
    Content-Type: text/html; charset=utf-8
    Connection: keep-alive
    Keep-Alive: timeout=5

    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>Error</title>
    </head>
    <body>
    <pre>Cannot GET /requests</pre>
    </body>
    </html>

**3. Comando (A2):** `curl -i http://localhost:3000/requests/1`
**Respuesta:**

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 150
    ETag: W/"96-df4rlkwXJG0/cHPmZF1L5gR5rfI"
    Date: Sat, 22 Aug 2026 19:21:32 GMT
    Connection: keep-alive
    Keep-Alive: timeout=5

    {"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"}

**4. Comando (A3):** `curl -i http://localhost:3000/requests/999`
**Respuesta:**

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 29
    ETag: W/"1d-P5l7jokQoptb6vUGaJB1Jdokrdc"
    Date: Sat, 22 Aug 2026 19:21:46 GMT
    Connection: keep-alive
    Keep-Alive: timeout=5

    {"error":"Request not found"}

**5. Comando (A4):** `curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d '{"title":"Leaking faucet","description":"The faucet in the third floor bathroom leaks.","priority":"medium"}'`
**Respuesta:**

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Connection: keep-alive
    Keep-Alive: timeout=5

    {"id":4,"title":"Leaking faucet","description":"The faucet in the third floor bathroom leaks.","status":"open","priority":"medium"}

**6. Comando (A5):** `curl -i -X POST http://localhost:3000/requests -H "Content-Type: application/json" -d '{"description":"No title at all","priority":"low"}'`
**Respuesta:**

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Connection: keep-alive
    Keep-Alive: timeout=5

    {"id":5,"description":"No title at all","status":"open","priority":"low"}

**7. Comando (A6):** `curl -i http://localhost:3000/getRequests`
**Respuesta:**

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Connection: keep-alive
    Keep-Alive: timeout=5

    [{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"},{"id":2,"title":"Broken chair in the lab","description":"One chair in the computer lab has a loose back rest.","status":"in-progress","priority":"medium"},{"id":3,"title":"Wi-Fi drops in the library","description":"The connection drops every few minutes on the second floor.","status":"open","priority":"low"},{"id":4,"title":"Leaking faucet","description":"The faucet in the third floor bathroom leaks.","status":"open","priority":"medium"},{"id":5,"description":"No title at all","status":"open","priority":"low"}]

## 4. Preguntas guía

* **¿Qué recurso representa esta API y cómo se nombra en cada una de sus rutas?**
Representa solicitudes de mantenimiento. En una ruta se nombra erróneamente como acción (`/getRequests`), y en las otras correctamente como recurso (`/requests` y `/requests/:id`).
* **¿Qué método HTTP corresponde a cada intención, y coincide con el que usa el código?**
Listar: GET. Consultar: GET. Crear: POST. Sí coinciden con los métodos expuestos en el código de Express.
* **¿Qué código de estado devuelve cada respuesta y qué afirma exactamente ese código?**
Devuelve siempre estado 200 OK. Afirma que la petición fue procesada con éxito, incluso cuando se consultan IDs inexistentes o se crean recursos.
* **¿Hay alguna respuesta cuyo estado contradiga su propio cuerpo? ¿Cuál y por qué?**
Sí, `GET /requests/999` devuelve un estado de éxito (200) pero su cuerpo es un JSON de error: `{"error":"Request not found"}`.
* **¿Qué entradas acepta el servidor sin comprobarlas, y qué consecuencia tiene aceptarlas?**
El método POST acepta cuerpos sin los campos requeridos (`title`, `description`). Como consecuencia, guarda en el arreglo objetos con valores `undefined`.
* **¿Cómo distinguiría un cliente automático un éxito de un error sin leer el cuerpo?**
En la versión actual de esta API, un cliente automático no puede distinguirlo, ya que el estado siempre es 200 OK.
* **¿Qué parte del comportamiento observado no podía deducirse leyendo solo las rutas?**
Que el servidor omite las validaciones en la creación de recursos y que maneja los errores enviando respuestas de éxito con mensajes de fallo.
* **Si otra persona consumiera esta API sin ver el código, ¿qué supuesto la haría fallar?**
Asumir que si la petición falla recibirá un código de estado de error (4xx o 5xx). Al recibir un 200, el código del cliente podría intentar leer propiedades inexistentes del recurso y provocar un fallo en su propio sistema.

## 5. Conclusión
El problema más grave es devolver 200 OK cuando hay un error lógico (como un recurso no encontrado o un body malformado). Esto rompe la confianza del contrato HTTP, ya que un cliente programado automáticamente asumirá que la operación triunfó, procesará un error como si fuera un dato válido y provocará fallos en cadena difíciles de rastrear.git