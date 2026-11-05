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
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(requireAdmin);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/generos', obtenerGenerosAdmin);
router.get('/libros', obtenerLibrosAdmin);
router.post('/libros', crearLibro);
router.put('/libros/:id', actualizarLibro);
router.delete('/libros/:id', eliminarLibro);
router.post('/storage/signed-upload', crearUrlSubida);
router.delete('/storage', eliminarArchivoStorage);

export default router;
