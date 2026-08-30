Caso	|Petición	| Estado previo	| Resultado esperado	|  Resultado observado |
| :--- | :---| :---| :---| :---|
|Crear correctamente	| POST /requests |	—	| 201 | HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 170
ETag: W/"aa-BhUzETGDIuKeaCfaFLgBpoWoQZg"
Date: Sun, 30 Aug 2026 18:52:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":4,"title":"Pantalla sin se�al","description":"","status":"open","priority":"medium","createdAt":"2026-08-30T18:52:38.401Z","updatedAt":"2026-08-30T18:52:38.401Z"} |	
|Crear sin título |	POST /requests |	— |	400 |	HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 64
ETag: W/"40-9oPz70EMSulu79lQ34dc+ktY63g"
Date: Sun, 30 Aug 2026 18:53:36 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"MISSING_TITLE","message":"Title is required"}} |
|Consultar inexistente |	GET /requests/999 |	— |	404 | HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 78
ETag: W/"4e-lM045cfCDA8rNlb24+x8aBbQjAY"
Date: Sun, 30 Aug 2026 19:21:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"REQUEST_NOT_FOUND","message":"Request 999 does not exist."}}|	
|Filtrar sin resultados |	GET /requests?status=closed	| —	 |200 []| HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 2
ETag: W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"
Date: Sun, 30 Aug 2026 18:54:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[] |	
|Cambiar prioridad |	PATCH /requests/1 |	open |	200	| HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 188
ETag: W/"bc-42Y0ONUOLnLMxmBCasb/zRoLQtM"
Date: Sun, 30 Aug 2026 18:55:32 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"low","updatedAt":"2026-08-30T18:55:32.633Z"} |
|Transición válida |	PATCH /requests/1 |	open |	200	| HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 195
ETag: W/"c3-DFUlh9sDeU4SmC862Vx11d3iyJ4"
Date: Sun, 30 Aug 2026 18:56:15 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"in_progress","priority":"low","updatedAt":"2026-08-30T18:56:15.464Z"} |
|Transición inválida |	PATCH /requests/1 |	open |	409	| HTTP/1.1 409 Conflict
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-6F3Vt6Lz5+NRs7KW7Al7nrMRuqs"
Date: Sun, 30 Aug 2026 18:57:07 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"INVALID_STATUS_TRANSITION","message":"A request cannot move from open to closed."}} |
|Modificar cerrada |	PATCH /requests/1 |	closed |	409 | HTTP/1.1 409 Conflict
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 124
ETag: W/"7c-9ZYsNC4fRcgqJsazmkr6X3B1a5E"
Date: Sun, 30 Aug 2026 19:00:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"REQUEST_IN_TERMINAL_STATUS","message":"Cannot modify a request in a terminal status (closed/cancelled)."}} |	

Casos Propios

Caso |	Petición |	Estado previo |	Resultado esperado |	Resultado observado |
| Filtro con valor desconocio | GET /requests?status=unknown_status | - | 400 | HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 97
ETag: W/"61-YtaJLm4qzf3Vhep7lgu7EDiqFAw"
Date: Sun, 30 Aug 2026 19:00:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"UNKNOWN_STATUS","message":"Filter status 'unknown_status' is not recognized."}} |
|Body sin campos modificables | PATCH /requests/1 | open | 400 | HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 90
ETag: W/"5a-0Jyl/cwLeVQfQpm8HflK43jS0Xw"
Date: Sun, 30 Aug 2026 19:01:29 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"NO_MODIFIABLE_FIELDS","message":"No valid fields provided for update."}} |

Evidencia

- HTTP/1.1 409 Conflict
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 101
ETag: W/"65-6F3Vt6Lz5+NRs7KW7Al7nrMRuqs"
Date: Sun, 30 Aug 2026 18:57:07 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"INVALID_STATUS_TRANSITION","message":"A request cannot move from open to closed."}}


- HTTP/1.1 409 Conflict
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 124
ETag: W/"7c-9ZYsNC4fRcgqJsazmkr6X3B1a5E"
Date: Sun, 30 Aug 2026 19:00:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"REQUEST_IN_TERMINAL_STATUS","message":"Cannot modify a request in a terminal status (closed/cancelled)."}}