const formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('es-MX') : '0';
};

const formatKnownNumber = (value) => (value === null || value === undefined ? 'N/D' : formatNumber(value));

const formatText = (value) =>
  value === null || value === undefined || value === '' ? 'Dato no disponible' : value;

const loanStatusStyles = {
  alDia: 'bg-[#EAF2EC] text-[#285933]',
  porVencer: 'bg-[#FFF2E0] text-secondary',
  vencido: 'bg-error-container text-error',
};

export default function DashBoardAdmin({
  onNavigateToCatalog,
  onNavigateToNewBook,
  dashboardData = {},
  prestamosRecientes = [],
}) {
  const loans = Array.isArray(prestamosRecientes) ? prestamosRecientes : [];
  const administrator = dashboardData?.administrador ?? {};
  const digitalCoverage = Math.min(
    100,
    Math.max(0, Number(dashboardData?.porcentajeObrasDigitales) || 0),
  );
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col font-body-sm selection:bg-secondary-fixed selection:text-on-secondary-fixed">

<header className="w-full bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<div className="w-full px-gutter md:px-margin max-w-[1360px] mx-auto flex items-center justify-between h-20">

<div className="flex items-center gap-space-lg">
<a className="flex items-center gap-3 group" href="#">
<span className="w-10 h-10 rounded-xl bg-primary-container text-surface flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-2xl text-secondary-container" data-icon="local_library">local_library</span>
</span>
<div>
<span className="font-headline-md text-headline-md font-semibold text-primary tracking-tight group-hover:text-secondary transition-colors">Biblioteca</span>

</div>
</a>

<div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DC] border border-[#4A3324]/10 text-on-surface-variant font-label-md text-label-md">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
<span className="">Panel de Administración</span>
</div>
</div>

<div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
<div className="relative w-full">
<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B584B]">
<span className="material-symbols-outlined text-lg" data-icon="search">search</span>
</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-[#2E1F14]/15 rounded-xl text-on-surface placeholder-on-surface-variant/60 font-body-sm text-body-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all" placeholder="Buscar por título" type="text" />

</div>
</div>

<div className="flex items-center gap-space-md">

<a className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-container/20 hover:bg-primary-container/5 text-primary font-label-md text-label-md transition-colors" href="#">
<span className="material-symbols-outlined text-base" data-icon="visibility">visibility</span>
<span className="">Ver como Lector</span>
</a>


<div className="h-6 w-px bg-outline-variant/50 hidden sm:block"></div>

<div className="flex items-center gap-3 pl-1">
<img className="w-10 h-10 rounded-full object-cover ring-2 ring-outline-variant/40" alt="Retrato de Dr. Aurelio Mendoza en una sala histórica de archivo." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5KPb9uDb6HUsG8T9Bu-nOlKShCdvb6yYus-XppL6ofphp0BFId0FsaV83iIQxpGEMD7AJdt84PkbpWvv6sCtahHxwU5KfyGx6KtHutN5SC33-uWdCWknEzViMOHWRRuqp8IjECaEVno-Ift7Qj2hE2GN0BOIH23TVAedyw34l6NlZLwU1Mx1OW3UbHDe9OmU-sE2nUe4A0YLQyiHe5_wv1gplpqmcLJcwG_Puqf30" />
<div className="hidden xl:block text-left">
<span className="block font-label-md text-label-md font-semibold text-primary leading-tight">{formatText(administrator.nombre)}</span>
<span className="block text-[11px] font-body-sm text-on-surface-variant">{formatText(administrator.email)}</span>
</div>
<button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors" title="Cerrar Sesión">
<span className="material-symbols-outlined text-xl" data-icon="logout">logout</span>
</button>
</div>
</div>
</div>
</header>

<main className="flex-grow w-full max-w-[1360px] mx-auto px-gutter-mobile md:px-margin py-space-lg md:py-space-xl">

<section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-lg border-b border-outline-variant/30">
<div className="max-w-[68ch]">
<div className="flex items-center gap-2 mb-1.5">

<span className="text-on-surface-variant text-label-sm font-label-sm">• Actualizado: {formatText(dashboardData?.ultimaActualizacion)}</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Panel de Control</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Supervisión en tiempo real de préstamos, conservación digital e inventario bibliográfico de la biblioteca.</p>
</div>

<div className="flex flex-wrap items-center gap-3 shrink-0">

<button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg shadow-[0_2px_8px_-2px_rgba(144,77,0,0.35)] transition-all duration-200" onClick={onNavigateToNewBook} type="button">
<span className="material-symbols-outlined text-lg" data-icon="add_circle">add_circle</span>
<span className="">+ Agregar Nuevo Libro</span>
</button>
</div>
</section>

<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-space-md my-space-lg">
{[
  {
    label: 'Total Obras en Catálogo',
    value: formatNumber(dashboardData?.totalObras),
    change: `${formatKnownNumber(dashboardData?.obrasNuevasMes)} este mes`,
    icon: 'library_books',
    details: [
      [formatKnownNumber(dashboardData?.obrasDigitales), 'Digitales'],
      [formatKnownNumber(dashboardData?.obrasFisicas), 'Físicos'],
    ],
  },
  {
    label: 'Obras Activas',
    value: formatKnownNumber(dashboardData?.obrasActivas),
    change: 'en catálogo',
    icon: 'auto_stories',
    details: [
      [formatKnownNumber(dashboardData?.obrasDisponibles), 'Con ejemplares'],
      [formatKnownNumber(dashboardData?.totalObras), 'En total'],
    ],
  },
  {
    label: 'Lectores Registrados',
    value: formatKnownNumber(dashboardData?.lectoresRegistrados),
    change: `+${formatKnownNumber(dashboardData?.lectoresNuevosSemana)} sem`,
    icon: 'badge',
    details: [[formatText(dashboardData?.tipoLectores), '']],
  },
  {
    label: 'Préstamos Activos',
    value: formatKnownNumber(dashboardData?.prestamosActivos),
    change: 'sin devolución registrada',
    icon: 'event_upcoming',
    centered: true,
  },
].map((metric) => (
  <div key={metric.label} className={`bg-surface-container-lowest p-5 rounded-xl border border-[#4A3324]/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] hover:shadow-md transition-shadow relative overflow-hidden group ${metric.centered ? 'text-center' : ''}`}>
    <div className={`flex items-center ${metric.centered ? 'justify-center' : 'justify-between'} gap-2 text-on-surface-variant mb-3`}>
      <span className="font-label-md text-label-md uppercase tracking-wider">{metric.label}</span>
      <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-secondary-fixed transition-colors">
        <span className="material-symbols-outlined text-xl">{metric.icon}</span>
      </span>
    </div>
    <div className={`flex items-baseline gap-2.5 ${metric.centered ? 'justify-center' : ''}`}>
      <span className="font-headline-lg text-headline-lg font-bold text-primary">{metric.value}</span>
      <span className="font-label-md text-label-md text-secondary font-medium">{metric.change}</span>
    </div>
    {metric.details && (
      <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
        {metric.details.map(([value, label], index) => (
          <span key={label || index}>{label ? <><strong className="text-primary font-semibold">{value}</strong> {label}</> : value}</span>
        ))}
      </div>
    )}
  </div>
))}
</section>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

<section className="lg:col-span-8 flex flex-col gap-space-md">
<div className="bg-surface-container-lowest rounded-xl border border-[#4A3324]/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] p-5 md:p-6">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
<div>
<h2 className="font-headline-md text-headline-md text-primary font-semibold">Monitoreo de Préstamos Activos y Circulación Reciente</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Control directo sobre ejemplares físicos en sala y licencias de préstamo digital.</p>
</div>

<div className="inline-flex p-1 bg-surface-container rounded-lg border border-outline-variant/40 shrink-0">
<button className="px-3 py-1 text-xs font-label-md rounded font-semibold bg-surface-container-lowest text-primary shadow-sm">Todos</button>
<button className="px-3 py-1 text-xs font-label-md rounded text-on-surface-variant hover:text-primary transition-colors">Digitales</button>
<button className="px-3 py-1 text-xs font-label-md rounded text-on-surface-variant hover:text-primary transition-colors">Físicos</button>
<button className="px-3 py-1 text-xs font-label-md rounded text-on-surface-variant hover:text-primary transition-colors">Con Atraso</button>
</div>
</div>

<div className="overflow-x-auto mt-2">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
<th className="py-3 px-3 font-semibold">Obra &amp; Autor</th>
<th className="py-3 px-3 font-semibold">Lector / Carné ID</th>
<th className="py-3 px-3 font-semibold">Tipo</th>
<th className="py-3 px-3 font-semibold">Límite</th>
<th className="py-3 px-3 font-semibold">Estado</th>
<th className="py-3 px-3 text-right font-semibold">Acciones</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">{loans.length === 0 ? (
  <tr>
    <td className="py-6 px-3 text-center text-on-surface-variant" colSpan={6}>No hay registros existentes en este momento</td>
  </tr>
) : loans.map((loan, index) => {
  const statusClass = loanStatusStyles[loan?.estadoTipo] ?? 'bg-surface-container text-on-surface-variant';

  return (
    <tr key={loan?.id ?? index} className="hover:bg-surface-container/30 transition-colors">
      <td className="py-3.5 px-3">
        <div className="font-headline-sm text-base text-primary font-medium">{formatText(loan?.titulo)}</div>
        <div className="text-xs text-on-surface-variant font-body-md italic">{formatText(loan?.autor)} • {formatText(loan?.edicion)}</div>
      </td>
      <td className="py-3.5 px-3">
        <div className="font-label-md text-label-md text-primary font-semibold">{formatText(loan?.lector)}</div>
        <div className="text-xs text-on-surface-variant">ID: {formatText(loan?.lectorId)}</div>
      </td>
      <td className="py-3.5 px-3">
        <span className="inline-flex items-center gap-1 text-xs font-label-md px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
          <span className="material-symbols-outlined text-[13px]">{loan?.tipoIcono || 'menu_book'}</span> {formatText(loan?.tipo)}
        </span>
      </td>
      <td className="py-3.5 px-3 text-xs text-on-surface font-label-md">
        <div>{formatText(loan?.fechaLimite)}</div>
        <div className="text-[11px] text-on-surface-variant">{formatText(loan?.detalleLimite)}</div>
      </td>
      <td className="py-3.5 px-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-label-md font-semibold ${statusClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {formatText(loan?.estado)}
        </span>
      </td>
      <td className="py-3.5 px-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Ver ficha bibliográfica" type="button">
            <span className="material-symbols-outlined text-lg">quick_reference_all</span>
          </button>
          <button className="p-1 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors" title="Notificar al lector" type="button">
            <span className="material-symbols-outlined text-lg">mail</span>
          </button>
        </div>
      </td>
    </tr>
  );
})}</tbody>
</table>
</div>

<div className="pt-4 mt-2 border-t border-outline-variant/30 flex items-center justify-between">
<span className="text-xs text-on-surface-variant font-body-sm">Mostrando {loans.length} de {formatNumber(dashboardData?.prestamosActivos)} préstamos activos registrados</span>
<a className="inline-flex items-center gap-1 text-xs font-label-md font-semibold text-secondary hover:text-on-secondary-container hover:underline transition-colors" href="#">
<span className="">Ver listado completo de Control de Préstamos Activos</span>
<span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
</a>
</div>
</div>


</section>

<aside className="lg:col-span-4 flex flex-col gap-space-md">

<div className="bg-surface-container-lowest p-5 rounded-xl border border-[#4A3324]/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-3 flex items-center justify-between">
<span className="">Acciones</span>
<span className="material-symbols-outlined text-lg text-secondary" data-icon="bolt">bolt</span>
</h3>
<div className="space-y-2.5">

<a className="group flex items-start gap-3 p-3 rounded-lg border border-outline-variant/30 hover:border-secondary hover:bg-surface-container-low transition-all" href="#catalogo-admin" onClick={(event) => { event.preventDefault(); onNavigateToCatalog(); }}>
<span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-surface shrink-0 transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="inventory_2">inventory_2</span>
</span>
<div className="flex-1">
<div className="font-label-md text-label-md font-semibold text-primary group-hover:text-secondary transition-colors">Gestión de Catálogo Completo</div>
<div className="text-xs text-on-surface-variant">Ir al inventario general con opción de editar, retirar o reubicar.</div>
</div>
<span className="material-symbols-outlined text-sm text-outline-variant group-hover:text-secondary group-hover:translate-x-0.5 transition-all mt-1" data-icon="chevron_right">chevron_right</span>
</a>




</div>
</div>

<div className="bg-surface-container-lowest p-5 rounded-xl border border-[#4A3324]/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<div className="flex items-center justify-between mb-3">
<h3 className="font-headline-sm text-headline-sm text-primary font-semibold">Recursos del catálogo</h3>
<span className="inline-flex items-center gap-1 text-[11px] font-label-sm text-[#285933] bg-[#EAF2EC] px-2 py-0.5 rounded-full font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#285933]"></span> Datos de biblioteca
            </span>
</div>

<div className="mb-4">
<div className="flex justify-between text-xs font-label-md mb-1.5">
<span className="text-on-surface-variant">Títulos marcados EPUB/PDF</span>
<span className="font-semibold text-primary">{formatNumber(dashboardData?.obrasDigitales)} / {formatNumber(dashboardData?.totalObras)}</span>
</div>

<div className="w-full h-2.5 bg-[#EFE8DC] rounded-full overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{ width: `${digitalCoverage}%` }}></div>
</div>
<div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-1.5">
<span>{digitalCoverage}% del catálogo · {formatNumber(dashboardData?.archivosDigitalesCargados)} archivos cargados</span>
<span>{formatNumber(dashboardData?.ejemplaresFisicos)} ejemplares físicos</span>

</div>
</div>


</div>


</aside>
</div>
</main>

<footer className="w-full bg-surface-container border-t border-outline-variant/40 mt-space-xl">
<div className="w-full py-space-xl px-gutter md:px-margin max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-space-lg">
<div className="flex items-center gap-3">
<span className="w-7 h-7 rounded-lg bg-primary-container text-surface flex items-center justify-center">
<span className="material-symbols-outlined text-base text-secondary-container" data-icon="menu_book">menu_book</span>
</span>
<span className="font-headline-sm text-headline-sm font-semibold text-primary">Biblioteca</span>
<span className="text-xs text-on-surface-variant font-body-sm">| © {new Date().getFullYear()} Biblioteca Digital. Todos los derechos reservados.</span>
</div>
<nav className="flex flex-wrap items-center gap-6 font-label-md text-label-md text-on-surface-variant">




</nav>
</div>
</footer>







    </div>
  );
}
