import { supabase } from '../../data/config/supabaseClient.js';
import { obtenerRolUsuario } from '../../business/services/userRoleService.js';

export const requireAdmin = async (req, res, next) => {
  const authorization = req.get('authorization') ?? '';
  const tokenMatch = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!tokenMatch) {
    return res.status(401).json({ error: 'Se requiere un token de acceso válido.' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(tokenMatch[1]);

    if (error || !data.user) {
      return res.status(401).json({ error: 'El token de acceso no es válido o expiró.' });
    }

    const {
      role,
      perfil,
      error: roleError,
      errorCode: roleErrorCode,
    } = await obtenerRolUsuario(data.user.id);
    if (roleError) {
      console.error('Error al consultar el rol del usuario:', roleError);
      if (roleErrorCode === 'PROFILE_NOT_FOUND' || roleErrorCode === 'INVALID_PROFILE_ROLE') {
        return res.status(403).json({ error: 'El perfil no existe o su rol no es válido para acceder al panel.' });
      }
      return res.status(500).json({ error: 'No se pudo verificar el rol del usuario.' });
    }

    if (role !== 'administrador') {
      return res.status(403).json({ error: 'Se requiere una cuenta de administrador.' });
    }

    req.adminUser = data.user;
    req.adminProfile = perfil;
    return next();
  } catch (error) {
    console.error('Error al verificar el acceso administrativo:', error);
    return res.status(500).json({ error: 'No se pudo verificar el acceso administrativo.' });
  }
};
