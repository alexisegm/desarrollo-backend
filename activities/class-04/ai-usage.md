# AI Usage

## My design before using AI
Quiero dejar súper claro que toda la idea inicial y el diseño los armé a mano, sin ayuda de ninguna IA[cite: 4]. Yo mismo pensé, redacté y armé los seis documentos del proyecto (`data-model.md`, `persistence-contract.md`, `query-matrix.md`, `transaction-plan.md`, `error-map.md`, `test-matrix.md`). Hice mi commit `class-04-design` con todo esto listo antes de hacerle la primera pregunta al chat.

## What I asked the AAI
Siguiendo las reglas de la materia, solo le pedí ayuda para cosas muy puntuales:
1. Que le diera una revisada a mi estructura de base de datos, las reglas que le puse y a mi traductor de datos (el mapper).
2. Que se fijara si estaba metiendo la pata con SQL inseguro (como concatenar textos directo) y si me estaba olvidando de cerrar conexiones en el código.
3. Que mirara cómo armé la lógica de la transacción para ver si se iba a quedar trabada, y que me sugiriera cómo probarla correctamente.
4. Que me explicara en palabras sencillas unos errores raros de PostgreSQL que me salieron y cómo era mejor manejarlos.

## What the AI proposed
* **La idea principal:** Me propuso crear una función de ayuda (un helper llamado `withTransaction`) para manejar las transacciones en un solo lugar, pidiéndole una conexión exclusiva a la base de datos usando `pool.connect()`.
* **Lo bueno:** Me asegura que guardar la solicitud y su historial ocurra al mismo tiempo (si falla uno, no se guarda nada) y garantiza que la conexión siempre se devuelva al terminar, pase lo que pase.
* **Lo malo:** Hizo que el código fuera un poco más enredado porque ahora tengo que andar pasándole la conexión manualmente desde el servicio hasta donde guardo los datos.

## What I accepted
Me pareció buena la idea del helper para las transacciones y también tomé su consejo de ordenar los errores por categorías (contrato, dominio, recurso, infraestructura).
* **Decisión:** Aceptar los cambios.
* **Documentación:** Me aseguré de que mis documentos de transacciones y errores reflejaran estos ajustes.
* **Verificación:** Probé todo en mi computadora usando mi matriz de pruebas y funcionó de maravilla.

## What I rejected or accepted
Fui muy estricto con la IA: le dije que no podía inventar cambiándome tablas, columnas, rutas o estados por detrás sin avisarme. También le frené explicaciones larguísimas y cualquier intento de meterme herramientas que no estábamos usando (como ORMs o `supabase-js`), obligándola a trabajar solo con el SQL puro y el contrato que ya habíamos definido.

## How I verified the result
No usé nada automático para probar Fui metiendo comando por comando en mi terminal con `curl` basándome en mi matriz de pruebas. Para estar seguro de que los datos no se borraban, tumbé el servidor de Express por completo y al volverlo a levantar vi que todo seguía ahí. También forcé un error a propósito para comprobar que la transacción de verdad daba marcha atrás (`ROLLBACK`) si algo salía mal.

## What I still do not understand
Todavía me cuesta entender bien cuántas conexiones simultáneas aguanta esto antes de colapsar si mucha gente usa la aplicación al mismo tiempo, y cómo funciona por debajo esa "magia" a nivel de red para mantener las conexiones vivas y reciclarlas, ya que ahorita simplemente me estoy dejando llevar por la configuración que trae el paquete de base de datos por defecto.