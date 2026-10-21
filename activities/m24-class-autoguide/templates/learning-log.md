# Learning log
Student ID: alexisgonzalez.itsu@gmail.com  
Date: 20/10/2026

| Module | What I understood | What confused me | Example in M24 | Status |
| :- | :- | :- | :- | :- |
| Domain | Separación clara de los límites del sistema entre admin web, vending web y backend REST. | Ninguna. | Delimitación de responsabilidades en la arquitectura de M24. | READY |
| Multitenancy | La tabla raiz del sistema debe tenants_id dado que esta va a evitar la incongruencia entre los datos existentes y que todas tengan un campo obligatorio para aislar los datos por empresa. | Ninguna. | Uso de tenant_id obligatorio en tablas operativas para prevenir cruces de información. | READY |
| Authentication and RBAC | Establecer el principio de mínimo privilegio con roles diferenciados y autenticación basada en API Key para dispositivos físicos. | Ninguna. | Roles de admin y operator, junto con códigos HTTP 401 y 403. | READY |
| State machines | El ciclo de vida de las órdenes se rige por transiciones estrictas y estados terminales bien definidos. | Ninguna. | Estados como pending, paid, dispensed y failed. | READY |
| Inventory | Para consultar el stock disponible se debe buscar en physical_stock dentro de la tabla intermedia que relaciona máquinas y productos. | Entender inicialmente cómo modelar la relación de Muchos a Muchos. | Tabla intermedia machine_inventory separando stock físico y reservado. | READY |
| Transactions and concurrency | Es peligroso porque puede ocurrir que dos usuarios realicen la misma solicitud de modificacion al mismo tiempo y se termine produciendo un cambio inconsistente en la base de datos. Un rollback es volver a una version anterior o previa. La actualizacion condicional atomica permite que se realicen dos acciones en una sola sentencia, admitiendo que una de la ventas prime por encima de la otra y evitando que se genere una incongruencia entre la base de datos y el inventario fisico. | La gestión fina de condiciones de carrera bajo alta concurrencia simultánea. | Uso de BEGIN, COMMIT, ROLLBACK y actualización condicional con (physical_stock - reserved_stock) > 0. | READY |
| Idempotency | Las claves de idempotencia evitan que se produzcan cobros reiterados por el mismo producto a los clientes, y a la vez que se descuenten productos repetidos. El backend deberia retornar exactamente la misma respuesta de validacion de pago sin generar un nuevo cobro ni descuento. | Ninguna. | Uso del encabezado Idempotency-Key respaldado por una restricción UNIQUE en la base de datos. | READY |
| Payment and dispensing | La integración segura entre la confirmación del pago externo y la activación del mecanismo físico de despacho. | Ninguna. | Transición de órdenes de pending a paid y posteriormente a dispensed. | READY |
| Security | El aislamiento estricto de datos por tenant previene brechas de seguridad multiempresa a nivel de consultas SQL. | Ninguna. | Filtrado obligatorio por tenant_id en todas las operaciones del backend. | READY |
| Testing and production | La importancia de validar esquemas, migraciones y pruebas de estrés antes de llevar el sistema a producción. | Ninguna. | Acciones recomendadas de indexación y pruebas de concurrencia. | READY |

## Three concepts I can explain
1. Multitenencia
2. Maquinas de estado
3. Idempotencia

## Three questions I still have
1. Transacciones y concurrencia (profundizar en escenarios extremos de bloqueo de filas en PostgreSQL).
2. ¿Cómo manejar fallos de red intermitentes durante el callback de despacho físico de la máquina?
3. ¿Cuál es la estrategia óptima de índices en PostgreSQL para tablas multitenant de alto volumen?

## Tutor readiness report

Informe de Preparación para el Aprendizaje M24


Conceptos listos

• Multitenencia y aislamiento de datos: Comprensión de las estructuras de tenant raíz y el ámbito obligatorio de tenant_id en todas las tablas operativas.
• Control de concurrencia: Dominio de las actualizaciones condicionales atómicas para prevenir condiciones de carrera y inventario negativo durante escenarios de alta concurrencia.
• Idempotencia: Aplicación práctica de cabeceras Idempotency-Key combinadas con restricciones de unicidad en la base de datos para manejar con seguridad reintentos y doble clics.
• Diseño de esquemas relacionales: Modelado adecuado de relaciones muchos a muchos utilizando tablas intermedias (machine_inventory) y seguimiento granular de stock (physical_stock vs. reserved_stock).
• Integridad transaccional: Utilización de transacciones de bases de datos (BEGIN, COMMIT, ROLLBACK) para asegurar la atomicidad entre los ajustes de inventario y la creación de órdenes.
• Auditoría y trazabilidad: Estructuración de tablas de movimientos de inventario (inventory_movements) para la rendición de cuentas operativa.


Conceptos que necesitan repaso

• Ninguno identificado; el estudiante articuló y aplicó con éxito todos los conceptos arquitectónicos principales a lo largo de los módulos.


Conceptos erróneos importantes corregidos

• Manejo de duplicidad de órdenes: Inicialmente atribuyó la prevención de duplicados únicamente a las llaves foráneas; se corrigió para comprender el rol fundamental de las restricciones de unicidad y las claves de idempotencia en la seguridad de transacciones.
• Ámbito de tenant en JOINs: Se aclaró que depender de uniones de tablas para inferir la pertenencia de un tenant introduce cuellos de botella de rendimiento y riesgos de seguridad, estableciendo la necesidad de columnas tenant_id directas en las tablas operativas.


Decisiones que el estudiante puede explicar

• Por qué las tablas operativas deben incluir tenant_id directamente para una seguridad estricta y rendimiento óptimo de consultas.
• Cómo las actualizaciones SQL condicionales atómicas evitan que dos clientes simultáneos compren la última unidad disponible.
• Por qué las claves de idempotencia protegen tanto los saldos de los usuarios como la precisión del inventario durante condiciones de red inestables.


Preguntas que siguen abiertas

• Ninguna; todas las preguntas diagnósticas y de comprobación se resolvieron con éxito.


Tres acciones recomendadas antes de la implementación

1. Migraciones e indexación de base de datos: Establecer migraciones del esquema de PostgreSQL con restricciones de llaves foráneas adecuadas, índices en tenant_id y restricciones de unicidad para las claves de idempotencia.
2. Pruebas de concurrencia: Escribir pruebas de integración automatizadas simulando peticiones simultáneas para el último artículo del inventario con el fin de validar el manejo de concurrencia.
3. Seguridad de Webhooks y pasarelas: Definir mecanismos de verificación de firmas para los webhooks entrantes de la pasarela de pagos antes del despliegue en producción.


Preparación por módulo

| Módulo | Descripción | Estado |
| :--- | :--- | :--- |
| Módulo 1 | Límites de Sistema y Arquitectura | READY |
| Módulo 2 | Multitenencia y Aislamiento | READY |
| Módulo 3 | RBAC y Autenticación | READY |
| Módulo 4 | Máquinas de Estado | READY |
| Módulo 5 | Inventario y Auditoría | READY |
| Módulo 6 | Transacciones y Concurrencia | READY |
| Módulo 7 | Idempotencia y Reintentos | READY |
| Módulo 8 | Diseño de Esquema Relacional (PostgreSQL) | READY |
| Módulo 9 | Implementación Backend (Node.js / Express) | READY |
| Módulo 10 | Flujo Operativo e Integración Final | READY |