Nombre del recurso
Solicitud: es la entidad conceptual que el sistema administra.Existe aunque nadie la este consultando.

Propiedades
|Propiedad |	Tipo |	Ejemplo |
|:---|:---|:---|
|id | Numero | 42|
|title | String | "Projector failure" |
|description | String | "the projector does not display an image" |
|priority | String | "high" |
|status | String | "open" |
|createdAt | String ISO | "2026-08-24T18:30:00.000Z" |
|updatedAt | String ISO | "2026-08-24T18:30:00.000Z" |
Campos requeridos
La solicitud no puede existir sin un titulo, de forma obligatoria.

Campos opcionales
Como campos opcionales estan: description, priority (toma el valor medium por defecto) y status (su valor por defecto es open)

Campos generados por el servidor
id, createdAt y updatedAt. No se aceptan del cliente porque la entidad no puede depender de del cliente y las fechas de modificacion deben ser controladas por el sistema

Estados permitidos
open, in_progress, resolved, closed, cancelled

Reglas
* Toda solicitud siempre tiene un ID

* Toda solicitud siempre tiene un titulo 

* Toda solicitud nueva siempre debe comenzar en open

* El estado siempre pertenecera al conjunto de valores permitidos

* Una solicitud cerrada no puede modificarse

* No toda transicion de estado estara permitida

* El campo updatedAt siempre cambiara al modificar una solicitud

Dudas

* Que impide cerrar una solicitud que nunca fue atendida?

* Puede abrirse una solicitud resuelta?

* Que ocurre con la identidad y los datos al reniciar el proceso del servidor?

* Cancelar exige algun estado previo?
