import { useEffect, useState } from 'react';
import PortadaLibro from '../componentes/PortadaLibro';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const metadataFields = [
  ['ISBN', 'isbn'],
  ['Editorial', 'editorial'],
  ['Año de publicación', 'anio_publicacion'],
  ['Idioma', 'idioma'],
  ['Número de páginas', 'numero_paginas'],
  ['Formatos disponibles', 'formatos_disponibles'],
];

const tabs = [
  { id: 'contents', label: 'Índice de contenidos', icon: 'format_list_bulleted' },
  { id: 'edition', label: 'Detalles de la edición', icon: 'tune' },
  { id: 'reviews', label: 'Reseñas de la comunidad', icon: 'forum' },
];

const hasValue = (value) => value !== null
  && value !== undefined
  && value !== ''
  && (!Array.isArray(value) || value.length > 0);

export default function DetalleLibro({ bookId, initialBook, onNavigateToCatalog }) {
  const [book, setBook] = useState(initialBook ?? null);
  const [loadedBookId, setLoadedBookId] = useState(null);
  const isLoading = Boolean(bookId) && String(loadedBookId) !== String(bookId);
  const [loadError, setLoadError] = useState('');
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [loanError, setLoanError] = useState('');
  const [loanSuccess, setLoanSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('contents');
  const [showFullContents, setShowFullContents] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loanType, setLoanType] = useState('digital');

  useEffect(() => {
    if (bookId === undefined || bookId === null || bookId === '') {
      return undefined;
    }

    if (initialBook && String(initialBook.id) === String(bookId)) {
      setBook(initialBook);
      setLoadError('');
      setLoadedBookId(bookId);
      return undefined;
    }

    const abortController = new AbortController();
    const obtenerLibro = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/catalogo/${encodeURIComponent(bookId)}`, {
          signal: abortController.signal,
        });
        const payload = await response.json().catch(() => null);
        setLoadError('');

        if (!response.ok) {
          throw new Error(payload?.error || `No se pudo cargar el libro (HTTP ${response.status}).`);
        }

        const libro = payload?.libro ?? payload;
        if (!libro || typeof libro !== 'object' || Array.isArray(libro)) {
          throw new Error('El backend devolvió un detalle de libro con formato inválido.');
        }

        setBook(libro);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error al cargar el detalle del libro:', error);
          setLoadError(error.message || 'No se pudo cargar el detalle del libro.');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadedBookId(bookId);
        }
      }
    };

    obtenerLibro();
    return () => abortController.abort();
  }, [bookId, initialBook]);

  const solicitarPrestamo = async () => {
    if (!book?.id) {
      setLoanError('No se puede solicitar el préstamo porque el libro no tiene un identificador válido.');
      return;
    }

    setIsSubmittingLoan(true);
    setLoanError('');
    setLoanSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/prestamos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libroId: book.id,
          modalidad: loanType,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || `No se pudo registrar la solicitud (HTTP ${response.status}).`);
      }

      setLoanSuccess(payload?.message || 'La solicitud de préstamo se registró correctamente.');
    } catch (error) {
      console.error('Error al solicitar el préstamo:', error);
      setLoanError(error.message || 'No se pudo enviar la solicitud de préstamo.');
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const metadata = metadataFields
    .map(([label, field]) => [label, book?.[field] ?? (field === 'formatos_disponibles' ? book?.formatos : undefined)])
    .filter(([, value]) => hasValue(value));
  const sinopsis = book?.sinopsis || book?.resumen || book?.descripcion || book?.descripcion_libro;
  const formatsValue = book?.formatos_disponibles ?? book?.formatos;
  const bookContents = Array.isArray(book?.indice_contenidos) ? book.indice_contenidos : [];
  const relatedBooks = Array.isArray(book?.obras_relacionadas) ? book.obras_relacionadas : [];
  const reviews = Array.isArray(book?.resenas) ? book.resenas : [];
  const rating = Number(book?.calificacion);
  const hasRating = book?.calificacion !== null
    && book?.calificacion !== undefined
    && Number.isFinite(rating);
  const ratingStars = hasRating ? Math.max(0, Math.min(5, Math.round(rating))) : 0;
  const reviewCount = book?.numero_resenas ?? book?.resenas_count;
  const displayedContents = showFullContents ? bookContents : bookContents.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md text-body-md antialiased">
      <header className="sticky top-0 z-40 w-full border-b border-outline-variant/30 bg-surface-container-low shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-gutter md:px-margin">
          <a
            className="flex items-center gap-2 text-headline-sm font-headline-sm font-semibold tracking-tight text-primary"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onNavigateToCatalog?.();
            }}
          >
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_library</span>
            Biblioteca
          </a>
          <nav aria-label="Navegación principal" className="flex items-center gap-2 sm:gap-6">
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="border-b-2 border-secondary px-2 py-2 text-label-md font-label-md font-semibold text-primary"
            >
              Catálogo
            </button>
            <button
              type="button"
              className="px-2 py-2 text-label-md font-label-md text-on-surface-variant transition-colors hover:text-primary"
            >
              Mis Préstamos
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1360px] flex-1 space-y-12 px-gutter py-8 md:px-margin md:py-10">
        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
            <div className="relative mx-auto flex aspect-[2/3] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-high p-6 text-center shadow-[0_12px_32px_-6px_rgba(46,31,20,0.18)] sm:mx-0">
              <PortadaLibro src={book?.portada_url} title={book?.titulo} />
              {book?.genero && (
                <span className="absolute left-0 top-3 z-20 rounded-r bg-surface-container-lowest/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary shadow-sm">
                  {book.genero}
                </span>
              )}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 border-r border-white/20 bg-gradient-to-r from-primary/35 via-primary/15 to-transparent" />
              <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 h-1 rounded-full bg-white/70 shadow-sm" />
            </div>

            {(hasValue(formatsValue) || hasValue(book?.disponibilidad_sala)) && (
              <div className="flex flex-wrap gap-2 text-label-sm font-label-sm">
                {formatsValue && (
                  <span className="flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary-fixed/40 px-2 py-1 text-on-secondary-fixed-variant">
                    <span className="material-symbols-outlined text-sm">devices</span>
                    {Array.isArray(formatsValue) ? formatsValue.join(' · ') : formatsValue}
                  </span>
                )}
                {hasValue(book?.disponibilidad_sala) && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-700/20 bg-emerald-50 px-2 py-1 text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    {book.disponibilidad_sala ? 'Disponible en sala' : 'No disponible en sala'}
                  </span>
                )}
              </div>
            )}

            {(hasValue(book?.licencias_disponibles) || hasValue(book?.ubicacion)) && (
            <div className="space-y-2 rounded-lg border border-outline-variant/50 bg-surface-container-low p-3">
              <div className="space-y-2">
                {hasValue(book?.licencias_disponibles) && (
                  <div className="flex items-center justify-between gap-2 text-label-sm font-label-sm text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">cloud_done</span> Licencias digitales disponibles</span>
                    <span className="font-semibold text-primary">{book.licencias_disponibles}</span>
                  </div>
                )}
              </div>
              {book?.ubicacion && (
                <div className="flex items-center justify-between gap-2 border-t border-outline-variant/30 pt-2 text-label-sm font-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-secondary">shelves</span> Ubicación</span>
                  <span>{book.ubicacion}</span>
                </div>
              )}
            </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={isWishlisted}
                onClick={() => setIsWishlisted((value) => !value)}
                className="flex items-center justify-center gap-1.5 rounded border border-outline-variant/60 px-3 py-2 text-label-sm font-label-sm text-primary transition-colors hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-base">{isWishlisted ? 'favorite' : 'favorite_border'}</span>
                {isWishlisted ? 'En lista de deseos' : 'Añadir a lista de deseos'}
              </button>
              <button type="button" className="flex items-center justify-center gap-1.5 rounded border border-outline-variant/60 px-3 py-2 text-label-sm font-label-sm text-primary transition-colors hover:bg-surface-container">
                <span className="material-symbols-outlined text-base">visibility</span> Vista previa
              </button>
            </div>

            {book?.cita_destacada && (
              <blockquote className="rounded-r-lg border-l-2 border-secondary bg-surface-container-low p-3 text-body-sm font-body-sm italic leading-relaxed text-on-surface-variant">
                «{book.cita_destacada}»
                {book?.referencia_cita && <cite className="mt-2 block not-italic text-label-sm font-label-sm">— {book.referencia_cita}</cite>}
              </blockquote>
            )}
          </aside>

          <div className="space-y-7 lg:col-span-8">
            <section className="space-y-3">
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide">
                {book?.categoria_principal && <span className="rounded bg-surface-container px-2 py-1 text-on-surface-variant">{book.categoria_principal}</span>}
                {book?.subcategoria && <span className="rounded bg-tertiary-fixed px-2 py-1 text-on-tertiary-fixed-variant">{book.subcategoria}</span>}
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl">{book?.titulo || 'Detalle del libro'}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-md font-body-md">
                <span className="text-on-surface-variant">Autor:</span>
                <span className="font-semibold text-secondary">{book?.autor || 'Autor desconocido'}</span>
                {(hasRating || reviewCount !== undefined) && <span className="hidden text-outline sm:inline">|</span>}
                {hasRating && (
                  <>
                    <span className="text-secondary" aria-label={`Calificación: ${rating} de 5 estrellas`}>{'★'.repeat(ratingStars)}{'☆'.repeat(5 - ratingStars)}</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">{rating.toFixed(1)}</span>
                  </>
                )}
                {hasValue(reviewCount) && <span className="text-label-sm font-label-sm text-on-surface-variant">{reviewCount} reseñas</span>}
              </div>
            </section>

            {metadata.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4 sm:grid-cols-3 xl:grid-cols-6">
                {metadata.map(([label, value]) => (
                  <div key={label} className="min-w-0 space-y-1">
                    <dt className="text-label-sm font-label-sm text-outline">{label}</dt>
                    <dd className="break-words text-label-sm font-label-sm font-medium text-primary">{Array.isArray(value) ? value.join(' · ') : value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <section className="space-y-5 rounded-lg border border-secondary-container/50 bg-surface p-5 shadow-[0_8px_24px_-4px_rgba(46,31,20,0.08)] sm:p-7">
              {isLoading && <p role="status" className="text-body-sm font-body-sm text-on-surface-variant">Cargando información del libro...</p>}
              {(loadError || !bookId) && <p role="alert" className="rounded border border-error/30 bg-error-container/40 p-3 text-body-sm font-body-sm text-error">{loadError || 'No se recibió el identificador del libro. Regresa al catálogo y selecciona una obra.'}</p>}
              {loanError && <p role="alert" className="rounded border border-error/30 bg-error-container/40 p-3 text-body-sm font-body-sm text-error">{loanError}</p>}
              {loanSuccess && <p role="status" className="rounded border border-emerald-700/20 bg-emerald-50 p-3 text-body-sm font-body-sm text-emerald-800">{loanSuccess}</p>}
              <div className="flex flex-col justify-between gap-3 border-b border-outline-variant/30 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="flex items-center gap-2 text-headline-sm font-headline-sm text-primary">
                    <span className="material-symbols-outlined text-secondary">book_online</span>
                    Módulo: Solicitud de Préstamo
                  </h2>
                  {book?.descripcion_prestamo && <p className="mt-1 text-body-sm font-body-sm text-on-surface-variant">{book.descripcion_prestamo}</p>}
                </div>
                {hasValue(book?.plazo_estandar_dias) && (
                <span className="flex items-center gap-1 rounded border border-outline-variant/40 bg-surface-container-low px-2.5 py-2 text-label-sm font-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm text-secondary">schedule</span>
                  Plazo estándar: {book.plazo_estandar_dias} días
                </span>
                )}
              </div>

              <fieldset className="space-y-3">
                <legend className="text-label-md font-label-md text-primary">Selecciona la modalidad de préstamo deseada:</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${loanType === 'digital' ? 'border-secondary bg-surface-container-low' : 'border-outline-variant/60 hover:bg-surface-container-low/60'}`}>
                    <input checked={loanType === 'digital'} className="mt-1 h-4 w-4 accent-secondary" name="loan-type" onChange={() => setLoanType('digital')} type="radio" value="digital" />
                    <span className="space-y-1">
                      <span className="block text-label-md font-label-md font-bold text-primary">Modalidad 1: Préstamo Digital</span>
                      {book?.descripcion_modalidad_digital && <span className="block text-body-sm font-body-sm text-on-surface-variant">{book.descripcion_modalidad_digital}</span>}
                      {book?.disponibilidad_digital && <span className="block text-label-sm font-label-sm text-secondary">{book.disponibilidad_digital}</span>}
                    </span>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${loanType === 'physical' ? 'border-secondary bg-surface-container-low' : 'border-outline-variant/60 hover:bg-surface-container-low/60'}`}>
                    <input checked={loanType === 'physical'} className="mt-1 h-4 w-4 accent-secondary" name="loan-type" onChange={() => setLoanType('physical')} type="radio" value="physical" />
                    <span className="space-y-1">
                      <span className="block text-label-md font-label-md font-bold text-primary">Modalidad 2: Retiro Físico en Sala</span>
                      {book?.descripcion_modalidad_fisica && <span className="block text-body-sm font-body-sm text-on-surface-variant">{book.descripcion_modalidad_fisica}</span>}
                      {book?.horario_recogida && <span className="block text-label-sm font-label-sm text-secondary">{book.horario_recogida}</span>}
                    </span>
                  </label>
                </div>
              </fieldset>

              <div className="flex flex-col items-stretch justify-between gap-4 pt-1 sm:flex-row sm:items-center">
                {book?.condiciones_prestamo && (
                  <p className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary">verified_user</span>
                    {book.condiciones_prestamo}
                  </p>
                )}
                <button type="button" disabled={isSubmittingLoan || !book?.id} onClick={solicitarPrestamo} className="flex items-center justify-center gap-2 rounded bg-[#D97706] px-6 py-3 font-label-md text-label-md font-semibold text-white shadow-md transition-colors hover:bg-[#C25E00] disabled:cursor-not-allowed disabled:opacity-60">
                  <span className="material-symbols-outlined text-lg">file_download</span>
                  {isSubmittingLoan ? 'Enviando solicitud...' : 'Solicitar Préstamo'}
                </button>
              </div>
            </section>

            {(sinopsis || book?.nota_critica) && (
              <section className="relative overflow-hidden rounded-xl border border-secondary/20 bg-surface-container-low p-6 shadow-[0_8px_24px_-8px_rgba(46,31,20,0.12)] sm:p-8">
                {sinopsis && (
                  <div className="relative border-l-4 border-secondary pl-5 sm:pl-6">
                    <div className="mb-3 flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-xl">auto_stories</span>
                      <span className="text-label-sm font-bold uppercase tracking-[0.16em]">Conoce la obra</span>
                    </div>
                    <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">Sinopsis de la obra</h2>
                    <p className="max-w-[72ch] whitespace-pre-line text-lg font-medium leading-8 text-on-surface sm:text-xl sm:leading-9">{sinopsis}</p>
                  </div>
                )}
                {book?.nota_critica && (
                  <aside className="mt-6 max-w-[72ch] rounded-r-lg border-l-2 border-outline-variant bg-surface-container-lowest/70 p-4 text-body-sm font-body-sm text-on-surface-variant">
                    {book.nota_critica}
                  </aside>
                )}
              </section>
            )}

            <section>
              <div role="tablist" aria-label="Información adicional del libro" className="flex flex-wrap border-b border-outline-variant/40">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-3 py-3 text-label-sm font-label-sm transition-colors sm:px-4 ${activeTab === tab.id ? 'border-secondary font-semibold text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-base">{tab.icon}</span>
                    {tab.label}
                    {tab.id === 'reviews' && reviews.length > 0 && <span className="rounded-full bg-surface-container px-1.5 text-[10px]">{reviews.length}</span>}
                  </button>
                ))}
              </div>

              <div role="tabpanel" className="mt-4 rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 sm:p-6">
                {activeTab === 'contents' && (
                  bookContents.length > 0 ? (
                    <>
                      <div className="mb-3 flex justify-between gap-4 border-b border-outline-variant/30 pb-3 text-label-sm font-label-sm uppercase tracking-wide text-outline">
                        <span>Estructura capitular / sección</span><span>Ubicación / página</span>
                      </div>
                      <ul className="space-y-1">
                        {displayedContents.map((entry, index) => {
                          const title = typeof entry === 'string'
                            ? entry
                            : entry?.titulo ?? entry?.seccion ?? entry?.nombre;
                          if (!title) return null;
                          const page = typeof entry === 'object'
                            ? entry?.pagina ?? entry?.ubicacion
                            : undefined;

                          return (
                            <li key={entry?.id ?? `${title}-${index}`} className="flex items-start justify-between gap-4 rounded px-2 py-2 text-body-sm font-body-sm text-on-surface hover:bg-surface-container">
                              <span className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm text-secondary">{index === 0 ? 'bookmark' : 'menu_book'}</span>
                                {title}
                              </span>
                              {page && <span className="shrink-0 font-mono text-label-sm font-label-sm text-outline">{page}</span>}
                            </li>
                          );
                        })}
                      </ul>
                      {bookContents.length > 5 && (
                        <button type="button" onClick={() => setShowFullContents((value) => !value)} className="mt-3 w-full text-center text-label-sm font-label-sm font-semibold text-secondary hover:underline">
                          {showFullContents ? 'Mostrar menos' : 'Mostrar índice completo'}
                        </button>
                      )}
                    </>
                  ) : <p className="text-body-sm font-body-sm text-on-surface-variant">Índice de contenidos no disponible.</p>
                )}
                {activeTab === 'edition' && (
                  metadata.length > 0 ? (
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {metadata.map(([label, value]) => (
                        <div key={label} className="border-b border-outline-variant/30 pb-3">
                          <dt className="text-label-sm font-label-sm text-outline">{label}</dt>
                          <dd className="mt-1 text-body-sm font-body-sm font-medium text-primary">{Array.isArray(value) ? value.join(' · ') : value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : <p className="text-body-sm font-body-sm text-on-surface-variant">Detalles de edición no disponibles.</p>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    {hasRating && (
                      <div className="flex items-center gap-2 text-secondary" aria-label={`Calificación promedio: ${rating} de 5 estrellas`}>
                        {'★'.repeat(ratingStars)}{'☆'.repeat(5 - ratingStars)}
                        {hasValue(reviewCount) && <span className="text-label-sm font-label-sm text-on-surface-variant">{rating.toFixed(1)} · {reviewCount} reseñas</span>}
                      </div>
                    )}
                    {reviews.map((review, index) => {
                      const reviewId = review?.id ?? `${review?.autor ?? 'resena'}-${index}`;
                      const reviewText = review?.comentario ?? review?.texto;
                      if (!reviewText) return null;

                      return (
                        <article key={reviewId} className="border-t border-outline-variant/30 pt-3">
                          {review?.autor && <h3 className="text-label-md font-label-md font-semibold text-primary">{review.autor}</h3>}
                          {hasValue(review?.calificacion) && <p className="text-secondary">{'★'.repeat(Math.max(0, Math.min(5, Math.round(Number(review.calificacion)))) )}</p>}
                          <p className="text-body-sm font-body-sm text-on-surface-variant">{reviewText}</p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>

        {relatedBooks.length > 0 && (
        <section className="space-y-5 border-t border-outline-variant/30 pt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-headline-md font-headline-md text-primary">Obras relacionadas que podrían interesarte</h2>
              {book?.descripcion_obras_relacionadas && <p className="mt-1 text-body-sm font-body-sm text-on-surface-variant">{book.descripcion_obras_relacionadas}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Obras anteriores" className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant/50 text-primary hover:bg-surface-container"><span className="material-symbols-outlined">arrow_back</span></button>
              <button type="button" aria-label="Obras siguientes" className="flex h-9 w-9 items-center justify-center rounded border border-outline-variant/50 text-primary hover:bg-surface-container"><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedBooks.map((relatedBook, index) => {
              const title = relatedBook?.titulo ?? relatedBook?.title;
              if (!title) return null;
              const author = relatedBook?.autor ?? relatedBook?.author;
              const status = relatedBook?.estado ?? relatedBook?.status;
              const format = relatedBook?.formato ?? relatedBook?.formatos;
              const cover = relatedBook?.portada_url ?? relatedBook?.imagen_url;

              return (
              <article key={relatedBook?.id ?? `${title}-${index}`} className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-sm">
                <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded bg-surface-container-high text-center text-outline">
                  {cover ? <img src={cover} alt={`Portada de ${title}`} className="absolute inset-0 h-full w-full object-cover" /> : <span className="material-symbols-outlined text-3xl">import_contacts</span>}
                </div>
                {format && <span className="mt-2 inline-block rounded bg-surface-container px-1.5 py-0.5 text-[10px] text-primary">{Array.isArray(format) ? format.join(' · ') : format}</span>}
                <h3 className="mt-2 text-headline-sm font-headline-sm font-semibold text-primary">{title}</h3>
                {author && <p className="mt-1 text-body-sm font-body-sm text-on-surface-variant">{author}</p>}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-outline-variant/30 pt-2 text-label-sm font-label-sm">
                  {hasValue(status) && <span className={String(status).toLowerCase().includes('disponible') ? 'text-emerald-700' : 'text-secondary'}>● {status}</span>}
                  <button type="button" onClick={onNavigateToCatalog} className="text-secondary hover:underline">Ver detalle</button>
                </div>
              </article>
              );
            })}
          </div>
        </section>
        )}
      </main>

      <footer className="mt-8 border-t border-outline-variant/30 bg-surface-container">
        <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-4 px-gutter py-6 text-label-sm font-label-sm text-on-surface-variant md:flex-row md:items-center md:px-margin">
          <div>
            <div className="flex items-center gap-2 font-headline-sm text-headline-sm font-semibold text-primary"><span className="material-symbols-outlined text-secondary">local_library</span>Biblioteca</div>
            <p className="mt-2">© 2024 Biblioteca Digital. Todos los derechos reservados.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Horarios de Atención</span>
            <span>Catálogo Histórico</span>
            <span>Términos y Privacidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
