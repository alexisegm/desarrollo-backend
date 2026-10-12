// OPS-703 · Central error middleware (guided skeleton).
import { AppError } from '../app-error.js';
import { logger } from '../logging/logger.js';

// Mapeo de categorías de AppError a códigos de estado HTTP
const CATEGORY_STATUS = {
  contract: 400,
  auth: 401,
  forbidden: 403,
  resource: 404,
  domain: 409
};

// Códigos de infraestructura que indican que la base de datos no está disponible
const INFRASTRUCTURE_CODES = ['ECONNREFUSED', 'ETIMEDOUT', '57P03'];

export function errorHandler(error, req, res, next) {
  // 1. Si los headers ya fueron enviados, delegar al manejador por defecto de Express
  if (res.headersSent) {
    return next(error);
  }

  // Obtener el requestId de forma segura con respaldos
  const requestId = req.requestId || req.id || req.headers['x-request-id'];

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred.';

  // 2. Si es un AppError controlado (verificando instancia, categoría o nombre del constructor)
  if (
    error instanceof AppError || 
    error.category || 
    error.constructor?.name === 'AppError'
  ) {
    status = CATEGORY_STATUS[error.category] || error.status || error.statusCode || 500;
    code = error.code || 'INTERNAL_ERROR';
    message = error.message || 'An unexpected error occurred.';
    res.locals.errorCode = code;
  } 
  // 2b. Si el error trae un status o statusCode explícito
  else if (error.status || error.statusCode) {
    status = error.status || error.statusCode;
    code = error.code || 'ERROR';
    message = error.message || 'An error occurred.';
    res.locals.errorCode = code;
  }
  // 3. Si el error proviene de un body con JSON malformado
  else if (error.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON payload in request body.';
    res.locals.errorCode = code;
  } 
  // 4. Si la base de datos está inaccesible (infraestructura)
  else if (error.code && INFRASTRUCTURE_CODES.includes(error.code)) {
    status = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Database service unavailable.';
    res.locals.errorCode = code;
    logger.error('database_unavailable', {
      requestId,
      code: error.code,
      message: error.message
    });
  } 
  // 5. Cualquier otro error inesperado
  else {
    status = 500;
    code = 'INTERNAL_ERROR';
    message = 'An unexpected error occurred.';
    res.locals.errorCode = code;
    logger.error('unexpected_error', {
      requestId,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }

  // Responder garantizando la estructura exacta esperada por las pruebas
  return res.status(status).json({
    error: {
      code,
      message
    },
    requestId
  });
}