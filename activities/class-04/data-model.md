# Data model — Request API v4

Fase 1 · Todo esto lo pensé y lo definí antes de usar IA y de escribir la primera línea de código.
Aquí no solo dibujé la forma de los datos, sino que tomé decisiones reales: cada regla que le puse a la base de datos tiene una razón de ser.

## Tabla requests
Esta es la tabla principal donde viven las solicitudes.

| Columna | Tipo | ¿Obligatorio? | Por defecto | Regla especial | ¿Quién lo llena? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **id** | BIGINT | Sí | Automático | Es la llave primaria | La base de datos |
| **title** | VARCHAR(200) | Sí | - | - | El cliente que usa la app|
| **description** | TEXT | No | - | - | El cliente |
| **priority** | VARCHAR(20) | Sí | 'medium' | Solo valores válidos | La app o la base |
| **status** | VARCHAR(30) | Sí | 'open' | Solo valores válidos | La app o la base|
| **created_at** | TIMESTAMPTZ | Sí | La hora actual | - | La base de datos |
| **updated_at** | TIMESTAMPTZ | Sí | La hora actual | - | La base de datos |

## Tabla request_status_history
Aquí guardamos el rastro de por dónde ha pasado cada solicitud.

| Columna | Tipo | ¿Obligatorio? | Por defecto | Regla especial | ¿Para qué sirve? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **id** | BIGINT | Sí | Automático | Es la llave primaria | Identifica cada movimiento. |
| **request_id** | BIGINT | Sí | - | Llave foránea | Nos dice a qué solicitud pertenece este cambio. |
| **previous_status** | VARCHAR(30) | No | - | Solo valores válidos | Puede estar vacío porque cuando una solicitud nace, no viene de ningún estado anterior. |
| **new_status** | VARCHAR(30) | Sí | - | Solo valores válidos | Siempre tiene que haber un estado de destino válido. |
| **changed_at** | TIMESTAMPTZ | Sí | La hora actual | - | Marca el momento exacto en que cambió. |

## Cómo se conectan
Usamos el `request_id` para amarrar el historial con su solicitud original (es una relación de uno a muchos)[cite: 3]. Esto es súper útil porque la base de datos no te deja crear un historial para una solicitud que no existe, evitando que queden datos sueltos por ahí.

## Lo que cuida la base de datos
* **Datos completos:** Se asegura de que el título, el estado y la prioridad nunca falten.
* **Valores correctos:** Revisa que el estado y la prioridad sean opciones válidas para que no entre basura al sistema.
* **Identidad única:** Se encarga de generar los IDs en orden y sin que se repitan.
* **Historial seguro:** Protege que los registros del historial siempre apunten a algo real.

## Lo que le toca cuidar a la aplicación
* **Los saltos lógicos:** La base de datos sabe cuáles estados existen, pero es mi código el que decide si es válido pasar de un estado a otro.
* **Solicitudes cerradas:** Si una solicitud ya se canceló, la base de datos técnicamente te deja modificarla, pero es la aplicación la que tranca la puerta y rechaza esos cambios.
* **La hora de actualización:** Cada vez que modificamos algo, la aplicación es la responsable de mandarle a la base de datos la nueva hora exacta para el `updated_at`.

## Dudas
* Una pregunta que me surgió viendo los tipos de datos: si estoy usando `TIMESTAMPTZ` para guardar la hora exacta de un evento, ¿la base de datos guarda automáticamente la hora local de mi ubicacion, o se registra obligatoriamente con la zona horaria del lugar físico donde esté alojado el servidor?