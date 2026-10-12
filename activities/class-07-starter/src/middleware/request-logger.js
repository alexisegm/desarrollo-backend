// OPS-703 · Request logger middleware (guided skeleton).
//
// Goal: ONE structured JSON line per finished request, whatever its
// outcome. The logger module (src/logging/logger.js) already formats and
// writes lines — this middleware only decides WHEN to log and WHICH
// fields to include.
//
// TODO(OPS-703): implement the middleware. Checklist:
//   [ ] Record the start time when the request enters
//       (process.hrtime.bigint() measures monotonic time).
//   [ ] Subscribe to the response 'finish' event — the only moment the
//       final status code is known.
//   [ ] Build the fields from an explicit ALLOWLIST:
//       requestId, method, path, status, durationMs
//       ... plus userId when req.auth exists, and res.locals.errorCode
//       when the error handler set one.
//   [ ] Use logger.error with event 'request_failed' for status >= 500,
//       logger.info with event 'request_completed' otherwise.
//   [ ] Call next() immediately — logging must never delay the request.
//
// Questions before coding:
//   - Why an allowlist instead of logging the whole request object?
//   - Which header must NEVER appear in a log line? (INC brief OPS-703)
import { logger } from '../logging/logger.js';

export function requestLogger(req, res, next) {
  // 1. Registrar el tiempo de inicio con alta precisión (monotonic time)
  const start = process.hrtime.bigint();

  // 2. Suscribirse al evento 'finish' de la respuesta (el único momento donde el status final es conocido)
  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationMs = Number(durationNs) / 1_000_000;
    const status = res.statusCode;

    // 3. Construir los campos utilizando una allowlist estricta
    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status,
      durationMs: Math.round(durationMs)
    };

    // Agregar userId si el usuario está autenticado
    if (req.auth && req.auth.userId) {
      logData.userId = req.auth.userId;
    }

    // Agregar errorCode si el manejador de errores lo estableció en res.locals
    if (res.locals && res.locals.errorCode) {
      logData.errorCode = res.locals.errorCode;
    }

    // 4. Registrar usando error para códigos >= 500 e info para el resto
    if (status >= 500) {
      logger.error('request_failed', logData);
    } else {
      logger.info('request_completed', logData);
    }
  });

  // 5. Llamar a next() de inmediato para no retrasar el flujo de la petición
  next();
}
