import { createSupabaseClient, supabase } from '../../data/config/supabaseClient.js';

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // 1. Registro de usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: 'lector_general', // Asignación por defecto
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Usuario registrado correctamente con carné digital emitido.',
      user: data.user,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar el registro.' });
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Autenticación usando el cliente de Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: password,
    });

    if (error) {
      return res.status(400).json({ error: 'Credenciales inválidas. Comprueba tu correo y contraseña.' });
    }

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      // Esta es la ruta de tu frontend a la que el usuario será redirigido
      // Asegúrate de cambiar el puerto si tu Vite usa uno distinto al 5173
      redirectTo: 'http://localhost:5173/restablecer-contrasena', 
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Instrucciones enviadas con éxito' });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud' });
  }
};

export const cambiarContrasena = async (req, res) => {
  const { accessToken, refreshToken, password } = req.body;

  if (
    typeof accessToken !== 'string' ||
    typeof refreshToken !== 'string' ||
    typeof password !== 'string' ||
    password.length < 8
  ) {
    return res.status(400).json({ error: 'Enlace de recuperación o contraseña inválidos.' });
  }

  try {
    const recoveryClient = createSupabaseClient({
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const { error: sessionError } = await recoveryClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return res.status(401).json({ error: 'El enlace de recuperación no es válido o ha expirado.' });
    }

    const { error } = await recoveryClient.auth.updateUser({ password });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor al cambiar la contraseña.' });
  }
};