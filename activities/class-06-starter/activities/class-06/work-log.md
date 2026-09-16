# Class 06 work log

## Environment

What did I configure?: Variables de entorno
Which command confirmed that it worked?: npm run class-06:doctor

## Request flow

Where does the request enter? En requests.routes.js
Where is authentication checked? Autenticacion del middleware   
Where is authorization checked? En requests.service.js
Where is PostgreSQL accessed? En requests.store.js

## Bug fixed

What was happening? devolvia el error 404
What should happen? retornar el arreglo vacio ([])
Which file did I modify? requests.service.js
Which test protects the behavior? prueba de regresion

## Feature implemented

What does GET /requests/:id/history do? devuelve los eventos del historial
Who can use it? usuarios autorizados definidos previamente (owner y agente)
How is the result ordered? por orden cronologico

## Test explained

Choose one test. A: filtro sin resultados
What data does it prepare? A: usuario con token
What action does it perform? A: una peticion GET filtrada
What does it check? A: busca una respuesta 200 vacia
Which rule does it protect? A: contrato de colecciones vacias

## AI assistance

What did AI help me understand? A: como se extrae el token
What code did it help produce? A: las pruebas automatizadas
What did I verify myself? A: la ejecucion de las pruebas
What suggestion was incorrect or incomplete? A: el uso de snake_case antes que camelCase

## Remaining doubt

What part do I still not understand? De momento ninguna, aunque podria profundizar en el flujo general
