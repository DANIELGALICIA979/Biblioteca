import { Router } from 'express';
import { obtenerCatalogo } from '../controllers/catalogoControler.js';

const router = Router();

router.get('/', obtenerCatalogo);

export default router;
