import { useEffect, useState } from 'react';

const formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('es-MX') : '0';
};

const formatText = (value) =>
  value === null || value === undefined || value === '' ? 'Dato no disponible' : value;

const formatDate = (value) => {
  if (!value) return 'Dato no disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Dato no disponible' : date.toLocaleDateString('es-MX');
};

const bookStatusStyles = {
  disponible: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  prestamo: 'bg-amber-50 text-amber-900 border-amber-200',
  restauracion: 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-outline-variant/60',
};

export default function CatalogoAdmin({
  onNavigateToDashboard,
  onNavigateToNewBook,
  catalogData = {},
  libros = [],
  onDeleteBook,
  onEditBook,
}) {
  const catalogBooks = Array.isArray(libros) ? libros : [];
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [deleteBook, setDeleteBook] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const allBooksSelected = catalogBooks.length > 0 && selectedBooks.length === catalogBooks.length;
  const administrator = catalogData?.administrador ?? {};
  const totalPages = Math.max(0, Number(catalogData?.totalPaginas) || 0);
  const currentPage = Math.max(1, Number(catalogData?.paginaActual) || 1);
  const visiblePages = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1);

  useEffect(() => {
    if (!deleteBook) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [deleteBook]);

  const handleBookSelection = (bookIndex, isSelected) => {
    setSelectedBooks((currentSelection) =>
      isSelected
        ? [...currentSelection, bookIndex]
        : currentSelection.filter((index) => index !== bookIndex),
    );
  };

  const handleSelectAll = (isSelected) => {
    setSelectedBooks(isSelected ? catalogBooks.map((_, index) => index) : []);
  };

  const openDeleteModal = (book) => {
    setDeleteError('');
    setDeleteBook(book);
  };
  const closeDeleteModal = () => {
    setDeleteError('');
    setDeleteBook(null);
  };

  const confirmDeletionAction = async () => {
    if (!deleteBook?.id || !onDeleteBook) return;

    setDeleting(true);
    setDeleteError('');
    try {
      await onDeleteBook(deleteBook.id);
      closeDeleteModal();
    } catch (error) {
      setDeleteError(error.message || 'No se pudo eliminar el libro.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-primary">

<header className="w-full sticky top-0 z-40 bg-surface-container-low dark:bg-surface-dim shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] border-b border-outline-variant/30 dark:border-outline/20">
<div className="w-full px-gutter md:px-margin max-w-[1360px] mx-auto flex items-center justify-between h-20">

<div className="flex items-center gap-space-lg">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-primary-container text-surface flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-secondary-container" data-icon="auto_stories">auto_stories</span>
</div>
<div>
<span className="text-headline-md font-headline-md font-semibold text-primary dark:text-inverse-primary tracking-tight block leading-none">Biblioteca</span>

</div>
</div>
<div className="hidden lg:flex items-center gap-space-xs bg-surface-container px-3 py-1 rounded-full border border-outline-variant/40">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
<span className="text-label-sm font-label-sm text-on-surface-variant">Panel de Administración&nbsp;</span>
</div>

<div className="hidden xl:flex items-center relative">
<span className="material-symbols-outlined text-outline absolute left-3 pointer-events-none text-body-md" data-icon="search">search</span>
<input className="pl-9 pr-12 py-1.5 bg-surface text-on-background text-label-md font-label-md rounded border border-outline-variant/60 focus:border-secondary focus:ring-1 focus:ring-secondary w-64 placeholder:text-outline/70 transition-all" placeholder="Búsqueda por título" type="text" />

</div>
</div>

<nav className="hidden md:flex items-center gap-6">
<a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors pb-1 text-label-lg font-label-lg" href="#dashboard" onClick={(event) => { event.preventDefault(); onNavigateToDashboard(); }}>
          Dashboard
        </a>
<a className="border-b-2 border-secondary text-primary dark:text-inverse-primary pb-1 font-semibold text-label-lg font-label-lg" href="#catalogo">
          Catálogo
        </a>

</nav>

<div className="flex items-center gap-space-md">

<button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-label-md font-label-md rounded border border-outline-variant/40 transition-colors">
<span className="material-symbols-outlined text-[18px]" data-icon="visibility">visibility</span>
<span className="">Ver como Lector</span>
</button>


<div className="h-6 w-px bg-outline-variant/50"></div>

<div className="flex items-center gap-space-sm pl-1">
<div className="relative w-9 h-9 rounded-full overflow-hidden border border-outline-variant/80 ring-1 ring-primary/5">
<img alt="Foto de perfil del lector" className="w-full h-full object-cover" data-alt="A portrait of an esteemed mature Latin American chief conservator in a library archive, wearing round horn-rimmed glasses and a fine wool waistcoat against a backdrop of antique mahogany book stacks. Soft warm natural library lighting illuminates the scene in tones of warm walnut, parchment ivory, and aged paper, giving a tranquil scholarly ambiance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh-mgW2SP-tLEN5EcLNjtrL00WBNTuGFcLbj9wJrs3_MIhajSLmE36SGXI0BPBV5dY2kBrpcAHPlvfR4ICKVD8EnAmpnxsxVSUd2Vm1rrKpvcbGZp-yzQiL6Ls2Qmyl4MjiPi5n4flCB68YhnmL3Hcke9ONEL6ME-MM9gAKXV3EA5E0LZm1ZsJ4XYVEINT0D-LavHqytnyPKe5X2DMRAAp1hWVf3MgHufeB40653uj" />
</div>
<div className="hidden lg:block text-left">
<p className="text-label-md font-label-md text-primary leading-tight font-bold">{formatText(administrator.nombre)}</p>
<p className="text-label-sm font-label-sm text-on-surface-variant truncate max-w-[140px]">{formatText(administrator.email)}</p>
</div>
<button className="text-outline hover:text-primary p-1 rounded transition-colors" title="Cerrar Sesión">
<span className="material-symbols-outlined text-body-md" data-icon="logout">logout</span>
</button>
</div>
</div>
</div>
</header>

<main className="flex-grow w-full max-w-[1360px] mx-auto px-gutter md:px-margin py-8 flex flex-col gap-8">

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-outline-variant/30">
<div className="max-w-3xl">

<nav className="flex items-center gap-1.5 text-label-md font-label-md text-on-surface-variant mb-2">
<span className="">Administración</span>
<span className="material-symbols-outlined text-[16px] text-outline" data-icon="chevron_right">chevron_right</span>


<span className="text-primary font-semibold">Inventario General del Acervo</span>
</nav>
<h1 className="text-headline-lg md:text-display-lg font-headline-lg md:font-display-lg text-primary tracking-tight leading-tight">
          Gestión de catálogo</h1>

</div>

<div className="flex flex-wrap items-center gap-space-sm">
<button className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface text-primary border border-outline-variant/70 hover:bg-surface-container rounded font-label-md text-label-md shadow-sm transition-colors">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="file_upload">file_upload</span>
<span className="">Importar MARC21 / CSV</span>
</button>
<button className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface text-primary border border-outline-variant/70 hover:bg-surface-container rounded font-label-md text-label-md shadow-sm transition-colors">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon="download">download</span>
<span className="">Exportar (PDF/XML)</span>
</button>

<button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-surface hover:bg-[#4A3324] rounded font-label-md text-label-md shadow-sm transition-colors ring-offset-2 focus:ring-2 focus:ring-secondary" onClick={onNavigateToNewBook} type="button">
<span className="material-symbols-outlined text-[20px] text-secondary-container" data-icon="add">add</span>
<span className="">Agregar Nuevo Libro</span>
</button>
</div>
</div>



<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
{[
  { label: 'Total Obras Catalogadas', value: catalogData?.totalObras, unit: 'títulos', change: `+${formatNumber(catalogData?.obrasNuevasMes)} ingresados este mes`, icon: 'library_books', changeIcon: 'trending_up' },
  { label: 'Obras en formato digital', value: catalogData?.obrasDigitales, unit: 'títulos', change: `${formatNumber(catalogData?.archivosDigitalesCargados)} archivos cargados`, icon: 'devices', changeIcon: 'verified' },
  { label: 'Obras con ejemplares físicos', value: catalogData?.obrasFisicas, unit: 'títulos', change: 'Con copias en inventario', icon: 'inventory_2', changeIcon: 'shelves' },
  { label: 'Ejemplares físicos registrados', value: catalogData?.ejemplaresFisicos, unit: 'copias', change: 'En inventario', icon: 'inventory_2', changeIcon: 'shelves' },
  { label: 'Obras activas', value: catalogData?.obrasActivas, unit: 'títulos', change: 'Disponibles en el catálogo', icon: 'auto_stories', changeIcon: 'verified' },
].map((metric) => (
  <div key={metric.label} className="p-5 bg-surface rounded border border-outline-variant/30 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] flex items-center justify-between">
    <div>
      <p className="text-label-md font-label-md text-on-surface-variant">{metric.label}</p>
      <p className="text-headline-md font-headline-md text-primary mt-1 font-semibold">
        {formatNumber(metric.value)} <span className="text-body-sm font-body-sm text-outline font-normal">{metric.unit}</span>
      </p>
      <div className="flex items-center gap-1 mt-1 text-label-sm font-label-sm text-secondary">
        <span className="material-symbols-outlined text-[14px]">{metric.changeIcon}</span>
        <span>{metric.change}</span>
      </div>
    </div>
    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
      <span className="material-symbols-outlined text-headline-sm">{metric.icon}</span>
    </div>
  </div>
))}
</section>
<section className="bg-surface p-4 rounded border border-outline-variant/40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] flex flex-col gap-4">
<div className="flex flex-wrap items-center justify-between gap-4">
  <div className="flex flex-wrap items-center gap-3 flex-grow">
    
    <div className="relative flex-grow max-w-md min-w-[240px]">
      <span className="material-symbols-outlined text-outline absolute left-3 top-2.5 text-[20px]" data-icon="search">search</span>
      <input className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest text-on-background text-body-sm font-body-sm rounded border border-outline-variant/60 focus:border-secondary focus:ring-1 focus:ring-secondary placeholder:text-outline/70 transition-all" placeholder="Buscar por título" type="text" />
    </div>
    
    <div className="min-w-[170px]">
      <select className="w-full py-2 px-3 bg-surface-container-lowest text-on-background text-label-md font-label-md rounded border border-outline-variant/60 focus:border-secondary focus:ring-1 focus:ring-secondary">
        <option>Todos los formatos</option>
        <option>Digital (ePub / PDF)</option>
        <option>Físico en Sala</option>
        <option>Manuscrito Raro / Códice</option>
      </select>
    </div>
  </div>
  
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <input className="rounded border-outline text-secondary focus:ring-secondary h-4 w-4 bg-surface" id="selectAll" type="checkbox" checked={allBooksSelected} onChange={(event) => handleSelectAll(event.target.checked)} />
      <label className="text-label-md font-label-md text-on-surface-variant cursor-pointer" htmlFor="selectAll">Seleccionar todos</label>
    </div>
    <div className="h-4 w-px bg-outline-variant/40"></div>
    <button className={selectedBooks.length > 0 ? 'inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-primary hover:bg-secondary-container hover:text-white cursor-pointer text-label-md font-label-md rounded border border-outline-variant/60 transition-colors' : 'inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-outline cursor-not-allowed text-label-md font-label-md rounded border border-outline-variant/40 transition-colors'} disabled={selectedBooks.length === 0} id="batchActionBtn">
      <span className="material-symbols-outlined text-[16px]" data-icon="bolt">bolt</span>
      <span className="">Acciones por lote</span>
      <span className="material-symbols-outlined text-[16px]" data-icon="arrow_drop_down">arrow_drop_down</span>
    </button>
    <span className="text-label-sm font-label-sm text-outline">{selectedBooks.length} seleccionados</span>
  </div>
</div>

<div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
  <div className="text-label-md font-label-md text-on-surface-variant">
    <span className="">Mostrando <strong className="text-primary font-bold">{formatNumber(catalogBooks.length)}</strong> de {formatNumber(catalogData?.totalObras ?? catalogBooks.length)} obras catalogadas</span>
  </div>
  <div className="flex items-center gap-1.5 text-label-md font-label-md">
    <span className="text-on-surface-variant">Ordenar por:</span>
    <select className="py-1 px-2.5 bg-surface-container-lowest text-primary font-semibold rounded border border-outline-variant/50 focus:border-secondary text-label-md">
      <option>Más recientes (Ingreso)</option>
      <option>Título (A-Z)</option>
      <option>Autor (A-Z)</option>
      <option>Signatura Topográfica</option>
    </select>
  </div>
</div></section>

<section className="bg-surface rounded border border-outline-variant/40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] overflow-hidden">
<div className="overflow-x-auto custom-scroll">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high/60 border-b border-outline-variant/50 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"><th className="py-3 px-4 w-10 text-center" scope="col">
<span className="sr-only">Seleccionar</span>
</th>
<th className="py-3 px-4 min-w-[280px]" scope="col">Obra &amp; Autor</th>
<th className="py-3 px-4 min-w-[170px]" scope="col">Formato &amp; Copias</th>
<th className="py-3 px-4 min-w-[130px]" scope="col">Estado</th>
<th className="py-3 px-4 min-w-[110px]" scope="col">Ingreso</th>
<th className="py-3 px-4 min-w-[160px] text-right" scope="col">Acciones</th></tr>
</thead>
<tbody className="divide-y divide-outline-variant/20 text-body-sm font-body-sm">
{catalogBooks.length === 0 ? (
  <tr>
    <td className="py-6 px-4 text-center text-on-surface-variant" colSpan={6}>No hay registros existentes en este momento</td>
  </tr>
) : catalogBooks.map((book, index) => {
  const statusClass = bookStatusStyles[book?.estadoTipo] ?? 'bg-surface-container text-on-surface-variant border-outline-variant/40';

  return (
    <tr key={book?.id ?? book?.signatura ?? index} className="hover:bg-surface-container-low/80 transition-colors group">
      <td className="py-3.5 px-4 text-center">
        <input className="rounded border-outline text-secondary focus:ring-secondary h-4 w-4 bg-surface" type="checkbox" checked={selectedBooks.includes(index)} onChange={(event) => handleBookSelection(index, event.target.checked)} />
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 bg-surface-container-high rounded flex-shrink-0 overflow-hidden spine-shadow border border-outline-variant/60 shadow-sm">
            {book?.portadaUrl ? <img alt={formatText(book?.titulo)} className="w-full h-full object-cover" src={book.portadaUrl} /> : <div className="w-full h-full flex items-center justify-center text-outline"><span className="material-symbols-outlined">menu_book</span></div>}
          </div>
          <div>
            <h3 className="font-headline-sm text-body-md text-primary font-semibold group-hover:text-secondary transition-colors">{formatText(book?.titulo)}</h3>
            <p className="text-label-md font-label-md text-on-surface-variant">{formatText(book?.autor)}</p>
            <p className="text-[11px] font-label-sm text-outline">{formatText(book?.edicion)}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-label-md font-label-md text-primary">
            <span className="material-symbols-outlined text-[16px]">{book?.formatoIcono || 'menu_book'}</span>
            <span>{formatText(book?.formato)}</span>
          </div>
          <span className="text-label-sm font-label-sm text-outline">{formatNumber(book?.copiasTotales)} ejemplares registrados ({formatText(book?.ubicacion)})</span>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm border ${statusClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {formatText(book?.estado)}
        </span>
      </td>
      <td className="py-3.5 px-4 text-on-surface-variant text-label-md font-label-md">{formatDate(book?.fechaIngreso)}</td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded" onClick={() => onEditBook?.(book)} title="Editar Ficha Bibliográfica" type="button">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded" title="Ver Ficha / Descargar MARC21" type="button">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button className="p-1.5 text-error hover:bg-error-container/40 rounded transition-colors" onClick={() => openDeleteModal(book)} title="Eliminar Obra del Catálogo" type="button">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
})}</tbody>
</table>
</div>

<div className="p-4 bg-surface-container-low/70 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant">
<span className="">Mostrar por página:</span>
<select className="py-1 px-2 bg-surface text-primary rounded border border-outline-variant/60 font-medium">
<option>8 obras</option>
<option>15 obras</option>
<option>30 obras</option>
<option>50 obras</option>
</select>
<span className="text-outline pl-2">Página {formatNumber(currentPage)} de {formatNumber(totalPages)}</span>
</div>

<nav aria-label="Navegación de páginas" className="flex items-center gap-1">
<button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded disabled:opacity-40" disabled={currentPage <= 1} title="Página Anterior" type="button">
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_left">chevron_left</span>
</button>
{visiblePages.map((page) => (
  <button key={page} className={`w-8 h-8 rounded font-label-md text-label-md ${page === currentPage ? 'bg-primary-container text-surface font-semibold' : 'hover:bg-surface-container text-on-surface-variant'}`} type="button">{formatNumber(page)}</button>
))}
{totalPages > 4 && <span className="px-1 text-outline font-label-md">...</span>}
{totalPages > 3 && (
  <button className="w-8 h-8 rounded hover:bg-surface-container text-on-surface-variant font-label-md text-label-md" type="button">{formatNumber(totalPages)}</button>
)}
<button className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded disabled:opacity-40" disabled={totalPages === 0 || currentPage >= totalPages} title="Página Siguiente" type="button">
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_right">chevron_right</span>
</button>
</nav>
</div>
</section>
</main>

<div aria-labelledby="modalTitle" aria-modal="true" className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm ${deleteBook ? '' : 'hidden'}`} id="deleteModal" role="dialog">
<div className="bg-surface rounded-xl border border-outline-variant/60 max-w-lg w-full p-6 shadow-[0_16px_40px_-8px_rgba(31,21,13,0.24)] catalog-modal-enter">
<div className="flex items-start gap-4">
<div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[26px]" data-icon="warning">warning</span>
</div>
<div>
<h3 className="text-headline-sm font-headline-sm text-primary font-semibold" id="modalTitle">
            Confirmar eliminación de obra
          </h3>
<p className="text-body-sm font-body-sm text-on-surface-variant mt-1.5">
            Está a punto de eliminar <strong className="text-primary font-bold">{deleteBook?.titulo}</strong> del catálogo general de la institución.
          </p>
</div>
</div>

<div className="mt-4 p-3.5 bg-surface-container-high rounded border border-outline-variant/60 text-label-md font-label-md text-on-surface-variant flex flex-col gap-2">
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5" data-icon="info">info</span>
<p className="">
            Al procesar la eliminación, sus metadatos MARC21 se archivarán en el registro histórico y cualquier reserva o préstamo pendiente quedará anulado de inmediato.
          </p>
</div>
<div className="mt-2 pt-2 border-t border-outline-variant/30 flex items-center gap-2">
<input defaultChecked className="rounded border-outline text-secondary focus:ring-secondary h-4 w-4 bg-surface" id="archiveExpurgo" type="checkbox" />
<label className="text-label-sm font-label-sm text-primary cursor-pointer font-bold" htmlFor="archiveExpurgo">
            Registrar como "Baja por Expurgo Reglamentario" (conservar ficha histórica).
          </label>
</div>
</div>

{deleteError && <p role="alert" className="mt-4 text-sm text-error">{deleteError}</p>}

<div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
<button className="w-full sm:w-auto px-4 py-2 border border-outline-variant/80 text-primary hover:bg-surface-container rounded font-label-md text-label-md transition-colors" onClick={closeDeleteModal}>
          Cancelar
        </button>
<button className="w-full sm:w-auto px-4 py-2 bg-error text-on-error hover:bg-[#8f1313] rounded font-label-md text-label-md shadow-sm transition-colors flex items-center justify-center gap-2" disabled={deleting} onClick={confirmDeletionAction}>
<span className="material-symbols-outlined text-[18px]" data-icon="delete_forever">delete_forever</span>
<span className="">{deleting ? 'Eliminando...' : 'Confirmar Eliminación Definitiva'}</span>
</button>
</div>
</div>
</div>

<footer className="w-full bg-surface-container dark:bg-inverse-surface border-t border-outline-variant/40 dark:border-outline/30 mt-12">
<div className="w-full py-space-xl px-gutter md:px-margin max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-space-lg">

<div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
<span className="text-headline-sm font-headline-sm font-semibold text-primary dark:text-inverse-primary">
          Biblioteca
        </span>
<span className="hidden sm:inline text-outline">•</span>
<p className="text-body-sm font-body-sm text-on-surface-variant dark:text-surface-variant">
          © {new Date().getFullYear()} Biblioteca Digital. Todos los derechos reservados.
        </p>
</div>

<ul className="flex flex-wrap items-center justify-center gap-6 text-label-md font-label-md text-on-surface-variant dark:text-surface-variant">
<li className="">

</li>
<li className="">

</li>
<li className="">

</li>
<li className="">

</li>
</ul>
</div>
</footer>











    </div>
  );
}