# Comparación: API Lite Original vs. Corregida

## 1. Cambios en las Rutas
* **Ruta de colección:** Se eliminó el endpoint `GET /getRequests` (que utilizaba un verbo en la URL y violaba convenciones REST) y se reemplazó por la ruta correcta `GET /requests`, representando adecuadamente al recurso.

## 2. Cambios en los Códigos de Estado y Lógica
* **Consultas de ID inexistentes:** La ruta `GET /requests/:id` original devolvía un engañoso código `200 OK` junto con un JSON de error cuando no encontraba el ID solicitado. Se corrigió añadiendo una validación que detiene la ejecución y devuelve explícitamente `404 Not Found`.
* **Creación exitosa de recursos:** El endpoint `POST /requests` original respondía con un genérico `200 OK` tras agregar un recurso. Se modificó para devolver `201 Created`, cumpliendo con el estándar semántico de HTTP para la creación de entidades.
* **Validación de entradas requeridas:** El endpoint POST original aceptaba peticiones con cuerpos incompletos (como objetos sin la propiedad `title`), guardándolos en el arreglo. Se añadió una validación estructural `if (!title)` que rechaza la petición y devuelve un `400 Bad Request`, protegiendo la integridad de la información.

## 3. Resumen de Resultados de Prueba
Tras ejecutar la batería de pruebas manuales con `curl`, la API corregida demuestra cumplir con el contrato HTTP esperado: 
- Enruta correctamente el recurso en plural (`/requests`).
- Informa de la falta de un recurso de manera semántica (`404`).
- Bloquea peticiones malformadas (`400`).
- Confirma operaciones de creación con el estado adecuado (`201`).