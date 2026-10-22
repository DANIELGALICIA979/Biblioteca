import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Función para calcular la fortaleza de la contraseña (0 a 4)
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: 'Sin ingresar' };
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Segura', 'Excelente'];
    return { score, label: labels[score] };
  };

  const strength = getPasswordStrength(formData.password);

  // Manejo del Envío del Formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validaciones previas en la Capa de Presentación
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMessage('Debes aceptar los términos y políticas para continuar.');
      return;
    }

    setLoading(true);

    try {
      // Petición HTTP a la API REST (Backend Express / Node.js)
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrar la cuenta.');
      }

      setSuccessMessage('¡Cuenta y Carné Digital creados con éxito! Redirigiendo...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page bg-[#FAF7F2] font-sans text-stone-800">
      
      {/* Encabezado Principal */}
      <header className="register-header shrink-0 px-8 py-3 flex flex-wrap justify-between items-center gap-3 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#5A3811] text-amber-100 rounded-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-stone-900">Biblioteca</h1>
            <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">
              Portal de Lectura y Fondo Antiguo
            </p>
          </div>
        </div>
        <a
          href="/catalogo"
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
        >
          &larr; Regresar al catálogo
        </a>
      </header>

      {/* Formulario de inscripción centrado */}
      <main className="register-main">
        
        {/* Vista previa conservada para habilitarla de nuevo cuando se necesite. */}
        {false && (
        <div className="md:col-span-5 flex flex-col items-center justify-start pt-2">
          <div className="w-full bg-[#1F1914] text-stone-100 rounded-2xl p-6 shadow-2xl border border-stone-800 relative overflow-hidden transition-all transform hover:scale-[1.01]">
            
            {/* Encabezado del Carné */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-amber-500/80">
                  Biblioteca Digital
                </p>
                <h3 className="font-serif text-lg font-bold text-amber-100">Acceso General</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-600/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Datos del Titular (Dinámicos según el input) */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-800/80 rounded-lg border border-stone-700/60 text-amber-200">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-semibold">Titular Solicitante</p>
                  <p className="font-serif text-base font-bold text-white truncate max-w-[220px]">
                    {formData.fullName.trim() !== '' ? formData.fullName : 'Lector Registrado'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-800 text-xs">
                <div>
                  <p className="text-[10px] text-stone-400 font-semibold">Vigencia</p>
                  <p className="font-mono text-stone-200">2026 – 2028 Renovación</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-semibold">Tipo de Usuario</p>
                  <p className="font-serif text-amber-200/90 font-medium">Lector General</p>
                </div>
              </div>
            </div>

            {/* Marca de agua decorativa */}
            <div className="absolute -bottom-6 -right-6 text-stone-800/30 pointer-events-none">
              <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-3 text-center">
            * IMAGEN PREVIA.
          </p>
        </div>
        )}

        {/* Formulario de Inscripción */}
        <div className="register-card w-full bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-stone-200">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">Formulario de Inscripción</h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Complete sus antecedentes para emitir su carné digital oficial. Todos los datos son resguardados bajo normas estrictas de confidencialidad académica.
          </p>

          {/* Mensajes de Alerta */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Sección 1: Identificación Personal */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
                <User className="w-4 h-4 text-amber-800" />
                <span>1. Identificación Personal</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Nombre y Apellidos *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ej. Gabriela Mistral Navarro"
                    required
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="lector@universidad.edu"
                    required
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Seguridad de Acceso */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
                <Lock className="w-4 h-4 text-amber-800" />
                <span>3. Seguridad de Acceso</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Contraseña Segura *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="w-full pl-3 pr-9 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repita la contraseña"
                      required
                      className="w-full pl-3 pr-9 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Indicador visual de fortaleza de contraseña */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs space-y-2">
                <div className="flex justify-between items-center text-stone-500 font-medium">
                  <span>Fortaleza de contraseña</span>
                  <span className="font-semibold text-stone-700">{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`rounded-full transition-all ${
                        step <= strength.score
                          ? strength.score <= 1
                            ? 'bg-red-500'
                            : strength.score === 2
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                          : 'bg-stone-200'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500">
                  Recomendación: Incluya al menos una mayúscula, números y un signo especial para resguardar su cuenta de lector.
                </p>
              </div>
            </div>

            {/* Checkbox Términos y Condiciones */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 leading-normal">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-stone-300 text-amber-800 focus:ring-amber-800 shrink-0"
                />
                <span>
                  Acepto los <a href="#" className="font-bold text-stone-800 underline">Términos del Servicio de Préstamo</a>, el protocolo de uso responsable del acervo y la <a href="#" className="font-bold text-stone-800 underline">Política de Preservación y Privacidad</a> de Bibliotheca.
                </span>
              </label>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#2A1D13] hover:bg-[#1F150E] text-stone-100 font-semibold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? 'Creando Carné y Cuenta...' : 'Crear Cuenta de Lector'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Redirección a Login */}
          <div className="mt-6 text-center text-xs text-stone-500">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="text-amber-800 font-bold hover:underline">
              Inicia sesión
            </a>
          </div>
        </div>

      </main>
      <footer className="register-footer shrink-0 px-4 md:px-8 py-2 border-t border-stone-200/60 w-full flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-2">
        <p className="font-semibold text-stone-700">Bibliotheca</p>
        <p>© 2026 Bibliotheca Nacional Digital. Todos los derechos reservados.</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href="#" className="hover:text-stone-800">Horarios de Atención</a>
          <a href="#" className="hover:text-stone-800">Catálogo Histórico</a>
          <a href="#" className="hover:text-stone-800">Préstamo Interbibliotecario</a>
          <a href="#" className="hover:text-stone-800">Términos y Privacidad</a>
        </div>
      </footer>
    </div>
  );
}