import { useState } from 'react';

function Icon({ children, className = '' }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{children}</span>;
}

export default function PrestamosLector({ userName, onNavigateToCatalog }) {
  const [activeLoans] = useState([]);
  const [metrics] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [toast, setToast] = useState('');
  const [keepNotes, setKeepNotes] = useState(true);

  const confirmReturn = () => {
    if (!selectedLoan) return;
    setToast(`"${selectedLoan.title}" ha sido procesado en el sistema.`);
    setSelectedLoan(null);
    window.setTimeout(() => setToast(''), 4000);
  };

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
              <p className="text-body-lg font-body-lg text-on-surface-variant mt-2">Gestione sus obras en curso, renueve plazos o registre devoluciones inmediatas para licencias digitales.</p>
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
              <span>Préstamos Activos</span><span className="px-2 py-0.5 text-label-sm font-label-sm bg-secondary-fixed text-on-secondary-fixed rounded-full">{activeLoans.length}</span>
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
              <span>Obras en Préstamo Activo</span><span className="text-label-md font-label-md text-outline font-normal">· {activeLoans.length} títulos en posesión</span>
            </h2>
            <span className="text-body-sm font-body-sm text-on-surface-variant hidden sm:inline">Las devoluciones digitales son automáticas al confirmarse en el sistema.</span>
          </div>
          {activeLoans.length > 0 ? activeLoans.map((loan) => (
            <article key={loan.id} className={`bg-surface-container-lowest rounded ${loan.kind === 'physical' ? 'border-2 border-secondary-fixed/80 hover:border-secondary relative overflow-hidden' : 'border border-outline-variant/30 hover:border-outline-variant'} p-space-md md:p-space-lg shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] transition-all`}>
              {loan.kind === 'physical' && <div className="absolute top-0 right-0 bg-secondary-fixed text-on-secondary-fixed text-label-sm font-label-sm font-bold px-3 py-1 rounded-bl">ATENCIÓN: PRÓXIMO A VENCER</div>}
              <div className="flex flex-col md:flex-row gap-space-md md:gap-space-lg">
                <div className="w-full md:w-44 flex-shrink-0 flex justify-center md:justify-start">
                  <div className="relative w-36 md:w-44 aspect-[2/3] bg-surface-container-high rounded shadow-[0_8px_16px_-4px_rgba(46,31,20,0.15)] overflow-hidden border border-outline-variant/40 flex-shrink-0 group">
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />
                    <img alt={`Portada de ${loan.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={loan.cover} />
                    {loan.kind === 'digital' && <div className="absolute top-2 right-2 bg-primary-container/90 text-surface-container-lowest text-label-sm font-label-sm px-1.5 py-0.5 rounded shadow">ePub</div>}
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
                        {loan.kind === 'physical' ? 'Vence en 4 días (16:00 h)' : 'Al día · 8 días restantes'}
                      </span>
                    </div>
                    <h3 className="text-headline-md font-headline-md text-primary font-semibold tracking-tight">{loan.title}</h3>
                    <p className="text-body-md font-body-md text-on-surface-variant italic mt-0.5">{loan.author}</p>
                    {loan.kind === 'digital' && (
                      <div className="mt-4 p-3 bg-surface-container-low rounded border border-outline-variant/20 max-w-xl">
                        <div className="flex items-center justify-between text-label-md font-label-md mb-1.5">
                          <span className="text-on-surface font-semibold flex items-center gap-1.5"><Icon className="text-[16px] text-secondary">chrome_reader_mode</Icon>Progreso: 42% completado</span>
                          <span className="text-outline">Capítulo 3 (Pág. 148 de 352)</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: '42%' }} /></div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 mt-3 text-body-sm font-body-sm text-on-surface-variant">
                      <div className="flex items-center gap-2"><Icon className="text-[18px] text-outline">{loan.kind === 'digital' ? 'event_available' : 'calendar_month'}</Icon><span>{loan.kind === 'digital' ? 'Prestado:' : 'Retirado:'} <strong className="text-primary font-medium">{loan.loaned}</strong></span></div>
                      <div className={`flex items-center gap-2 ${loan.kind === 'physical' ? 'text-secondary font-medium' : ''}`}><Icon className="text-[18px] text-outline">event_busy</Icon><span>{loan.kind === 'physical' ? 'Límite de devolución:' : 'Vencimiento:'} <strong className="text-primary font-medium">{loan.due}</strong></span></div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {loan.kind === 'digital' ? (
                        <>
                          <button type="button" className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary-container text-surface-container-lowest hover:bg-[#4A3324] text-label-lg font-label-lg shadow-sm transition-all"><Icon className="text-[20px]">auto_stories</Icon><span>Continuar Leyendo</span></button>
                          <button type="button" onClick={() => setSelectedLoan(loan)} title="Devolver inmediatamente para liberar la licencia del acervo" className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-outline/30 bg-surface-container hover:bg-secondary-fixed/50 hover:border-secondary text-primary text-label-lg font-label-lg transition-all"><Icon className="text-[20px] text-secondary">assignment_return</Icon><span>Registrar Devolución</span></button>
                        </>
                      ) : (
                        <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-outline/30 bg-surface-container hover:bg-surface-container-high text-primary text-label-lg font-label-lg transition-all"><Icon className="text-[20px] text-outline">more_time</Icon><span>Solicitar Prórroga de Sala</span></button>
                      )}
                    </div>
                    {loan.kind === 'digital' && <div className="flex items-center gap-3"><button type="button" className="inline-flex items-center gap-1.5 text-label-md font-label-md text-secondary hover:text-on-secondary-container transition-colors py-1"><Icon className="text-[18px]">update</Icon><span>Renovar plazo (+15 días)</span></button><span className="text-outline/40">|</span><button type="button" className="text-label-md font-label-md text-outline hover:text-primary transition-colors py-1">Descargar Notas (PDF)</button></div>}
                  </div>
                </div>
              </div>
            </article>
          )) : (
            <div className="bg-surface-container-lowest rounded border border-outline-variant/30 p-space-md md:p-space-lg text-body-sm font-body-sm text-on-surface-variant">
              No tienes préstamos activos en este momento.
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
              <div><span className="text-label-sm font-label-sm text-outline uppercase tracking-wider">Obra a entregar:</span><p className="text-headline-sm font-headline-sm text-primary font-semibold mt-0.5">{selectedLoan.title}</p><p className="text-body-sm font-body-sm text-on-surface-variant">{selectedLoan.meta}</p></div>
              <div className="p-4 rounded bg-surface-container border border-outline-variant/30 text-body-sm font-body-sm text-on-surface">
                <strong className="text-primary block mb-1">{selectedLoan.kind === 'digital' ? 'Reintegro Digital Inmediato:' : 'Registro de Entrega en Sala:'}</strong>
                {selectedLoan.kind === 'digital'
                  ? 'Al confirmar, la licencia ePub se liberará de sus dispositivos y volverá a estar disponible para la comunidad lectora. No incurre en ningún recargo.'
                  : 'Se emitirá su comprobante de recepción para la mesa B-14. Por favor, asegúrese de depositar el volumen físico en el casillero de entrega antes de las 16:00 h para registrar la recepción conforme.'}
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                <input checked={keepNotes} onChange={(event) => setKeepNotes(event.target.checked)} className="mt-1 rounded border-outline text-secondary focus:ring-secondary" type="checkbox" />
                <span className="text-body-sm font-body-sm text-on-surface-variant">Conservar mis subrayados, marcadores y notas privadas en mi expediente para futuras consultas.</span>
              </label>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setSelectedLoan(null)} className="px-4 py-2 text-label-lg font-label-lg text-primary hover:bg-surface-container rounded transition-colors">Cancelar</button>
              <button type="button" onClick={confirmReturn} className="px-5 py-2 text-label-lg font-label-lg bg-secondary text-on-secondary hover:bg-[#7a4100] rounded transition-colors font-semibold shadow-sm flex items-center gap-2"><Icon className="text-[18px]">assignment_turned_in</Icon><span>{selectedLoan.kind === 'digital' ? 'Liberar Licencia Digital' : 'Confirmar Entrega de Ejemplar'}</span></button>
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
