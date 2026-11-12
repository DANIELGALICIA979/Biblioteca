import { useEffect, useState } from 'react';

function Icon({ children, className = '' }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{children}</span>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-MX', { dateStyle: 'medium' });
};

export default function PrestamosLector({ userName, accessToken, onNavigateToCatalog, onNavigateToLogin }) {
  const [activeLoans, setActiveLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isReturning, setIsReturning] = useState(false);
  const [openingLoanId, setOpeningLoanId] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!accessToken) {
      setLoadError('Inicia sesión como lector para consultar tus préstamos.');
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const loadLoans = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/prestamos`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || 'No se pudieron cargar tus préstamos.');
        setActiveLoans(Array.isArray(payload) ? payload : []);
        setLoadError('');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error al cargar los préstamos del lector:', error);
          setLoadError(error.message || 'No se pudieron cargar tus préstamos.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadLoans();
    return () => controller.abort();
  }, [accessToken]);

  const confirmReturn = async () => {
    if (!selectedLoan) return;
    setIsReturning(true);
    setLoadError('');

    try {
      const response = await fetch(`${API_BASE_URL}/prestamos/${encodeURIComponent(selectedLoan.id)}/devolucion`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'No se pudo revocar el préstamo digital.');
      setActiveLoans((loans) => loans.map((loan) => (
        loan.id === selectedLoan.id
          ? { ...loan, estado: 'devuelto', fecha_devolucion: payload.prestamo?.fecha_devolucion }
          : loan
      )));
      setToast(`El acceso digital de "${selectedLoan.libros?.titulo || 'la obra'}" fue revocado.`);
      setSelectedLoan(null);
      window.setTimeout(() => setToast(''), 4000);
    } catch (error) {
      console.error('Error al devolver el préstamo digital:', error);
      setLoadError(error.message || 'No se pudo revocar el préstamo digital.');
    } finally {
      setIsReturning(false);
    }
  };

  const openDigitalLoan = async (loanId) => {
    const readingWindow = window.open('about:blank', '_blank');
    if (readingWindow) readingWindow.opener = null;
    setOpeningLoanId(loanId);
    setLoadError('');

    try {
      const response = await fetch(`${API_BASE_URL}/prestamos/${encodeURIComponent(loanId)}/archivo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'No se pudo abrir el archivo digital.');
      if (readingWindow) readingWindow.location.href = payload.signedUrl;
      else window.location.assign(payload.signedUrl);
    } catch (error) {
      readingWindow?.close();
      console.error('Error al abrir el archivo del préstamo digital:', error);
      setLoadError(error.message || 'No se pudo abrir el archivo digital.');
    } finally {
      setOpeningLoanId('');
    }
  };
  const activeCount = activeLoans.filter((loan) => ['activo', 'vencido'].includes(loan.estado)).length;
  const pendingCount = activeLoans.filter((loan) => loan.estado === 'pendiente').length;
  const metrics = [
    { label: 'Préstamos vigentes', value: activeCount, icon: 'auto_stories', color: 'bg-secondary-fixed', note: 'Digitales y físicos' },
    { label: 'Solicitudes físicas', value: pendingCount, icon: 'inventory_2', color: 'bg-tertiary-fixed', note: 'Pendientes de recogida' },
  ];
  const displayLoans = activeLoans.map((loan) => {
    const kind = loan.tipo_prestamo === 'fisico' ? 'physical' : 'digital';
    const statusLabels = {
      pendiente: 'Pendiente de recogida',
      activo: kind === 'digital' ? 'Acceso activo · sin vencimiento' : 'En préstamo',
      vencido: 'Vencido · ejemplar pendiente de devolución',
      devuelto: 'Devuelto',
      cancelado: 'Solicitud cancelada',
    };
    const copyDetails = [loan.ejemplares?.codigo_inventario, loan.ejemplares?.ubicacion]
      .filter(Boolean)
      .join(' · ');

    return {
      ...loan,
      kind,
      title: loan.libros?.titulo || 'Libro sin título',
      author: loan.libros?.autor || 'Autor desconocido',
      cover: loan.libros?.portada_url || '',
      format: kind === 'digital' ? String(loan.libros?.formato || 'Digital').toUpperCase() : 'Ejemplar físico',
      meta: kind === 'digital' ? 'Acceso digital sin vencimiento' : copyDetails || loan.ejemplar_id,
      loaned: formatDate(loan.fecha_prestamo || loan.fecha_solicitud),
      due: loan.estado === 'pendiente'
        ? formatDate(loan.fecha_limite_retiro)
        : loan.fecha_limite ? formatDate(loan.fecha_limite) : 'Sin vencimiento',
      statusLabel: statusLabels[loan.estado] || loan.estado,
    };
  });
  const demoReadingProgress = 42;

  return (
    <div className="min-h-screen flex flex-col font-body-md text-on-background bg-background selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <header className="w-full bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/30 dark:border-outline/20 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] sticky top-0 z-40">
        <div className="w-full px-gutter md:px-margin max-w-[1360px] mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-space-lg flex-1 max-w-2xl">
            <button type="button" onClick={onNavigateToCatalog} className="text-headline-md font-headline-md font-semibold text-primary dark:text-inverse-primary tracking-tight flex items-center gap-2 flex-shrink-0">
              <Icon className="text-secondary" >local_library</Icon>
              Biblioteca
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant"><Icon className="text-[20px]">search</Icon></div>
              <input aria-label="Buscar por título o autor" className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" placeholder="Buscar por título o autor." type="search" />
            </div>
          </div>
          <nav className="flex items-center gap-space-lg">
            <div className="hidden md:flex items-center gap-6">
              <button type="button" onClick={onNavigateToCatalog} className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors pb-1 text-label-lg font-label-lg">Catálogo</button>
              <span aria-current="page" className="border-b-2 border-secondary text-primary dark:text-inverse-primary pb-1 font-semibold text-label-lg font-label-lg">Mis Préstamos</span>
            </div>
            <div className="flex items-center pl-3 border-l border-outline-variant/40">
              {userName ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-outline-variant/60 text-primary dark:text-inverse-primary font-label-md text-label-md font-semibold">
                  <Icon className="text-[18px]">person</Icon><span>{userName}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-outline-variant/60 text-primary dark:text-inverse-primary font-label-md text-label-md font-semibold">
                  <Icon className="text-[18px]">person</Icon><span>Lector</span>
                </span>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-gutter md:px-margin py-space-lg md:py-space-xl">
        <section className="mb-space-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-md border-b border-outline-variant/30">
            <div className="max-w-[68ch]">
              <h1 className="text-display-lg font-headline-lg text-primary tracking-tight">Mis Préstamos y Lecturas Activas</h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant mt-2">Consulta tus préstamos digitales y físicos, solicitudes pendientes y devoluciones.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-space-md">
            {metrics.length > 0 ? metrics.map((metric) => (
              <div key={metric.label} className="bg-surface-container-lowest p-4 rounded border border-outline-variant/30 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] flex items-start gap-3">
                <div className={`p-2 rounded ${metric.color}`}><Icon className="text-[24px]">{metric.icon}</Icon></div>
                <div>
                  <div className="text-label-sm font-label-sm text-outline uppercase tracking-wider">{metric.label}</div>
                  <div className="text-headline-sm font-headline-sm text-primary font-semibold mt-0.5">{metric.value} {metric.detail && <span className="text-body-sm font-body-sm text-on-surface-variant font-normal">{metric.detail}</span>}</div>
                  <div className="text-label-sm font-label-sm text-secondary font-medium mt-0.5">{metric.note}</div>
                </div>
              </div>
            )) : (
              <p className="col-span-2 md:col-span-4 bg-surface-container-lowest p-4 rounded border border-outline-variant/30 text-body-sm font-body-sm text-on-surface-variant">
                No hay métricas disponibles por el momento.
              </p>
            )}
          </div>
        </section>

        <div className="border-b border-outline-variant/40 mb-space-lg">
          <div className="flex items-center gap-space-lg overflow-x-auto">
            <button type="button" className="pb-3 text-label-lg font-label-lg font-semibold text-primary border-b-2 border-secondary flex items-center gap-2 whitespace-nowrap">
              <span>Mis Préstamos</span><span className="px-2 py-0.5 text-label-sm font-label-sm bg-secondary-fixed text-on-secondary-fixed rounded-full">{activeLoans.length}</span>
            </button>
            <button type="button" className="pb-3 text-label-lg font-label-lg font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 whitespace-nowrap">
              <span>Reservas en Sala</span>
            </button>
            <button type="button" className="pb-3 text-label-lg font-label-lg font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 whitespace-nowrap">
              <span>Lista de Deseos / Guardados</span>
            </button>
          </div>
        </div>

        <section className="space-y-space-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-headline-sm text-primary font-semibold flex items-center gap-2">
              <span>Préstamos y solicitudes</span><span className="text-label-md font-label-md text-outline font-normal">· {activeCount} vigentes · {pendingCount} pendientes</span>
            </h2>
            <span className="text-body-sm font-body-sm text-on-surface-variant hidden sm:inline">El acceso digital permanece activo hasta que lo devuelvas.</span>
          </div>
          {loadError && (
            <div role="alert" className="rounded border border-error/30 bg-error-container/40 p-3 text-body-sm font-body-sm text-error">
              <p>{loadError}</p>
              {!accessToken && <button type="button" onClick={onNavigateToLogin} className="mt-2 font-semibold underline">Iniciar sesión</button>}
            </div>
          )}
          {isLoading ? (
            <p role="status" className="rounded border border-outline-variant/30 bg-surface-container-lowest p-space-md text-body-sm font-body-sm text-on-surface-variant">Cargando tus préstamos...</p>
          ) : displayLoans.length > 0 ? displayLoans.map((loan) => (
            <article key={loan.id} className={`bg-surface-container-lowest rounded ${loan.kind === 'physical' ? 'border-2 border-secondary-fixed/80 hover:border-secondary' : 'border border-outline-variant/30 hover:border-outline-variant'} p-4 md:p-5 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] transition-all`}>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
                <div className="w-full flex-shrink-0 sm:w-32 md:w-36">
                  <div className="relative mx-auto aspect-[2/3] w-32 sm:w-full bg-surface-container-high rounded shadow-[0_8px_16px_-4px_rgba(46,31,20,0.15)] overflow-hidden border border-outline-variant/40 group">
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />
                    {loan.cover
                      ? <img alt={`Portada de ${loan.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={loan.cover} />
                      : <div className="flex h-full items-center justify-center text-primary"><Icon className="text-5xl">menu_book</Icon></div>}
                    {loan.kind === 'digital' && <div className="absolute top-2 right-2 bg-primary-container/90 text-surface-container-lowest text-label-sm font-label-sm px-1.5 py-0.5 rounded shadow">{loan.format}</div>}
                  </div>
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-surface-container text-primary-container text-label-md font-label-md">
                          <Icon className="text-[16px] text-secondary">{loan.kind === 'digital' ? 'devices' : 'domain_verification'}</Icon>{loan.format}
                        </span>
                        {loan.kind === 'digital' && <span className="text-label-sm font-label-sm text-outline">{loan.meta}</span>}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-label-md font-label-md font-semibold border ${loan.kind === 'physical' ? 'bg-secondary-fixed/50 text-on-secondary-fixed border-secondary/30' : 'bg-surface-container-high text-on-surface border-outline-variant/40'}`}>
                        {loan.kind === 'physical' ? <Icon className="text-[16px] text-secondary">alarm</Icon> : <span className="w-2 h-2 rounded-full bg-secondary" />}
                        {loan.statusLabel}
                      </span>
                    </div>
                    <h3 className="text-headline-md font-headline-md text-primary font-semibold tracking-tight">{loan.title}</h3>
                    <p className="text-body-md font-body-md text-on-surface-variant italic mt-0.5">{loan.author}</p>
                    {loan.kind === 'digital' && loan.estado === 'activo' && (
                      <div className="mt-4 max-w-2xl rounded-lg border border-outline-variant/30 bg-surface-container-low p-3.5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2 text-label-md font-label-md font-semibold text-primary">
                            <Icon className="text-[18px] text-secondary">auto_stories</Icon>
                            Progreso de lectura
                          </span>
                          <span className="text-label-md font-label-md font-semibold text-secondary">{demoReadingProgress}%</span>
                        </div>
                        <div
                          aria-label={`Progreso de lectura: ${demoReadingProgress}%`}
                          aria-valuemax="100"
                          aria-valuemin="0"
                          aria-valuenow={demoReadingProgress}
                          className="h-2 overflow-hidden rounded-full bg-surface-container-highest"
                          role="progressbar"
                        >
                          <div className="h-full rounded-full bg-secondary" style={{ width: `${demoReadingProgress}%` }} />
                        </div>
                        <p className="mt-2 text-label-sm font-label-sm text-on-surface-variant">Esta barra es una vista previa; aún no guarda tu progreso.</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 mt-3 text-body-sm font-body-sm text-on-surface-variant">
                      <div className="flex items-center gap-2"><Icon className="text-[18px] text-outline">{loan.estado === 'pendiente' ? 'event' : 'event_available'}</Icon><span>{loan.estado === 'pendiente' ? 'Solicitado:' : 'Préstamo iniciado:'} <strong className="text-primary font-medium">{loan.loaned}</strong></span></div>
                      <div className="flex items-center gap-2"><Icon className="text-[18px] text-outline">event_busy</Icon><span>{loan.estado === 'pendiente' ? 'Recoger antes de:' : loan.kind === 'physical' ? 'Límite de devolución:' : 'Vencimiento:'} <strong className="text-primary font-medium">{loan.due}</strong></span></div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {loan.kind === 'digital' && loan.estado === 'activo' ? (
                        <>
                          <button type="button" disabled={openingLoanId === loan.id} onClick={() => openDigitalLoan(loan.id)} className="inline-flex items-center gap-2 rounded bg-primary-container px-4 py-2.5 text-label-lg font-label-lg text-surface-container-lowest shadow-sm transition-all hover:bg-[#4A3324] disabled:opacity-60"><Icon className="text-[20px]">auto_stories</Icon><span>{openingLoanId === loan.id ? 'Abriendo...' : 'Continuar leyendo'}</span></button>
                          <button type="button" disabled={isReturning} onClick={() => setSelectedLoan(loan)} title="Revocar tu acceso digital" className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-outline/30 bg-surface-container hover:bg-secondary-fixed/50 hover:border-secondary text-primary text-label-lg font-label-lg transition-all disabled:opacity-60"><Icon className="text-[20px] text-secondary">assignment_return</Icon><span>Devolver acceso</span></button>
                        </>
                      ) : loan.kind === 'physical' && loan.estado === 'pendiente' ? (
                        <span className="text-body-sm font-body-sm text-on-surface-variant">La entrega debe confirmarla el administrador de la biblioteca.</span>
                      ) : loan.kind === 'physical' && ['activo', 'vencido'].includes(loan.estado) ? (
                        <span className="text-body-sm font-body-sm text-on-surface-variant">Devuelve el ejemplar en la biblioteca; el administrador registrará la recepción.</span>
                      ) : (
                        <span className="text-body-sm font-body-sm text-on-surface-variant">{loan.estado === 'devuelto' ? 'Préstamo devuelto.' : 'La solicitud fue cancelada.'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )) : (
            <div className="bg-surface-container-lowest rounded border border-outline-variant/30 p-space-md md:p-space-lg text-body-sm font-body-sm text-on-surface-variant">
              No tienes préstamos ni solicitudes registrados.
            </div>
          )}
        </section>

      </main>

      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded border border-outline-variant shadow-[0_16px_40px_-8px_rgba(31,21,13,0.16)] overflow-hidden">
            <div className="p-6 pb-4 border-b border-outline-variant/30 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-secondary-fixed/60 text-on-secondary-fixed flex items-center justify-center"><Icon className="text-[24px]">assignment_return</Icon></div>
                <div><h2 id="return-modal-title" className="text-headline-sm font-headline-sm text-primary font-semibold">Confirmar Devolución</h2><p className="text-label-md font-label-md text-outline">Gestión de acervo bibliográfico</p></div>
              </div>
              <button type="button" aria-label="Cerrar ventana" onClick={() => setSelectedLoan(null)} className="text-outline hover:text-primary p-1 rounded hover:bg-surface-container"><Icon>close</Icon></button>
            </div>
            <div className="p-6 space-y-4">
              <div><span className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Acceso a revocar:</span><p className="text-headline-sm font-headline-sm text-primary font-semibold mt-0.5">{selectedLoan.libros?.titulo}</p><p className="text-body-sm font-body-sm text-on-surface-variant">{selectedLoan.libros?.formato?.toUpperCase()}</p></div>
              <div className="p-4 rounded bg-surface-container border border-outline-variant/30 text-body-sm font-body-sm text-on-surface">
                <strong className="text-primary block mb-1">Revocación digital:</strong>
                Al confirmar, este acceso se marcará como devuelto y dejará de aparecer como préstamo activo.
              </div>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setSelectedLoan(null)} className="px-4 py-2 text-label-lg font-label-lg text-primary hover:bg-surface-container rounded transition-colors">Cancelar</button>
              <button type="button" disabled={isReturning} onClick={confirmReturn} className="px-5 py-2 text-label-lg font-label-lg bg-secondary text-on-secondary hover:bg-[#7a4100] rounded transition-colors font-semibold shadow-sm flex items-center gap-2 disabled:opacity-60"><Icon className="text-[18px]">assignment_turned_in</Icon><span>{isReturning ? 'Procesando...' : 'Revocar acceso'}</span></button>
            </div>
          </div>
        </div>
      )}

      <div role="status" aria-live="polite" className={`fixed bottom-6 right-6 z-50 bg-primary-container text-surface-container-lowest px-5 py-3.5 rounded shadow-xl flex items-center gap-3 transition-opacity duration-300 ${toast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Icon className="text-secondary-fixed text-[24px]">check_circle</Icon>
        <div><h2 className="text-label-lg font-label-lg font-semibold">Devolución Registrada con Éxito</h2><p className="text-body-sm font-body-sm text-outline-variant">{toast || 'La obra ha sido devuelta satisfactoriamente.'}</p></div>
      </div>

      <footer className="w-full bg-surface-container dark:bg-inverse-surface border-t border-outline-variant/40 dark:border-outline/30 mt-auto">
        <div className="w-full py-space-xl px-gutter md:px-margin max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-space-lg">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-headline-sm font-headline-sm font-semibold text-primary dark:text-inverse-primary">Biblioteca</span>
            <p className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant mt-1">© 2024 Biblioteca Digital. Todos los derechos reservados.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-md md:gap-space-lg">
            <a className="text-label-md font-label-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Horarios de Atención</a>
            <a className="text-label-md font-label-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors" href="#">Términos y Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
