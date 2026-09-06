# Data model — Request API v4

Fase 1 · se completa antes de usar IA y antes de tocar código.
El esquema expresa decisiones sobre los datos, no solo su forma: cada NOT NULL, DEFAULT y CHECK debe poder defenderse.

## Tabla requests

| Columna | Tipo | ¿Nulo? | Default | Restricciones | ¿Quién lo genera? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **id** | BIGINT | No | (Identity) | PRIMARY KEY | Base de datos |
| **title** | VARCHAR(200) | No | Ninguno | Ninguna | Aplicación (Cliente) |
| **description** | TEXT | Sí | Ninguno | Ninguna | Aplicación (Cliente) |
| **priority** | VARCHAR(20) | No | 'medium' | CHECK | App / Base de datos |
| **status** | VARCHAR(30) | No | 'open' | CHECK | App / Base de datos |
| **created_at** | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | Ninguna | Base de datos |
| **updated_at** | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | Ninguna | Base de datos |

## Tabla request_status_history

| Columna | Tipo | ¿Nulo? | Default | Restricciones | Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **id** | BIGINT | No | (Identity) | PRIMARY KEY | Identificador único del evento. |
| **request_id** | BIGINT | No | Ninguno | FOREIGN KEY | Referencia a `requests(id)`. |
| **previous_status** | VARCHAR(30) | Sí | Ninguno | CHECK | Admite NULL porque el nacimiento de una solicitud no viene de ningún estado previo (pasa de la nada a 'open'). |
| **new_status** | VARCHAR(30) | No | Ninguno | CHECK | No admite NULL porque siempre se transiciona hacia un estado válido. |
| **changed_at** | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | Ninguna | Fecha y hora exacta de la transición. |

## Relaciones
La clave foránea `request_id` en la tabla `request_status_history` relaciona los eventos históricos con su solicitud de origen en la tabla `requests` (relación de 1 a muchos). Esto prohíbe crear un evento histórico para una solicitud inexistente, evitando registros huérfanos.

## Reglas protegidas por la base
* **NOT NULL:** Garantiza la presencia obligatoria del título, estado y prioridad.
* **CHECK:** Restringe `status` y `priority` a sus valores permitidos, evitando que datos inválidos entren por cualquier vía.
* **PRIMARY KEY e IDENTITY:** Garantiza unicidad y delega la generación secuencial del ID a la base de datos.
* **FOREIGN KEY:** Protege la integridad referencial del historial.

## Reglas que sigue protegiendo la aplicación
* **Transiciones permitidas:** La base sabe qué estados existen, pero la máquina de estados que controla el flujo vive en la aplicación.
* **Restricción de modificación en estados terminales:** La base de datos no bloquea automáticamente actualizaciones sobre una solicitud cancelada; es la lógica en la aplicación la que rechaza la petición.
* **Gestión de `updatedAt`:** La aplicación es la encargada de enviar la nueva fecha y hora en cada modificación (`PATCH`).

## Dudas
* Ninguna documentada hasta el momento.