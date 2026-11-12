import { Router } from 'express';
import {
  obtenerCatalogo,
  obtenerDisponibilidadPrestamo,
  obtenerLibroCatalogo,
} from '../controllers/catalogoControler.js';

const router = Router();

router.get('/', obtenerCatalogo);
router.get('/:id/disponibilidad', obtenerDisponibilidadPrestamo);
router.get('/:id', obtenerLibroCatalogo);

export default router;
