Estados
* open: estado inicial de la solicitud

* in_progress: indica que la solicitud se encuentra "en atencion"

* resolved: indica que la solicitud se encuentra en estado por confirmar

* closed: de tipo de estado "terminal", que la solicitud fue cerrada y no se modifica

* cancelled: tambien es de tipo "terminal", indica que la solicitud fue cancelada

Transiciones permitidas
| Desde	| Hacia |	¿Qué la dispara? |
| :--- | :--- | :--- |
|open | in_progress | Iniciar la solicitud |
|in_progress| resolved | Resolver la solicitud |
|resolved | closed | Cerrar la solicitud |
|resolved | in_progress | La resolucion no convencio (retroceso) |
|open | cancelled | Flujo de cancelacion desde el inicio |
|in_progress | cancelled | Flujo de cancelacion desde la atencion |


Transiciones inválidas notables

Intento	| Por qué se rechaza
De open directamente a closed | El Servidor lo rechaza explicando que una solicitud no puede moverse de open a closed y esto choca con el estado actual del recurso
Cualquier modificacion desde closed | Una solicitud cerrada no puede modificarse
Cualquier modificacion desde cancelled | En en flujo del ciclo de una solicitud se explica que la ausencia de "transiciones" de open a closed, o que salga desde closed o cancelled estan prohibidas y por lo tanto se convierte en una regla rigida del negocio 


Estados terminales

* Closed y Cancelled se consideran terminales porque no admiten salida.

* Cuando una solicitud se encuentra en estado terminal y se intenta modificar, el sistema responde con un codigo 409, indicando Conflicto y un mensaje mostrando que la transicion es invalida

Justificación

* A lo largo del Bloque 8 de la clase 3 y en el Laboratorio, se explica el flujo  y las transiciones de estado permitidas por las reglas de negocio, ademas se deja clara la diferencia entre el concepto de proteger reglas versus la validacion de forma.  