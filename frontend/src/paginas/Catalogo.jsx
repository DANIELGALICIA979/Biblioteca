import { useState, useEffect } from 'react';
import PortadaLibro from '../componentes/PortadaLibro';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const generosDisponibles = [
  'Desarrollo personal',
  'Ciencia ficción',
  'Distopía',
  'Fantasía',
  'Misterio',
  'Psicología',
  'Realismo mágico',
  'Romance',
  'Romance clásico',
  'Suspenso',
  'Terror',
];

export default function Catalogo({ onNavigateToLogin, onNavigateToDetail }) {
  // 1. Estado Centralizado de Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    soloDigitales: false,
    generos: [], 
    formatos: ['Libro Digital (EPUB / PDF)'], // Valor por defecto marcado
    estado: 'Todos',
    ordenarPor: ''
  });

  // Estado para almacenar la respuesta del backend
  const [libros, setLibros] = useState([]);
  const [errorCatalogo, setErrorCatalogo] = useState('');
  const [textoBusqueda, setTextoBusqueda] = useState('');

  // 2. Función genérica para manejar arrays de checkboxes (Géneros y Formatos)
  const handleFiltroArray = (categoria, valor, estaMarcado) => {
    setFiltros((prev) => {
      const arrayActual = prev[categoria];
      if (estaMarcado) {
        return { ...prev, [categoria]: [...arrayActual, valor] };
      } else {
        return { ...prev, [categoria]: arrayActual.filter((item) => item !== valor) };
      }
    });
  };

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setFiltros((actual) => ({ ...actual, busqueda: textoBusqueda }));
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, [textoBusqueda]);

  // 3. Petición al Backend
  useEffect(() => {
    const obtenerLibros = async () => {
      try {
        // Convertimos el estado en parámetros de URL (ej. ?estado=Todos&generos=Romance,Fantasía)
        const queryParams = new URLSearchParams({
          busqueda: filtros.busqueda,
          soloDigitales: filtros.soloDigitales,
          estado: filtros.estado,
          ordenarPor: filtros.ordenarPor,
          generos: filtros.generos.join(','),
          formatos: filtros.formatos.join(',')
        });

        // Asegúrate de que el puerto coincida con tu backend de Node.js (5000)
        const response = await fetch(`${API_BASE_URL}/catalogo?${queryParams}`);
        
        if (response.ok) {
          const data = await response.json();
          setLibros(Array.isArray(data) ? data : []);
          setErrorCatalogo('');
        } else {
          const payload = await response.json().catch(() => null);
          setLibros([]);
          setErrorCatalogo(payload?.error || 'No se pudo consultar el catálogo.');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        setLibros([]);
        setErrorCatalogo('No se pudo conectar con el servidor del catálogo.');
      }
    };

    obtenerLibros();
  }, [filtros]); // El array [filtros] hace que la función se ejecute cada vez que el usuario cambia una opción

  return (
    <div className="bg-background text-on-surface antialiased min-h-full flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* HEADER */}
      <header className="bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/30 dark:border-outline/20 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] w-full sticky top-0 z-40">
        <div className="px-gutter md:px-margin max-w-[1360px] mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-space-lg flex-1 max-w-2xl">
            <a className="text-headline-md font-headline-md font-semibold text-primary dark:text-inverse-primary tracking-tight flex items-center gap-2 flex-shrink-0" href="#">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_library</span>
              Biblioteca
            </a>
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input 
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" 
                placeholder="Buscar por título o autor." 
                type="search" 
              />
            </div>
          </div>
          <nav className="flex items-center gap-space-lg">
            <div className="hidden md:flex items-center gap-6">
              <a className="border-b-2 border-secondary text-primary dark:text-inverse-primary pb-1 font-semibold text-label-lg font-label-lg" href="#">Catálogo</a>
              <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors pb-1 text-label-lg font-label-lg" href="#">Mis Préstamos</a>
            </div>
            <div className="flex items-center pl-3 border-l border-outline-variant/40">
              <button type="button" onClick={onNavigateToLogin} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-outline-variant/60 text-primary dark:text-inverse-primary hover:bg-surface-container-high transition-colors font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Iniciar Sesión</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1360px] mx-auto px-gutter md:px-margin py-8">
        <div className="mb-8 border-b border-outline-variant/30 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-label-md font-label-md uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px]">menu_book</span> Fondo General & Repositorio Digital
              </span>
              <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">Catálogo General</h1>
              <p className="text-body-md font-body-md text-on-surface-variant mt-1 max-w-[68ch]">
                Explore volúmenes de colecciones históricas y ediciones contemporáneas disponibles para lectura en línea.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container px-4 py-2.5 rounded border border-outline-variant/40 text-label-md font-label-md text-on-surface">
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                <span>{libros.length} obras encontradas</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-3 bg-surface-container-low p-5 rounded border border-outline-variant/40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] space-y-6">
            <details className="group/panel space-y-6" open>
              <summary className="flex items-center justify-between border-b border-outline-variant/30 pb-3 cursor-pointer list-none select-none">
                <div className="flex items-center gap-1.5 text-primary font-headline-sm text-headline-sm">
                  <span className="material-symbols-outlined text-[20px] text-secondary">filter_list</span>
                  <h3>Filtros</h3>
                  <span className="material-symbols-outlined text-outline text-[20px] transition-transform duration-200 group-open/panel:rotate-180 ml-1">expand_more</span>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTextoBusqueda('');
                    setFiltros({ busqueda: '', soloDigitales: false, generos: [], formatos: [], estado: 'Todos', ordenarPor: '' });
                  }} 
                  className="text-label-sm font-label-sm text-secondary hover:text-on-secondary-fixed-variant transition-colors underline"
                >
                  Limpiar todo
                </button>
              </summary>

              <div className="space-y-6 pt-1">
                {/* Switch Digitales */}
                <div className="p-3.5 bg-surface-container-lowest rounded border-2 border-secondary/40 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer" htmlFor="switch-digital">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>devices</span>
                      <div>
                        <span className="font-label-lg text-label-lg text-primary block leading-tight">Solo Digitales</span>
                        <span className="text-label-sm font-label-sm text-on-surface-variant block mt-0.5">Acceso inmediato en pantalla</span>
                      </div>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        checked={filtros.soloDigitales} 
                        onChange={(e) => setFiltros({ ...filtros, soloDigitales: e.target.checked })}
                        className="sr-only peer" id="switch-digital" type="checkbox" 
                      />
                      <div className="w-11 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>

                {/* Filtro: Género */}
                <details open className="space-y-3 group/genre">
                  <summary className="font-label-md text-label-md text-primary uppercase tracking-wider flex items-center justify-between cursor-pointer list-none select-none">
                    <span>Género</span>
                    <span className="material-symbols-outlined text-outline text-[16px] transition-transform duration-200 group-open/genre:rotate-180">expand_less</span>
                  </summary>
                  <div className="space-y-2 text-body-sm font-body-sm text-on-surface pt-1">
                    {generosDisponibles.map((genero) => (
                      <label key={genero} className="flex items-center justify-between cursor-pointer group">
                        <span className="flex items-center gap-2">
                          <input 
                            checked={filtros.generos.includes(genero)} 
                            onChange={(e) => handleFiltroArray('generos', genero, e.target.checked)}
                            className="rounded border-outline text-secondary focus:ring-secondary w-4 h-4" type="checkbox" 
                          />
                          <span>{genero}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Filtro: Formato */}
                <details open className="space-y-3 pt-3 border-t border-outline-variant/30 group/fmt">
                  <summary className="font-label-md text-label-md text-primary uppercase tracking-wider flex items-center justify-between cursor-pointer list-none select-none">
                    <span>Formato</span>
                    <span className="material-symbols-outlined text-outline text-[16px] transition-transform duration-200 group-open/fmt:rotate-180">expand_less</span>
                  </summary>
                  <div className="space-y-2 text-body-sm font-body-sm text-on-surface pt-1">
                    {['Libro Digital (EPUB / PDF)', 'Físico en sala de lectura'].map((formato) => (
                      <label key={formato} className="flex items-center justify-between cursor-pointer group">
                        <span className="flex items-center gap-2">
                          <input 
                            checked={filtros.formatos.includes(formato)}
                            onChange={(e) => handleFiltroArray('formatos', formato, e.target.checked)}
                            className="rounded border-outline text-secondary focus:ring-secondary w-4 h-4" type="checkbox" 
                          />
                          <span>{formato}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Filtro: Estado */}
                <details open className="space-y-3 pt-3 border-t border-outline-variant/30 group/status">
                  <summary className="font-label-md text-label-md text-primary uppercase tracking-wider flex items-center justify-between cursor-pointer list-none select-none">
                    <span>Estado</span>
                    <span className="material-symbols-outlined text-outline text-[16px] transition-transform duration-200 group-open/status:rotate-180">expand_less</span>
                  </summary>
                  <div className="space-y-2 text-body-sm font-body-sm text-on-surface pt-1">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input 
                          checked={filtros.estado === 'Todos'}
                          onChange={() => setFiltros({ ...filtros, estado: 'Todos' })}
                          className="text-secondary focus:ring-secondary w-4 h-4" name="availability_status" type="radio" 
                        />
                        <span>Todos</span>
                      </span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input 
                          checked={filtros.estado === 'Disponible ahora'}
                          onChange={() => setFiltros({ ...filtros, estado: 'Disponible ahora' })}
                          className="text-secondary focus:ring-secondary w-4 h-4" name="availability_status" type="radio" 
                        />
                        <span>Disponible ahora</span>
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    </label>
                  </div>
                </details>
              </div>
            </details>
          </aside>

          <section className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low px-4 py-3 rounded border border-outline-variant/30 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-body-sm text-on-surface font-medium">Visualizando resultados</span>
              </div>
              <div className="flex items-center gap-2.5">
                <label className="text-label-md font-label-md text-on-surface-variant flex-shrink-0" htmlFor="sort-select">Ordenar por:</label>
                <div className="relative inline-block">
                  <select 
                    value={filtros.ordenarPor}
                    onChange={(e) => setFiltros({ ...filtros, ordenarPor: e.target.value })}
                    className="appearance-none bg-surface-container-lowest border border-outline-variant/70 text-on-surface text-body-sm font-body-sm rounded pl-3 pr-8 py-1.5 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" id="sort-select"
                  >
                    <option value="">[Criterio de ordenación]</option>
                    <option value="populares">Más populares</option>
                    <option value="alfabetico">Alfabético (A - Z)</option>
                    <option value="recientes">Recientes (Incorporación)</option>
                    <option value="antiguos">Año de publicación (Más antiguo a más nuevo)</option>
                    <option value="nuevos">Año de publicación (Más nuevo a más antiguo)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Renderizado dinámico de la lista de libros devuelta por el servidor */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {libros.map((libro) => (
                <article key={libro.id} className="bg-surface-container-lowest rounded border border-outline-variant/50 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(46,31,20,0.12)] transition-all duration-200 flex flex-col justify-between overflow-hidden group">
                  <div className="p-4 pb-2">
                    <div className="relative aspect-[2/3] w-full rounded overflow-hidden bg-surface-container-high border border-outline-variant/60 mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <PortadaLibro src={libro.portada_url} title={libro.titulo} />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-headline-sm font-headline-sm text-primary leading-snug group-hover:text-secondary transition-colors">{libro.titulo}</h2>
                      <p className="text-body-sm font-body-sm text-on-surface-variant font-medium">{libro.autor}</p>
                      {libro.genero && (
                        <p className="text-label-sm font-label-sm text-secondary">{libro.genero}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 pt-2 bg-surface-container-low/40 border-t border-outline-variant/20 mt-2">
                    <button type="button" onClick={() => onNavigateToDetail(libro)} className="w-full bg-primary hover:bg-primary-container text-surface py-2 px-3 rounded font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                      <span>Ver Ficha / Solicitar</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
            
            {errorCatalogo && (
              <div role="alert" className="rounded border border-error/30 bg-error-container/40 px-4 py-3 text-body-sm text-error">
                {errorCatalogo}
              </div>
            )}
            {!errorCatalogo && libros.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                No se encontraron libros que coincidan con los filtros.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}