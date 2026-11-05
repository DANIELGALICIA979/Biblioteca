import { supabaseAdmin } from '../../data/config/supabaseClient.js';

const getFirstText = (profile, fields) => {
  for (const field of fields) {
    const value = profile[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const getProfileName = (profile) => {
  const directName = getFirstText(profile, [
    'nombre',
    'nombre_completo',
    'nombres',
    'full_name',
    'name',
    'display_name',
  ]);
  if (directName) return directName;

  const firstName = getFirstText(profile, ['nombre', 'nombres', 'first_name']);
  const lastName = getFirstText(profile, ['apellido', 'apellidos', 'last_name']);
  return [firstName, lastName].filter(Boolean).join(' ');
};

export const obtenerRolUsuario = async (userId) => {
  if (!supabaseAdmin) {
    return {
      error: new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada.'),
      errorCode: 'SERVICE_ROLE_KEY_MISSING',
    };
  }

  const { data, error } = await supabaseAdmin
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) return { error, errorCode: 'PROFILE_QUERY_FAILED' };
  if (!data) {
    return {
      error: new Error(`No se encontró un perfil para el usuario autenticado (${userId}).`),
      errorCode: 'PROFILE_NOT_FOUND',
    };
  }

  const rol = String(data.rol ?? '').trim().toLocaleLowerCase('es');
  const perfil = {
    nombre: getProfileName(data),
    email: getFirstText(data, ['email', 'correo', 'correo_electronico']),
  };

  if (rol === 'administrador' || rol === 'admin') {
    return { role: 'administrador', perfil };
  }
  if (rol === 'lector' || rol === 'lector_general') {
    return { role: 'lector', perfil };
  }

  return {
    error: new Error(`El rol del perfil no es válido: "${rol || 'vacío'}".`),
    errorCode: 'INVALID_PROFILE_ROLE',
  };
};
