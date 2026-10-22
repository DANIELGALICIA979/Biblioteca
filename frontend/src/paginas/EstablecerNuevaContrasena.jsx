import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function EstablecerNuevaContrasena({ onReturnToLogin }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get('type');
    if (recoveryType !== 'recovery') {
      // Redirigir a la página de inicio de sesión si no viene de un enlace de recuperación
      window.location.href = '/login';
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const recoveryParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = recoveryParams.get('access_token');
    const refreshToken = recoveryParams.get('refresh_token');

    if (!accessToken || !refreshToken || recoveryParams.get('type') !== 'recovery') {
      setErrorMessage('El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      try {
        response = await fetch('http://localhost:5000/api/auth/cambiar-contrasena', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken, password }),
        });
      } catch {
        throw new Error('No se pudo conectar con el backend. Verifica que el servidor esté ejecutándose en el puerto 5000.');
      }

      const responseBody = await response.text();
      let data;
      try {
        data = responseBody ? JSON.parse(responseBody) : {};
      } catch {
        throw new Error(
          `El backend respondió con un formato inesperado (HTTP ${response.status}). Reinicia el backend para cargar la ruta de cambio de contraseña.`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar la contraseña.');
      }

      onReturnToLogin();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (value) => {
    let score = 0;
    if (!value) return { score: 0, label: 'Sin ingresar' };
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Segura', 'Excelente'];
    return { score, label: labels[score] };
  };

  const strength = getPasswordStrength(password);
  const passwordRules = [
    { label: 'Al menos 8 caracteres', isValid: password.length >= 8 },
    { label: 'Al menos una mayúscula', isValid: /[A-Z]/.test(password) },
    { label: 'Al menos un número', isValid: /[0-9]/.test(password) },
    { label: 'Un carácter especial (@, #, $)', isValid: /[^A-Za-z0-9]/.test(password) },
  ];
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Minimal Focused Top Header */}
      <header className="w-full bg-surface-container-low/80 backdrop-blur-sm border-b border-outline-variant/30 sticky top-0 z-30">
        <div className="max-w-[1360px] mx-auto px-gutter md:px-margin h-20 flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <a className="flex items-center gap-2 group" href="#">
              <span className="text-headline-md font-headline-md font-semibold text-primary tracking-tight">Biblioteca</span>
            </a>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-outline-variant/40">
              <span className="material-symbols-outlined text-outline text-[16px]">lock</span>
              <span className="text-label-md font-label-md text-on-surface-variant font-medium">Portal de Acceso Protegido</span>
            </div>
          </div>
          <a className="inline-flex items-center gap-1.5 text-label-lg font-label-lg text-primary hover:text-secondary transition-colors duration-150 py-1 px-2 rounded hover:bg-surface-container-high/50" href="/login" onClick={(event) => { event.preventDefault(); onReturnToLogin(); }}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="">Volver a Iniciar Sesión</span>
          </a>
        </div>
      </header>

      {/* Main Editorial Canvas */}
      <main className="flex-grow flex items-center justify-center px-gutter-mobile md:px-gutter py-space-xl">
        <div className="w-full max-w-[560px]">
          {/* Security Reset Card */}
          <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-6 sm:p-10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] transition-all">
            {/* Header & Badge */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-primary-container shadow-sm">
                <span className="material-symbols-outlined text-[28px]" data-icon="lock_reset" style={{ fontVariationSettings: '"FILL" 1' }}>lock_reset</span>
              </div>
              <h1 className="text-headline-lg font-headline-lg text-primary mb-2">Establecer Nueva Contraseña</h1>
              <p className="text-body-md font-body-md text-on-surface-variant max-w-[44ch] mx-auto">
                Crea una contraseña segura para tu cuenta.
              </p>
              {/* Account Context Pill */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[16px]" data-icon="badge">badge</span>
                <span className="text-label-md font-label-md">lector@biblioteca.mail.es</span>
              </div>
            </div>

            {/* Password Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errorMessage && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {/* Field 1: New Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-lg font-label-lg text-primary font-medium" htmlFor="new-password">Nueva contraseña</label>
                  <span className="text-label-md font-label-md text-on-surface-variant">Mínimo 8 caracteres</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]" data-icon="key">key</span>
                  </div>
                  <input className="block w-full pl-11 pr-11 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-on-surface text-body-md font-body-md placeholder:text-outline-variant focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors" id="new-password" placeholder="Ingresa tu contraseña" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
                  <button aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-primary transition-colors" type="button" onClick={() => setShowPassword((visible) => !visible)}>
                    {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                </div>
                {/* Password Strength Bar & Indicators */}
                <div className="mt-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Nivel de Seguridad</span>
                    <span className="text-label-md font-label-md text-secondary font-semibold">{strength.label}</span>
                  </div>
                  {/* Segmented Progress Bar */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full h-full ${
                          step <= strength.score
                            ? strength.score <= 1
                              ? 'bg-red-500'
                              : strength.score === 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                            : 'bg-surface-variant'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Real-time Validation Checklist */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-label-md font-label-md">
                    {passwordRules.map((rule) => (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 ${rule.isValid ? 'text-primary' : 'text-on-surface-variant/80'}`}
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] ${rule.isValid ? 'text-[#2e7d32]' : 'text-outline'}`}
                          data-icon={rule.isValid ? 'check_circle' : 'radio_button_unchecked'}
                          style={rule.isValid ? { fontVariationSettings: '"FILL" 1' } : undefined}
                        >
                          {rule.isValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 2: Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-label-lg font-label-lg text-primary font-medium" htmlFor="confirm-password">Confirmar nueva contraseña</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]" data-icon="lock">lock</span>
                  </div>
                  <input className="block w-full pl-11 pr-11 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded text-on-surface text-body-md font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors" id="confirm-password" placeholder="Repite la contraseña" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" />
                  <button aria-label={showConfirmPassword ? 'Ocultar contraseña de confirmación' : 'Mostrar contraseña de confirmación'} aria-pressed={showConfirmPassword} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-primary transition-colors" type="button" onClick={() => setShowConfirmPassword((visible) => !visible)}>
                    {showConfirmPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                  {passwordsMatch && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#2e7d32]">
                      <span className="material-symbols-outlined text-[20px]" data-icon="check" style={{ fontVariationSettings: '"FILL" 1' }}>check</span>
                    </div>
                  )}
                </div>
                {passwordsMatch && (
                  <div className="mt-2 flex items-center gap-1 text-[#2e7d32] text-label-md font-label-md">
                    <span className="material-symbols-outlined text-[15px]" data-icon="verified" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                    <span>Las contraseñas coinciden</span>
                  </div>
                )}
                {password && confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-label-md font-label-md text-red-700" role="status">
                    Las contraseñas no coinciden.
                  </p>
                )}
              </div>

              {/* Institutional Security Advisory Box */}
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5" data-icon="info">info</span>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Tu sesión anterior se cerrará en todos los dispositivos por motivos de seguridad.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-2">
                <button className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-primary-container text-surface-container-lowest hover:bg-[#4a3324] font-label-lg text-label-lg tracking-wide transition-all duration-200 shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-60" type="submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Guardando contraseña...' : 'Guardar Contraseña e Iniciar Sesión'}</span>
                  <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
                </button>
              </div>
            </form>
          </section>

          {/* Trust Footer Note */}
          <div className="mt-6 text-center text-label-md font-label-md text-on-surface-variant flex items-center justify-center gap-4">
            <span className="text-outline-variant">•</span>
          </div>
        </div>
      </main>

      {/* Institutional Global Footer */}
      <footer className="w-full bg-surface-container border-t border-outline-variant/40">
        <div className="w-full py-space-xl px-gutter md:px-margin max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-space-lg">
          <div className="flex items-center gap-3">
            <span className="text-headline-sm font-headline-sm font-semibold text-primary">Biblioteca</span>
            <span className="text-on-surface-variant hidden md:inline">|</span>
            <span className="text-body-sm font-body-sm text-on-surface-variant">© 2024 Biblioteca Digital. Todos los derechos reservados.</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-secondary transition-colors duration-150" href="#">Catálogo</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}