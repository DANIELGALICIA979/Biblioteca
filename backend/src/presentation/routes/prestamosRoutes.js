import { Router } from 'express';
import {
  obtenerEjemplaresDisponibles,
  obtenerMisPrestamos,
  obtenerArchivoPrestamo,
  obtenerProgresoPrestamo,
  solicitarPrestamo,
  devolverPrestamoLector,
  guardarProgresoPrestamo,
} from '../controllers/prestamosController.js';
import { requireReader } from '../middleware/requireReader.js';

const router = Router();

router.use(requireReader);
router.get('/ejemplares-disponibles', obtenerEjemplaresDisponibles);
router.get('/', obtenerMisPrestamos);
router.post('/', solicitarPrestamo);
router.get('/:id/archivo', obtenerArchivoPrestamo);
router.get('/:prestamoId/progreso', obtenerProgresoPrestamo);
router.put('/:prestamoId/progreso', guardarProgresoPrestamo);
router.patch('/:id/devolucion', devolverPrestamoLector);

export default router;
