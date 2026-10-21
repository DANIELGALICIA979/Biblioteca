import React, { useState } from 'react';
import { Mail, Lock, ExternalLink, ArrowRight, BookOpen, Clock, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Iniciando sesión con:', formData);
    // Aquí invocas el servicio de autenticación hacia tu API Backend (Node.js/Express)
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between font-sans text-stone-800">
      {/* Encabezado Superior */}
      <header className="px-8 py-6 flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#5A3811] text-amber-100 rounded-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-stone-900">Bibliotheca</h1>
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

      {/* Contenedor Principal en Tarjeta Solapada */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200/80 max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[600px]">
          
          {/* Columna Izquierda: Formulario de Autenticación */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
            
            {/* Tag / Etiqueta de Acceso */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-semibold w-fit mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-700"></span>
              Acceso Unificado
            </div>

            <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">Iniciar Sesión</h2>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              Ingresa con tu carné de lector, cuenta institucional o credencial de investigación histórica.
            </p>

            {/* Banner Informativo de Reconocimiento */}
            <div className="bg-[#FAF5EE] border border-amber-200/60 rounded-lg p-3.5 mb-6 flex gap-3 items-start">
              <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-700">
                <span className="font-bold text-stone-900 block mb-0.5">Reconocimiento Automático</span>
                El sistema detectará automáticamente si tu perfil corresponde a Lector General, Investigador o Administración.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Identificador o Correo */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Identificador o Correo Institucional
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Ej. L-88402, analista@bibliotheca.org"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all placeholder:text-stone-400"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Acepta número de carné, código de fondo o correo electrónico.</p>
              </div>

              {/* Campo: Contraseña */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <a href="/recuperar" className="text-xs text-amber-800 hover:underline font-semibold">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Recordar Sesión & TLS Indicator */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-stone-300 text-amber-800 focus:ring-amber-800"
                  />
                  Recordar sesión en este equipo
                </label>
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Conexión cifrada TLS
                </span>
              </div>

              {/* Botón de Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-[#8C4A00] hover:bg-[#733D00] text-amber-50 font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                Iniciar Sesión
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Enlace a Registro */}
            <div className="mt-8 text-center text-xs text-stone-600">
              ¿Aún no tienes carné o cuenta digital?{' '}
              <a href="/registro" className="text-amber-800 font-bold hover:underline inline-flex items-center gap-0.5">
                Solicita tu registro aquí <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 text-[10px] text-stone-400 text-center">
              Bibliotheca Nacional Digital • Sistema de Autenticación de Fondos Patrimoniales
            </div>
          </div>

          {/* Columna Derecha: Panel Visual e Inspiracional */}
          <div className="md:col-span-5 bg-[#2A1D13] text-stone-200 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Capa de fondo simulación de imagen oscura */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            <div className="relative z-10 flex justify-between items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800/80 border border-stone-700/60 rounded-full text-[10px] font-mono tracking-wider text-amber-200 uppercase">
                <Clock className="w-3 h-3" /> Fondo Documental 1540 – 2026
              </span>
              <span className="text-xs font-serif italic text-stone-400">Sala de Investigadores</span>
            </div>

            <div className="relative z-10 my-12 space-y-6">
              <div className="w-12 h-0.5 bg-amber-600"></div>
              <blockquote className="font-serif text-2xl italic leading-relaxed text-amber-100">
                «Ordenar una biblioteca es ejercer de un modo silencioso el arte de la crítica y la memoria colectiva.»
              </blockquote>
              <div className="flex items-center gap-3 pt-2">
                <div className="p-2 bg-stone-800/80 rounded-full border border-stone-700/50">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200">Colección Archivo Central</p>
                  <p className="text-[11px] text-stone-400">Tratados de Biblioteconomía y Humanidades</p>
                </div>
              </div>
            </div>

            {/* Tarjetas Estadísticas Inferiores */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
              <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Catálogo Activo</p>
                <p className="text-lg font-bold font-serif text-amber-200 mt-0.5">340,000+</p>
                <p className="text-[10px] text-stone-400">Volúmenes digitalizados</p>
              </div>
              <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Disponibilidad</p>
                <p className="text-lg font-bold font-serif text-amber-200 mt-0.5">24 / 7</p>
                <p className="text-[10px] text-stone-400">Acceso remoto seguro</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Pie de Página */}
      <footer className="px-8 py-4 border-t border-stone-200/60 max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-2">
        <p className="font-semibold text-stone-700">Bibliotheca</p>
        <p>© 2026 Bibliotheca Nacional Digital. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-stone-800">Horarios de Atención</a>
          <a href="#" className="hover:text-stone-800">Catálogo Histórico</a>
          <a href="#" className="hover:text-stone-800">Préstamo Interbibliotecario</a>
          <a href="#" className="hover:text-stone-800">Términos y Privacidad</a>
        </div>
      </footer>
    </div>
  );
}