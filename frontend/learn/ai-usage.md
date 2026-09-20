# AI usage

Este archivo documenta el proceso de co-creación para la Entrega 05B (El mundo de la autenticación).

## My design before AI
Analicé la rúbrica y definí que no quería entregar un "muro de texto" tradicional. Tracé el objetivo de organizar los 20 temas obligatorios en bloques lógicos y establecer tres áreas específicas para inyectar interactividad construida con Vanilla JavaScript, manteniendo una separación estricta entre el layout HTML y la lógica.

## What I asked
Solicité asistencia para idear tres interacciones significativas que cumplieran la "receta de diseño" (decisión, consecuencia, explicación) sin caer en recursos estéticos vacíos como carruseles. También pedí ayuda para curar la investigación teórica en formato de fichas concisas, exigiendo la separación estricta entre dato, interpretación y decisión.

## What the AI proposed
El asistente propuso tres simuladores locales: un "Cadenero" de API para contrastar AuthN vs AuthZ, un simulador forense de JWT para demostrar que firmado no es cifrado, y un árbol de decisión dinámico para arquitectura. Para el diseño, propuso un sistema de inyección de tarjetas de estudio (cards) vía DOM para mantener el HTML limpio.

## What I accepted
Acepté la arquitectura de las tres interacciones porque transformaban el modelo mental del usuario devolviendo códigos de estado simulados (401, 403, 200). Acepté el diseño de inyección de contenido por tarjetas y el sistema de trazabilidad visual (badges) para diferenciar las fuentes primarias de las decisiones de diseño.

## What I rejected
Planteé la idea de ocultar las interacciones detrás de botones desplegables para limpiar visualmente la interfaz. El asistente sugirió rechazar este enfoque porque la rúbrica penaliza esconder el contenido detrás de clics (fricción pedagógica). Decidí descartar la idea de ocultarlas y opté por mantenerlas visibles de inmediato.

## Security mistakes I detected
Aseguré que toda la validación del JWT en el simulador ocurriera estrictamente en el cliente (localmente) sin enviar payloads a un backend real ni solicitar secretos reales, cumpliendo la regla de no usar tokens verdaderos ni construir herramientas ofensivas.

## How I verified the implementation
Ejecuté el servidor de desarrollo en Vite (`npm run dev`) y navegué manualmente a la ruta `/learn/`. Comprobé la reactividad inyectando fallos intencionales en el payload del JWT y forzando rutas de error en el "Cadenero" para confirmar que la interfaz respondiera con las explicaciones correctas.

## What I still do not understand
Aún necesito explorar cómo se implementa el protocolo completo de Passkeys (WebAuthn) a nivel de código frontend puro, más allá de depender de los widgets preconstruidos de los proveedores de identidad gestionados.