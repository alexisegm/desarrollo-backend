Formato de error (común a toda la API)
¿Qué forma tiene todo cuerpo de error?: todo cuerpo de error tiene un codigo (code) que es leido por el programa y un mensaje (message) que es leido por la persona. 
¿Qué códigos de error existen?: 400 para errores con body sin campos modificables o con prioridad o estado desconocidos. 404 para solicitudes con recursos inexistentes y 409 para transiciones invalidas o peticiones imposibles por el estado actual, a pesar de estar bien en la forma

GET /requests
Intención: Consultar la coleccion y filtrar solicitudes
Path: /requests
Query: filtra por status (open, in_progress, resolved, closed, cancelled) y por prioridad (medium, high)
Body: (ninguno)
Respuesta exitosa: 200 OK y devuelve la coleccion con coincidencias. Sin coincidencias se devuelve igualmente 200 OK pero con un array vacio []
Errores: si se envia un filtro con error vacio, devuelve 400
Ejemplo: GET /requests?status=open&priority=high. Respuesta sin coincidencias: 200 OK []

GET /requests/:id
Intención: consultar una solicitud especifica.
Path: /requests/:id
Respuesta exitosa: 200 OK con JSON de la solicitud correspondiente
Errores: 404 Not Found. Si el recurso es inexistente
Ejemplos : Peticion: GET /request/999
404 Not Found
{
  "error": {
    "code": "REQUEST_NOT_FOUND",
    "message": "Request 999 does not exist."
  }
}

POST /requests
Intención: Crear una nueva solicitud  
Body: Los campos aceptados por el cliente son title, description y priority. Con lo que el servidor controla, si el cliente envia id, createdAt o updatedAt, el servidor los ignora y genera los suyos propios.
Respuesta exitosa: 201 Created. Muestra la representacion de la solicitud con el ID y la fecha generada por el servidor
Errores: 400. Generado por falta de titulo o por enviar una prioridad desconocida
Ejemplo (Peticion: Body enviado por el cliente):
{
  "title": "Projector failure",
  "description": "the projector does not display an image.",
  "priority": "high"
}

Ejemplo (Respuesta: Generada por el servidor):
201 Created 
{
  "id": 43,
  "title": "Projector failure",
  "description": "The projector does not...",
  "priority": "high",
  "status": "open",
  "createdAt": "2026-08-24T18:30:00.000Z",
  "updatedAt": "2026-08-24T18:30:00.000Z"
}

PATCH /requests/:id
Intención: Modificar parcialmente una solicitud (evita el DELETE crudo)
Body: los campos modificables son title, description, priority y status, y los campos ignorados son id, createdAt y updatedAt
Respuesta exitosa: 200 OK. Indicando una modificacion correcta
Errores: 
Situacion | Estado | Codigo de error
Sin campos | Incorrecto | 400
Valor desconocido | Incorrecto | 400
Solicitud inexistente | Inexistente | 404
Transicion Invalida | Conflicto en el estado | 409
Modificacion de solicitud terminal | Conflicto en el estado | 409
Ejemplos:

Exitosa: Se puede enviar un modificacion parcial como { "priority": "high" } o {"status": "in_progress"}
Ejemplo de 409: Ocurre cuando se intenta enviar un body con status closed a una solicitud con estado open, ya que no esta permitida una transicion directa de estado abierto a cerrado
409 conflict
{
  "error": {
    "code": "INVALID_STATUS:_TRANSITION",
    "message": "A request cannot move from open to closed."
  }
}

