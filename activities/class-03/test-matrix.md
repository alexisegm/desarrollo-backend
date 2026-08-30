Caso	|Petición	| Estado previo	| Resultado esperado	|  Resultado observado |
| :--- | :---| :---| :---| :---|
|Crear correctamente	| POST /requests |	—	| 201 | |	
|Crear sin título |	POST /requests |	— |	400 |	 |
|Consultar inexistente |	GET /requests/999 |	— |	404 | |	
|Filtrar sin resultados |	GET /requests?status=closed	| —	 |200 []| |	
|Cambiar prioridad |	PATCH /requests/1 |	open |	200	| |
|Transición válida |	PATCH /requests/1 |	open |	200	| |
|Transición inválida |	PATCH /requests/1 |	open |	409	| |
|Modificar cerrada |	PATCH /requests/1 |	closed |	409 | |	

Casos Propios

Caso |	Petición |	Estado previo |	Resultado esperado |	Resultado observado |
| Filtro con valor desconocio | GET /requests?status=unknown_status | - | 400 | |
|Body sin campos modificables | PATCH /requests/1 | open | 400 | |

Evidencia
_(Pega aquí las salidas de curl -i de al menos los casos de transición inválida y de

solicitud terminal: son la prueba de que las reglas están protegidas.)_