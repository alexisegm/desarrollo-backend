# Reflexión - Entrega 03

**1. ¿Qué cambió desde la clase 2?**
La API evolucionó de un CRUD básico a una arquitectura modular orientada al dominio. Se implementó una máquina de estados para controlar el ciclo de vida, validaciones de forma (400), actualizaciones parciales mediante PATCH y un formato unificado y estricto para las respuestas de error.

**2. ¿Qué regla costó más implementar?**
La protección de las transiciones de estado en el método PATCH. Requirió mapear las adyacencias permitidas y separar la lógica en una función dedicada (`isValidTransition`) para evaluar si el salto de un estado a otro estaba autorizado por el negocio antes de tocar el objeto.

**3. Validar contra proteger: ¿Cuál es la diferencia?**
Validar consiste en verificar la "forma" de los datos entrantes (por ejemplo, rechazar un body vacío o una prioridad inexistente) y devuelve un `400 Bad Request`. Proteger es defender las reglas del negocio: los datos pueden tener la forma correcta, pero si la petición intenta romper el flujo lógico (como pasar de `open` a `closed`), el servidor lo impide con un `409 Conflict`.

**4. ¿Por qué no hay método DELETE?**
Como se documentó en la decisión técnica (ADR 001), eliminar registros físicamente destruiría la trazabilidad de los reportes. Para mantener el historial y la auditoría, se optó por usar actualizaciones mediante PATCH hacia el estado terminal `cancelled`.

**5. ¿Qué limitación queda en la API?**
El almacenamiento sigue siendo volátil (un arreglo en memoria), por lo que los datos se pierden al reiniciar el servidor. Además, la API carece de autenticación para identificar quién realiza las modificaciones o creaciones.

**6. ¿Qué sugerencia de IA rechazaste?**
Rechacé los comentarios excesivos generados por la IA en la máquina de estados para mantener el código limpio y conciso. También mantuve una estricta barrera para evitar que la IA interviniera en mi diseño inicial (Fase 1), garantizando que los contratos y mapas de transición fueran de mi autoría exclusiva antes de programar.

**7. ¿Por qué se aisló la lógica en `request-status.js`?**
Para garantizar la cohesión del módulo aislando las reglas de negocio de los manejadores de rutas. De esta forma, la capa HTTP (Express) solo se encarga de recibir y responder peticiones, delegando la responsabilidad de evaluar estados a un dominio independiente.

**8. ¿Qué impacto tuvo definir el contrato HTTP primero?**
Redujo drásticamente la ambigüedad al momento de programar. El contrato sirvió como una especificación estricta; en lugar de inventar validaciones sobre la marcha, la programación se limitó a implementar las reglas de comportamiento y los códigos de error (400, 404, 409) ya acordados.