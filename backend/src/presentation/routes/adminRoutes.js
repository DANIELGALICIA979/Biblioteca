import { Router } from 'express';
import {
  actualizarLibro,
  crearLibro,
  crearUrlSubida,
  eliminarLibro,
  eliminarArchivoStorage,
  obtenerGenerosAdmin,
  obtenerLibrosAdmin,
  obtenerEstadisticas,
} from '../controllers/adminController.js';
import {
  cancelarSolicitudPrestamo,
  confirmarEntregaPrestamo,
  devolverPrestamoAdmin,
  obtenerPrestamosAdmin,
} from '../controllers/prestamosController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(requireAdmin);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/generos', obtenerGenerosAdmin);
router.get('/libros', obtenerLibrosAdmin);
router.get('/prestamos', obtenerPrestamosAdmin);
router.patch('/prestamos/:id/entrega', confirmarEntregaPrestamo);
router.patch('/prestamos/:id/cancelacion', cancelarSolicitudPrestamo);
router.patch('/prestamos/:id/devolucion', devolverPrestamoAdmin);
router.post('/libros', crearLibro);
router.put('/libros/:id', actualizarLibro);
router.delete('/libros/:id', eliminarLibro);
router.post('/storage/signed-upload', crearUrlSubida);
router.delete('/storage', eliminarArchivoStorage);

export default router;
