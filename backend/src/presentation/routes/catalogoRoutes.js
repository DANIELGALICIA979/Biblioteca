import { Router } from 'express';
import { obtenerCatalogo, obtenerLibroCatalogo } from '../controllers/catalogoControler.js';

const router = Router();

router.get('/', obtenerCatalogo);
router.get('/:id', obtenerLibroCatalogo);

export default router;
