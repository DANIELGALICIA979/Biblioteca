import { supabase } from '../../data/config/supabaseClient.js';

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