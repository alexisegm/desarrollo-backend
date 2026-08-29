const http = require('node:http');

const PORT = 3000;

const server = http.createServer((request, response) => {
  // Log básico de cada petición recibida
  console.log(`${request.method} ${request.url}`);

  // Ruta raíz
  if (request.url === '/') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('Servidor accesible. Rutas disponibles: /health, /api/info');
    return;
  }

  // Ruta /health
  if (request.url === '/health') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('Servidor funcionando correctamente');
    return;
  }

  // Ruta /api/info
  if (request.url === '/api/info') {
    response.statusCode = 200;
    // Aquí cambiamos a application/json
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Construimos un objeto y lo convertimos a texto JSON
    const info = {
      name: 'servidor-backend',
      version: '1.0.0',
      routes: ['/', '/health', '/api/info']
    };
    response.end(JSON.stringify(info));
    return;
  }

  // Respuesta 404 para rutas inexistentes
  response.statusCode = 404;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});