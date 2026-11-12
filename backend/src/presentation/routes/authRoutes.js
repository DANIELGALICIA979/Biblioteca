import { Router } from 'express';
import {
  cambiarContrasena,
  login,
  refreshSession,
  register,
  solicitarRecuperacion,
} from '../controllers/authController.js';


const router = Router();

router.post('/login', login);
router.post('/refresh', refreshSession);
router.post('/register', register);
router.post('/recuperar', solicitarRecuperacion);
router.post('/cambiar-contrasena', cambiarContrasena);

export default router;