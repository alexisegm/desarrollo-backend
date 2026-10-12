import { Router } from 'express';
import { pool } from '../../database/pool.js'; // Ajusta la ruta relativa a tu pool de base de datos si es necesario

export function createHealthRouter({ checkDatabase } = {}) {
  const router = Router();

  // Liveness: ¿El proceso responde? No toca la base de datos.
  router.get('/health', (req, res) => {
    return res.status(200).json({ status: 'ok' });
  });

  // Readiness: ¿Puede hacer trabajo útil? Comprueba con la base de datos.
  router.get('/ready', async (req, res, next) => {
    try {
      const checker = checkDatabase || (async () => {
        await pool.query('SELECT 1');
      });

      await checker();
      return res.status(200).json({ status: 'ready', database: 'available' });
    } catch (error) {
      // La indisponibilidad de la base es un resultado ESPERADO para readiness (503), sin filtrar detalles internos
      return res.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  return router;
}

// Exportación por defecto ya instanciada para app.js
export const healthRoutes = createHealthRouter();