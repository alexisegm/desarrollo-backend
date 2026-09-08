# Reflexión — Entrega 04

**1. ¿Qué fue lo principal que cambió al conectar la base de datos?**
Básicamente, se le quitó la amnesia al servidor. Antes, cada vez que yo detenía el código en la terminal, todas mis solicitudes se borraban. Ahora la información se guarda de verdad en PostgreSQL y sobrevive a cualquier reinicio.

**2. ¿Quién se encarga de proteger qué cosa ahora?**
La base de datos es como un muro rígido: cuida la estructura dura (que el título no esté vacío, que los estados sean exactamente los que definimos y se encarga de repartir los IDs). Por otro lado, la aplicación es la que piensa: cuida las reglas lógicas del negocio, como decidir si pasar de un estado a otro tiene sentido o no.

**3. ¿Por qué la transacción tiene que usar siempre el mismo "cliente"?**
Porque si le lanzo consultas sueltas a la base de datos, las trata como si fueran operaciones separadas. Al pedir prestado un cliente específico para la transacción, puedo empaquetar la actualización de la solicitud y el guardado del historial en un solo bloque indivisible.

**4. ¿De qué nos salva el ROLLBACK?**
Nos salva de guardar verdades a medias. Si logro actualizar el estado de una solicitud pero el registro del historial da un error de repente, el ROLLBACK deshace todo para que la tabla principal quede intacta como si nada hubiera pasado.

**5. ¿Cómo probaste que los datos realmente se quedaban guardados?**
Prendí el servidor y creé una solicitud usando POST (por cierto, aprendí a las malas que si no le pongo `-i` al comando curl, la terminal no me muestra el código 201). Después de crearla, apagué el servidor, lo volví a prender, busqué esa misma solicitud con un GET y su ID, y los datos seguían ahí perfectos.

**6. ¿Para qué sirve exactamente el mapper?**
Es básicamente un traductor. PostgreSQL me escupe los nombres de las columnas separados por guiones bajos (como `created_at`), pero el código de mi API y mi frontend hablan en formato `camelCase`. El mapper se asegura de que ambos lados se entiendan sin chocar.

**7. ¿Por qué es peligroso meter el texto directamente en el SQL y cómo lo arreglaste?**
Si pego lo que escribe el usuario directo en la consulta a la base de datos, alguien podría meter código malicioso. Lo resolvimos parametrizando todo (usando `$1`, `$2`), así PostgreSQL trata ese texto estrictamente como un dato inofensivo y no como instrucciones que debe ejecutar.

**8. ¿Qué pasó con la generación de IDs manuales?**
Ya no tengo que estar llevando la cuenta a mano con una variable de JavaScript. Le delegué esa responsabilidad a la base de datos usando `GENERATED ALWAYS AS IDENTITY` y ella se encarga de dar un número nuevo a cada registro.

**9. ¿Por qué escondemos los errores reales de la base de datos?**
Porque si le muestro al cliente los errores crudos de PostgreSQL, le estoy regalando información a cualquier atacante sobre cómo se llaman mis tablas y columnas por dentro. Por seguridad, los transformamos y mandamos errores limpios como `INTERNAL_ERROR`

**10. ¿Qué lección te dejó intentar configurar todo esto al principio?**
Que los detalles más mínimos te pueden romper todo el código. Estuve un buen rato peleando porque no me conectaba a la base de datos, hasta que me di cuenta de que en mi archivo `.env` se me había olvidado escribir `DATABASE_URL=` antes de pegar el link de conexión.

**11. ¿Por qué usamos un "pool" en vez de conectarnos cada vez?**
Porque abrir una conexión nueva desde cero toma tiempo y esfuerzo de la computadora. El pool es como tener un grupo de conexiones ya listas y calientes; el servidor pide una prestada, la usa, y la devuelve con `client.release()` para que otro proceso la pueda usar después.

**12. ¿Qué fue lo que más te costó de todo el proceso?**
Entender cómo conectar y organizar todas las piezas del rompecabezas: desde separar la lógica aislando el código en el servicio, tener que pasarle el cliente de la base de datos para la transacción, y lograr que las rutas al final de la cadena solo se dediquen a devolver el código HTTP que corresponde.