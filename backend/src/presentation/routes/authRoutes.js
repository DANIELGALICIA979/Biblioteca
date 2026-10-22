import { Router } from 'express';
import { login, register, solicitarRecuperacion, cambiarContrasena } from '../controllers/authController.js';


const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/recuperar', solicitarRecuperacion);
router.post('/cambiar-contrasena', cambiarContrasena);

export default router;