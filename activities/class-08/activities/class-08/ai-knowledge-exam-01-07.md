# Examen de conocimiento asistido por IA — clases 1-7

Guarda aquí el TRANSCRIPT COMPLETO de tu examen conversacional
(ITSU-KNOWLEDGE-01-07-1.0): todas las preguntas, todas tus respuestas,
todas las repreguntas y los cuatro bloques del cierre. Sin editar.

> Este examen complementa la evaluación de evidencia: mide lo que puedes
> explicar SIN el repositorio delante. El docente cruza ambos resultados
> y puede verificar cualquier respuesta oralmente.

## Metadata de mi examen

* studentId: alexisgonzalez.itsu@gmail.com
* Modelo utilizado: Gemini Flash Extendido
* Fecha: 29/09/2026
* ¿Formato inválido y reparado una vez?: [no / sí / MODEL_FORMAT_FAILURE]

## TRANSCRIPT COMPLETO (desde COMENZAR hasta el BLOQUE 4)

```text
Comenzar alexisgonzalez.itsu@gmail.com

Registrado el ID alexisgonzalez.itsu@gmail.com. Damos inicio al examen.

Pregunta 1 (Clase 1 — Fundamentos de backend)
En el contexto de nuestra API de gestión de solicitudes, ¿por qué es necesario que el servidor backend permanezca ejecutándose e escuchando activamente en un puerto de manera continua, y qué observa exactamente el cliente (un navegador o un cliente HTTP) si intenta enviar una petición cuando ese proceso está apagado?

Es necesario que el servidor se mantenga activo, ejecutandose, ya que de esta manera es que va a "escuchar" las solcitudes del cliente. Dicho esto, si el servidor no se encuentra ejecutandose, cuando el cliente realice una solicitud, el sistema le devolverá un mensaje de error, dependiendo de como este configurado, en forma de codigo, junto con un titulo y un cuerpo, generalmente en formato JSON

Respuesta registrada.

Repregunta 1:

Si el proceso del servidor backend está completamente apagado y no hay ningún proceso escuchando en el puerto, ¿quién o qué nivel de la red genera la falla de conexión que recibe el cliente (por ejemplo, un error del tipo ERR_CONNECTION_REFUSED), y por qué el servidor backend no puede responder en ese momento con la respuesta HTTP en formato JSON que mencionas?

En este caso, intuyo que la respuesta mas adecuada tiene que ver con la autenticacion del cliente en el servidor, el sistema solo va a responder con el codigo y el titulo. Igual no estoy seguro

Respuesta registrada.

Pregunta 2 (Clase 2 — HTTP y contratos)
En nuestra API de gestión de solicitudes, supongamos dos operaciones distintas:

El cliente quiere filtrar la lista general para ver únicamente las solicitudes con estado "pendiente".

El cliente quiere modificar únicamente el título de una solicitud en particular que ya existe (por ejemplo, la número 42).

¿Qué método HTTP corresponde a cada operación y en qué parte de la petición (path, query, body o headers) debe viajar la información en cada caso y por qué?

Respecto a la primera operacion, el metodo correspondiente es un GET, dado que el cliente esta solicitando registros con una caracteristica especifica, tomando en consideracion de que la informacion debe viajar en el header para ubicar el estado de esa solicitud.



Respecto a la segunda, el metodo es un PATCH, ya que este permite una modificacion del registro o de la solicitud, sin necesidad de hacer un DELETE crudo del log de registro, permitiendo ubicarlo posteriormente en el historial. En este caso la informacion debe viajar en el path para ubicar la ruta especifica de dicha solicitud

Respuesta registrada.

Repregunta 2:

Mencionas que en la primera operación el estado viaja en los headers, y que en la segunda la modificación se ubica en el path. En el caso del PATCH para la solicitud 42, ¿en qué parte de la petición HTTP viaja el nuevo texto del título que se desea guardar y cuál sería la consecuencia o limitación si intentáramos enviar el contenido o cuerpo de los datos modificados dentro del path o de los headers?

No estoy seguro cual de cual seria la consecuencia, pero intuyo que puede haber un conflicto respecto a como se registra la modificacion de la solicitud.

Respuesta registrada.

Pregunta 3 (Clase 3 — Recursos, estado y reglas)
Imagina que un usuario envía una petición PATCH /solicitudes/42 intentando cambiar directamente el campo estado a "aprobada" y el campo monto a -500.

Considerando las reglas de la API, explica qué diferencia existe entre responder con un código 400 Bad Request frente a responder con un código 409 Conflict, y por qué ciertos campos (como el estado o campos controlados por el servidor) no deberían poder modificarse libremente a través de un PATCH enviado por el cliente.

La diferencia de respuesta entre un codigo 400 Bad Request y un codigo 409 Conflict, se puede asociar, en el primer caso a la no existencia del contenido en sí que se está solicitando y en el caso del segundo, se refiere generalmente a un error de privilegios del usuario para realizar ese cambio. Si el cliente pudiese modificar libremente los campos que quisiera, esto podria generar un conflicto o una brecha de datos

Respuesta registrada.

Repregunta 3:

Mencionas que el código 409 se refiere a un error de privilegios del usuario. Si una solicitud se encuentra en estado "rechazada" y un usuario que sí tiene los permisos intenta cambiarla a "aprobada", ¿por qué esta operación representaría un conflicto con el estado del recurso (409 Conflict) y no un problema de autorización (403 Forbidden), y cuál es la diferencia conceptual entre ambas situaciones?

En el caso de una respuesta del servidor con el mensaje 409 se refiere a un conflicto entre lo que se puede cambiar en cuanto al estado de la misma y efectivamente y el 403 se refiere a un conflicto de permisos respecto a lo que le esta permitido hacer a un usuario o no }

Respuesta registrada.

Pregunta 4 (Clase 4 — PostgreSQL y persistencia)
En el desarrollo de nuestra API con PostgreSQL, ¿por qué es una regla fundamental utilizar consultas parametrizadas (pasando los valores como parámetros independientes) al interactuar con la base de datos en lugar de concatenar e interpolar directamente los strings dentro de la sentencia SQL, y qué riesgo técnico o de seguridad específico se evita al hacerlo?

Esto puede generar una brecha de seguridad en cuanto a como se guardan los datos dentro de los registros, ademas de poner en riesgo tecnico el desenvolvimiento correcto de nuestra base de datos

Respuesta registrada.

Repregunta 4:

¿Cuál es el nombre técnico de esa brecha de seguridad específica que se previene al parametrizar las consultas, y qué ocurre conceptualmente dentro del motor de PostgreSQL cuando se separa la estructura de la sentencia SQL de los valores enviados por el usuario?

Estos, intuyo, se llaman o se relacionan con las RSL aunque no se el nombre especifico o tecnico de esa brecha de seguridad ni del proceso en sí dentro del motor cuando se separa la estructura de la sentencia SQL de los valores enviados por el usuario

Respuesta registrada.

Pregunta 5 (Clase 5 — Autenticación y autorización)
En el contexto de nuestra API, cuando un usuario autenticado realiza una petición para actualizar una solicitud, ¿por qué el servidor debe extraer la identidad y el rol del usuario únicamente del token JWT verificado y jamás confiar en un campo como userId o rol enviado en el cuerpo (body) o la URL de la petición? Además, explica la diferencia entre que la API devuelva un estado 401 Unauthorized frente a un 403 Forbidden.

En este caso esto se debe a que el sistema debe realizar una verificacion principalmente de las llaves (.env) de un proyecto, dado que un sistema malicioso puede manipular los datos y hacerse pasar por un usuario valido. La diferencia entre un codigo 401 y un 403 es que uno se fija en las cualidades del cliente, es decir, en lo que puede cambiar y el otro no permite directamente realizar un cambio de la solicitud



Dicho esto, el tiempo de la evaluacion ha terminado. Genera el reporte e indicame los pasos siguentes

BLOQUE 1 — RESULT_CODE
ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=1|C02=1|C03=1|C04=1|C05=1|C06=X|C07=X|ACTION=SUPPORT

BLOQUE 2 — JSON
JSON
{
  "resultCode": "ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-07-K1|C01=1|C02=1|C03=1|C04=1|C05=1|C06=X|C07=X|ACTION=SUPPORT",
  "studentId": "alexisgonzalez.itsu@gmail.com",
  "action": "SUPPORT",
  "signals": [
    "NONE"
  ],
  "classes": [
    {
      "classId": "01",
      "level": 1,
      "question": "¿Por qué es necesario que el servidor backend permanezca ejecutándose e escuchando activamente en un puerto y qué observa el cliente si está apagado?",
      "evidence": "Afirmó que si el servidor está apagado le devolverá un mensaje de error en JSON y atribuyó la falla a la autenticación."
    },
    {
      "classId": "02",
      "level": 1,
      "question": "¿Qué método HTTP corresponde a filtrar y a actualizar el título, y en qué parte de la petición viaja la información?",
      "evidence": "Indicó que el estado para GET viaja en el header y los cambios de PATCH en el path, sin precisar el uso del body."
    },
    {
      "classId": "03",
      "level": 1,
      "question": "Diferencia entre 400 Bad Request y 409 Conflict, y por qué no modificar libremente el estado.",
      "evidence": "Confundió 400 con inexistencia de contenido y 409 con falta de privilegios, ajustando luego a 403."
    },
    {
      "classId": "04",
      "level": 1,
      "question": "¿Por qué usar consultas parametrizadas frente a concatenación en SQL y qué riesgo se evita?",
      "evidence": "Mencionó brechas de seguridad de forma general pero no identificó el término inyección de SQL ni la separación de sentencia/valores."
    },
    {
      "classId": "05",
      "level": 1,
      "question": "¿Por qué extraer la identidad del JWT y no del body, y diferencia entre 401 y 403?",
      "evidence": "Atribuyó la verificación a las llaves .env y no clarificó la distinción entre autenticación (401) y autorización (403)."
    },
    {
      "classId": "06",
      "level": "X",
      "question": "Pregunta no realizada por cierre anticipado a solicitud del estudiante.",
      "evidence": "Sin respuesta por finalización del examen."
    },
    {
      "classId": "07",
      "level": "X",
      "question": "Pregunta no realizada por cierre anticipado a solicitud del estudiante.",
      "evidence": "Sin respuesta por finalización del examen."
    }
  ],
  "reviewTopics": [
    "Anatomía de peticiones HTTP (dónde viajan filtros, parámetros y cuerpos)",
    "Códigos de estado HTTP (400, 401, 403, 404, 409 y fallas de conexión TCP)",
    "Seguridad en base de datos (Inyección SQL y consultas parametrizadas)"
  ],
  "teacherDigest": "Respuesta parcial centrada en clases 1 a 5. Se evidencia confusión en el transporte de datos HTTP, semántica de estados de error y conceptos de seguridad SQL/JWT. Examen finalizado antes de evaluar clases 6 y 7."
}
BLOQUE 3 — REPORTE DEL ESTUDIANTE
Conceptos explicados correctamente:

Identificaste que el servidor backend debe mantenerse en ejecución continua para escuchar las solicitudes entrantes del cliente.

Asociaste correctamente los métodos HTTP según la intención (GET para lectura/filtrado y PATCH para modificación parcial del recurso).

Reconociste la existencia de códigos de estado de error en HTTP y la importancia de no concatenar cadenas directamente en sentencias SQL por razones de seguridad.

Aspectos a reforzar revelados en las repreguntas:

Capa de red y estado del servidor (Clase 1): Un servidor apagado no emite respuestas HTTP ni objetos JSON; la falla ocurre a nivel de red/TCP (por ejemplo, ERR_CONNECTION_REFUSED) al no haber ningún proceso escuchando en el puerto.

Ubicación de datos en peticiones HTTP (Clase 2): Los parámetros de filtrado pertenecen a la query string (?estado=pendiente) y los payloads de modificación viajan en el body, no en los headers ni en el path.

Semántica de errores HTTP (Clases 3 y 5): Es fundamental diferenciar la sintaxis/datos inválidos (400), recursos inexistentes (404), falta de autenticación o quién eres (401), falta de permisos (403) y conflictos con el estado del recurso (409).

Seguridad en la capa de datos e identidad (Clases 4 y 5): La concatenación SQL facilita ataques de Inyección de SQL (evitados al parametrizar), y la identidad del usuario debe derivarse del token JWT firmado para evitar que un cliente suplante un userId o rol manipulando el cuerpo o URL de la petición.

Tres temas prioritarios de repaso:

Estructura y contrato de peticiones HTTP (Clase 2): Revisa en los controladores de la API cómo interactúan req.query, req.params y req.body.

Códigos de estado y reglas de negocio (Clases 3 y 5): Examina el middleware de errores y las políticas de autorización para distinguir entre errores de validación, permisos y transiciones de estado.

Persistencia segura en PostgreSQL (Clase 4): Revisa en la capa store del proyecto el uso de consultas parametrizadas con marcadores ($1, $2).

BLOQUE 4 — FEEDBACK DOCENTE
Prioridades transversales:

Clarificar la separación de responsabilidades entre la capa de red/transporte y la aplicación backend.

Reforzar el vocabulario técnico estándar en desarrollo backend (Inyección de SQL, parámetros de consulta vs. cuerpo de la petición, autenticación vs. autorización).

Señales registradas:

NONE

Preguntas orales sugeridas para refuerzo:

Pregunta: ¿En qué parte de una petición HTTP debe enviarse un filtro de búsqueda frente a los datos necesarios para actualizar un recurso?
Respuesta mínima esperada: Los filtros deben enviarse en la query string (URL), mientras que los datos para actualizar el recurso deben viajar en el cuerpo (body) de la petición.

Pregunta: ¿Cuál es la diferencia conceptual entre un error 401 Unauthorized y un error 403 Forbidden?
Respuesta mínima esperada: 401 indica que la identidad del usuario no ha sido verificada (falta autenticación); 403 indica que la identidad es conocida pero el usuario no tiene permisos para realizar la acción (falta autorización).

Nivel de confianza del examen:

Medio-Alto: Diagnóstico claro sobre las clases 1 a 5. Las clases 6 y 7 no disponen de evidencia evaluable debido al cierre de la sesión a solicitud del estudiante.
```

## Metacognición (responde tú, después del examen)

1. ¿Qué pregunta o repregunta te costó más, y por qué crees que fue esa?

Siento que me costó mas el manejo de especifico de lo que devuelve el servidor al momento de realizar una solicitud, es decir, como devuelve la respuesta de la solicitud, el código, el body y el titulo. 

2. Compara este resultado con tu reporte de evidencia: ¿coinciden? ¿Dónde
   difieren y qué te dice esa diferencia?

El resultado es acorde a mi estado actual en el curso. Me falta definir muchos conceptos basicos para tener claro detalles como la estructura y el contrato de peticiones HTTP, entender correctamente el significado de los codigos de estado y las reglas de negocio entre otras cosas. 