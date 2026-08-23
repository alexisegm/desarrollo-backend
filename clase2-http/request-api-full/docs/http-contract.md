# Contrato HTTP — Request API Full

> El contrato es la promesa que hace tu API; el código es la manera de cumplirla.
> Si primero escribes el código y después el contrato, estarás documentando lo que salió, no
> lo que decidiste.

## Recurso

Una solicitud ('request') representa un ticket de mantenimiento o reporte de falla de infraestructura dentro del sistema, indicando el problema, su prioridad y su estado de resolución.


### Forma del recurso

| Campo       |     Tipo  | Obligatorio | Quién lo asigna |                       Notas                        |
| ------------|    ------ | ----------- | --------------- |                      -----                         |
| `id`        |   Number  |    Si       |  Servidor       |         Autogenerado, único y secuencial           |
| `title`     |   String  |    Si       |  Cliente        | No puede estar vacío ni compuesto solo de espacios.|
|`description`|   String  |    No       |  Cliente        |            Detalle adicional del problema          |
| `status`    |   String  |    Si       |  Servidor       |    Por defecto se asigna como 'open' al crear.     |
| `priority`  |   String  |     Si      |  Cliente        |         Puede ser 'low', 'medium' o 'high'         |

---

## Endpoint 1 — Listar solicitudes

| Elemento              |                           Valor                       |
| --------------------- |                           -----                       |
| Método                |                            GET                        |
| Ruta                  |                       `/requests`                     |
| Entrada               |             Ninguna requerida en esta iteración       |
| Respuesta de éxito    | `200 OK` con un arreglo JSON de todas las solicitudes |
| Respuestas de error   |        Ninguna contemplada para este endpoint         |

**Ejemplo de respuesta**

```json
[
  {
    "id": 1,
    "title": "Projector does not turn on",
    "description": "The projector in room 204 shows no image during class.",
    "status": "open",
    "priority": "high"
  }
]

## Endpoint 2 — Consultar una solicitud

| Elemento              | Valor |
| --------------------- | ----- |
| Método                |    GET   |
| Ruta                  |      /requests/:id |
| Entrada               |  id (Path paramether, numerico)     |
| Respuesta de éxito    |   200 OK con el objeto JSON correspondiente al ID    |
| Respuestas de error   |  404 Not Found si el ID no existe en memoria     |

**Ejemplo de respuesta (éxito)**

```json
{
  "id": 1,
  "title": "Projector does not turn on",
  "description": "The projector in room 204 shows no image during class.",
  "status": "open",
  "priority": "high"
}

**Ejemplo de respuesta (error)**

```json
{
  "error": "Request not found"
}

## Endpoint 3 — Crear una solicitud

| Elemento              | Valor |
| --------------------- | ----- |
| Método                |    POST   |
| Ruta                  | /requests      |
| Entrada               | JSON en el body con title (requerido), description (opcional), priority (opcional)      |
| Respuesta de éxito    | 201 Created con el objeto JSON recien creado (incluyendo id y status)       |
| Respuestas de error   | 400 Bad Request si falla el title o si solo contiene espacios      |

**Ejemplo de body de la petición**

```json
{
  "title": "Leaking faucet",
  "description": "The faucet in the third floor bathroom leaks.",
  "priority": "medium"
}
**Ejemplo de respuesta (éxito)**

```json
{
  "id": 4,
  "title": "Leaking faucet",
  "description": "The faucet in the third floor bathroom leaks.",
  "status": "open",
  "priority": "medium"
}

**Ejemplo de respuesta (error de validación)**

```json
{
  "error": "Title is required"
}

## Reglas transversales

Responde en una línea cada una:

1. ¿Qué `Content-Type` devuelven todas las respuestas?: application/json; charset=utf-8 (gestionado por res.json())
2. ¿Qué estado corresponde a una ruta que no existe en esta API?: 404 Not Found
3. ¿Qué forma tiene siempre un cuerpo de error?: Un objeto JSON con una unica propiedad "error", conteniendo el mensaje
4. ¿Qué campos ignora el servidor si el cliente los envía en el body?: Cualquier campo que no sea title, description o priority

## Decisiones que tomaste y por qué

> Validacion estricta de title: Se decidio retornar 400 no solo si title es undefined, sino tambien si esta en blanco (solo espacios), usando .trim(), para asegurar la integridad de los datos utiles

> Parseo de ID en consulta: El id entra como una string por la URL. Se decidio parsearlo como entero (Number o parseInt) antes de buscarlo para evitar fallos de coincidencia estricta en el arreglo
