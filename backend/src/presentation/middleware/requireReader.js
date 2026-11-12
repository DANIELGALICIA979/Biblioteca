import { supabase } from '../../data/config/supabaseClient.js';
import { obtenerRolUsuario } from '../../business/services/userRoleService.js';

export const requireReader = async (req, res, next) => {
  const authorization = req.get('authorization') ?? '';
  const tokenMatch = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!tokenMatch) {
    return res.status(401).json({ error: 'Inicia sesión para gestionar tus préstamos.' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(tokenMatch[1]);
    if (error || !data.user) {
      return res.status(401).json({ error: 'El token de acceso no es válido o expiró.' });
    }

    const { role, error: roleError, errorCode } = await obtenerRolUsuario(data.user.id);
    if (roleError) {
      console.error('Error al verificar el perfil para préstamos:', roleError);
      if (errorCode === 'PROFILE_NOT_FOUND' || errorCode === 'INVALID_PROFILE_ROLE') {
        return res.status(403).json({ error: 'El perfil del lector no existe o su rol no es válido.' });
      }
      if (errorCode === 'SERVICE_ROLE_KEY_MISSING') {
        return res.status(503).json({ error: 'El servidor no está configurado para consultar perfiles.' });
      }
      return res.status(500).json({ error: 'No se pudo verificar el perfil del lector.' });
    }

    if (role !== 'lector') {
      return res.status(403).json({ error: 'Esta operación está disponible para cuentas lectoras.' });
    }

    req.readerUser = data.user;
    return next();
  } catch (error) {
    console.error('Error al autenticar al lector para préstamos:', error);
    return res.status(500).json({ error: 'No se pudo verificar la identidad del lector.' });
  }
};
