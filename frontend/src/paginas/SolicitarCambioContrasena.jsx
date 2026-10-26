import { useState } from 'react';

export default function SolicitarCambioContrasena({ onReturnToLogin }) {
  const [mostrarExito, setMostrarExito] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita que la página se recargue
    
    // 1. Extraemos el correo que el usuario escribió en el input
    const correoUsuario = event.target.identifier.value;

    try {
      // 2. Hacemos la petición a nuestra API (tu backend en Express)
      const respuesta = await fetch('http://localhost:5000/api/auth/recuperar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos 'email' para que coincida con lo que espera tu backend
        body: JSON.stringify({ email: correoUsuario })
      });

      // 3. Verificamos si el backend respondió con éxito
      if (respuesta.ok) {
        setMostrarExito(true); // Mostramos el recuadro verde de éxito en pantalla
      } else {
        const errorData = await respuesta.json();
        console.error("Error del servidor:", errorData.error);
        // Aquí podrías agregar un estado para mostrar un error visual si el correo falla
      }
    } catch (error) {
      console.error("Error de conexión con el backend:", error);
    }
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Minimal Header for Focused Journey */}
      <header className="w-full bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/30 dark:border-outline/20 sticky top-0 z-40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
        <div className="max-w-[1360px] mx-auto px-gutter md:px-margin h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a className="flex items-center gap-space-sm group focus:outline-none" href="#">
            <span className="w-9 h-9 rounded-lg bg-primary-container text-surface-bright flex items-center justify-center shadow-sm group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]" data-icon="local_library">local_library</span>
            </span>
            <span className="text-headline-md font-headline-md font-semibold text-primary dark:text-inverse-primary tracking-tight">Biblioteca</span>
          </a>
          {/* Institutional Portal Badge & Help Link */}
          <div className="flex items-center gap-space-lg">
            <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md bg-surface-container px-space-md py-1.5 rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-[16px] text-secondary" data-icon="lock">lock</span>
              <span className="">Portal de Acceso Protegido</span>
            </div>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-1" href="#soporte">
            </a>
          </div>
        </div>
      </header>

      {/* Main Recovery Content Area */}
      <main className="flex-grow flex items-center justify-center px-gutter-mobile md:px-margin py-space-xl relative overflow-hidden">
        {/* Subtle Background Archival Watermark Motifs */}
        <div className="absolute -top-36 -right-36 w-96 h-96 rounded-full bg-surface-container-high/40 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-surface-container/60 blur-2xl pointer-events-none -z-10"></div>
        <div className="w-full max-w-[540px] my-auto">
          {/* Breadcrumb / Return Path */}
          <div className="mb-space-md flex items-center justify-start">
            <a
              className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors group"
              href="#login"
              onClick={(event) => {
                event.preventDefault();
                onReturnToLogin();
              }}
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform" data-icon="arrow_back">arrow_back</span>
              <span className="">Volver a Iniciar Sesión</span>
            </a>
          </div>

          {/* Editorial Recovery Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] overflow-hidden">
            <div className="p-space-lg md:p-space-xl">
              {/* Editorial Emblem & Badge */}
              <div className="flex flex-col items-center text-center mb-space-lg">
                <div className="w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant/40 flex items-center justify-center text-primary-container mb-space-md shadow-inner">
                  <span className="material-symbols-outlined text-[32px] text-secondary" data-icon="key">key</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs">
                  Restablecimiento de Contraseña
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-[46ch] mt-1">
                  Ingresa el correo electrónico asociado a tu cuenta de lector para recibir las instrucciones de restablecimiento.
                </p>
              </div>

              {/* Recovery Form */}
              <form className="space-y-space-lg" id="recovery-form" onSubmit={handleSubmit}>
                {/* Input Field: Identifier / Email */}
                <div className="space-y-space-xs text-left">
                  <div className="flex justify-between items-baseline">
                    <label className="font-label-md text-label-md text-on-surface flex items-center gap-1.5 font-semibold" htmlFor="identifier">
                      <span className="">Correo electrónico&nbsp;</span>
                      <span className="text-secondary">*</span>
                    </label>
                  </div>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[20px]" data-icon="alternate_email">alternate_email</span>
                    </div>
                    <input className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant/70 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" id="identifier" name="identifier" placeholder="lector@biblioteca.mail.es" required type="email" />
                  </div>
                </div>

                {/* Context Notification */}
                <div className="bg-surface-container-low rounded-lg p-space-md border border-outline-variant/30 flex items-start gap-space-sm text-left">
                  <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5 shrink-0" data-icon="info">info</span>
                  <div className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                    El enlace generado mantendrá una validez estricta de <strong className="text-on-surface font-semibold">24 horas</strong> y será remitido únicamente a la dirección registrada en el padrón de fondos y préstamos.
                  </div>
                </div>

                {/* Success State Banner */}
                {mostrarExito && (
                  <div className="bg-surface-container rounded-lg p-space-md border border-secondary/40 text-left transition-all" id="success-banner">
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-[22px] text-secondary shrink-0" data-icon="mark_email_read">mark_email_read</span>
                      <div>
                        <h4 className="font-label-lg text-label-lg text-primary font-semibold">Instrucciones enviadas con éxito</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          Hemos remitido un enlace único a tu bandeja de entrada. Por favor, revisa también la carpeta de correo no deseado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <button className="w-full bg-primary-container hover:bg-primary text-surface-bright font-label-lg text-label-lg py-3.5 px-space-lg rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-space-xs focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background" type="submit">
                  <span className="">Enviar Enlace de Recuperación</span>
                  <span className="material-symbols-outlined text-[18px]" data-icon="send">send</span>
                </button>
              </form>
            </div>
            
            {/* Footnote of Card */}
            <div className="bg-surface-container py-3 px-space-lg flex items-center justify-center gap-space-lg border-t border-outline-variant/20 text-on-surface-variant font-label-sm text-label-sm">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]" data-icon="shield">shield</span>
              </div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]" data-icon="history_edu">history_edu</span>
              </div>
            </div>
          </div>

          {/* Quick Guidance Callout */}
          <div className="mt-space-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              ¿Recordaste tu clave?
              <a
                className="text-primary hover:text-secondary font-semibold font-label-md text-label-md underline underline-offset-4 ml-1 transition-colors"
                href="#login"
                onClick={(event) => {
                  event.preventDefault();
                  onReturnToLogin();
                }}
              >
                Regresar a iniciar sesión&nbsp;
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container dark:bg-inverse-surface border-t border-outline-variant/40 dark:border-outline/30 mt-auto">
        <div className="w-full py-space-xl px-gutter md:px-margin max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-space-lg">
          <div className="flex flex-col sm:flex-row items-center gap-space-sm text-center md:text-left">
            <span className="text-headline-sm font-headline-sm font-semibold text-primary dark:text-inverse-primary">Biblioteca</span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant">
              © 2024 Biblioteca Digital. Todos los derechos reservados.
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-space-lg gap-y-2 text-label-md font-label-md text-on-surface-variant dark:text-surface-variant">
            <a className="hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#catalogo">Catálogo&nbsp;</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}