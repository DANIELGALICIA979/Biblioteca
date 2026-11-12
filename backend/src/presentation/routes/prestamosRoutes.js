import { Router } from 'express';
import {
  obtenerEjemplaresDisponibles,
  obtenerMisPrestamos,
  obtenerArchivoPrestamo,
  solicitarPrestamo,
  devolverPrestamoLector,
} from '../controllers/prestamosController.js';
import { requireReader } from '../middleware/requireReader.js';

const router = Router();

router.use(requireReader);
router.get('/ejemplares-disponibles', obtenerEjemplaresDisponibles);
router.get('/', obtenerMisPrestamos);
router.post('/', solicitarPrestamo);
router.get('/:id/archivo', obtenerArchivoPrestamo);
router.patch('/:id/devolucion', devolverPrestamoLector);

export default router;
