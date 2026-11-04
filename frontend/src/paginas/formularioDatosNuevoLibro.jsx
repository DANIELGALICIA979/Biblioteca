import { useState } from 'react';

const formatText = (value) =>
  value === null || value === undefined || value === '' ? 'Dato no disponible' : value;

export default function FormularioDatosNuevoLibro({
  onNavigateToDashboard,
  onNavigateToCatalog,
  metadata = {},
  digitalAsset = null,
  coverImageUrl = '',
}) {
  const [synopsis, setSynopsis] = useState('');
  const completion = Math.min(100, Math.max(0, Number(metadata?.completitudMetadatos) || 0));
  const administrator = metadata?.administrador ?? {};
  return (
    <div className="bg-background text-on-surface antialiased min-h-full flex flex-col font-body-sm selection:bg-secondary-fixed selection:text-on-secondary-fixed">

<header className="bg-surface-container-low dark:bg-surface-dim shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] border-b border-outline-variant/30 dark:border-outline/20 sticky top-0 z-40 transition-all duration-200 ease-out">
<div className="w-full px-gutter md:px-margin max-w-[1360px] mx-auto flex items-center justify-between h-20 gap-space-md">

<div className="flex items-center gap-space-md shrink-0">
<a className="flex flex-col group" href="#">
<span className="text-headline-md font-headline-md font-semibold text-primary dark:text-inverse-primary tracking-tight transition-colors">Biblioteca</span>
<span className="text-label-sm font-label-sm text-secondary tracking-widest uppercase">Panel de administración</span>
</a>
<div className="hidden xl:flex items-center gap-space-xs pl-3 border-l border-outline-variant/50">

</div>
</div>

<div className="hidden lg:flex items-center flex-1 max-w-xs relative ml-space-sm">


</div>

<nav className="hidden md:flex items-center gap-space-lg text-label-lg font-label-lg">
<a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors pb-1" href="#dashboard-admin" onClick={(event) => { event.preventDefault(); onNavigateToDashboard(); }}>Inicio</a>
<a className="border-b-2 border-secondary text-primary dark:text-inverse-primary pb-1 font-semibold" href="#catalogo-admin" onClick={(event) => { event.preventDefault(); onNavigateToCatalog(); }}>Catálogo</a>

</nav>

<div className="flex items-center gap-space-sm">




<div className="flex items-center gap-2 pl-2 border-l border-outline-variant/40">
<img alt="Foto de perfil del lector" className="w-9 h-9 rounded-full object-cover border border-outline-variant/60 shadow-sm" data-alt="A dignified portrait of an experienced archivist and scholar with refined silver spectacles, wearing an authentic dark tweed jacket and collared shirt inside a sunlit historical manuscript archive with rich walnut bookcases in the soft warm background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCir5d-c3-pW5bQ__S4DtSGlm7c9LRFOysyLnJB8430MUsA02tXIL_WlTW4vCnWEs2N5yZQptZ2SzhfVrq1ICw9M5NLL5DUXGMidMg_Ar3awClZyUhl_OyRucKkoTJ-jYtox0ExkVY2Y9tV-2AWvACaH2JcJmZsEJs-hVbPGPvtEhFOABA_G9szlR4Di-aQbBRiuRQpecPAGFin1fjnM1i3uEo2oGcuGTmyB3-_tu5o" />
<div className="hidden 2xl:flex flex-col text-left">
<span className="text-label-md font-label-md text-primary leading-tight font-semibold">{formatText(administrator.nombre)}</span>
<span className="text-label-sm font-label-sm text-outline">{formatText(administrator.cargo)}</span>
</div>
</div>
</div>
</div>
</header>

<main className="flex-1 w-full max-w-[1360px] mx-auto px-gutter-mobile md:px-margin py-space-lg md:py-space-xl">

<div className="flex flex-col gap-space-sm mb-space-lg">
<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-label-md font-label-md text-on-surface-variant">
<a className="hover:text-primary transition-colors" href="#dashboard-admin" onClick={(event) => { event.preventDefault(); onNavigateToDashboard(); }}>Administración</a>
<span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
<a className="hover:text-primary transition-colors" href="#catalogo-admin" onClick={(event) => { event.preventDefault(); onNavigateToCatalog(); }}>Gestión de Catálogo</a>
<span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
<span aria-current="page" className="text-primary font-semibold">Nuevo Registro Bibliográfico</span>
</nav>

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pt-space-xs border-b border-outline-variant/30 pb-space-lg">
<div className="max-w-3xl">

<h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">Catalogación y Registro Bibliográfico</h1>
<p className="text-body-md font-body-md text-on-surface-variant mt-1.5 max-w-[68ch]">
            Ingrese o actualice la ficha técnica, metadatos normalizados archivos digitales y control de ejemplares físicos.</p>
</div>

<div className="flex flex-wrap items-center gap-2.5 shrink-0">
<button className="px-4 py-2 text-label-lg font-label-lg text-on-surface-variant border border-outline-variant/60 rounded-lg hover:bg-surface-container-high transition-colors focus:ring-2 focus:ring-secondary/20" onClick={onNavigateToCatalog} type="button">
            Cancelar / Descartar
          </button>

<button className="inline-flex items-center gap-2 px-5 py-2 text-label-lg font-label-lg text-on-primary bg-secondary-container hover:bg-secondary text-on-secondary shadow-sm rounded-lg transition-colors focus:ring-2 focus:ring-secondary focus:ring-offset-2" type="submit">
<span className="material-symbols-outlined text-[18px]">verified</span>
            Guardar y Publicar en Catálogo
          </button>
</div>
</div>


</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

<div className="lg:col-span-8 flex flex-col gap-space-lg">

<section className="bg-surface-container-lowest rounded-xl p-space-lg border border-primary/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm mb-space-md">
<div className="flex items-center gap-2.5">
<span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">menu_book</span>
</span>
<div>
<h2 className="text-headline-sm font-headline-sm text-primary">Sección A: Datos Bibliográficos Principales</h2>

</div>
</div>
<span className="text-label-sm font-label-sm text-secondary bg-surface-container-low px-2 py-1 rounded border border-outline-variant/30">* Campos Obligatorios</span>
</div>
<div className="space-y-space-md">

<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1.5" htmlFor="book-title">
                Título de la Obra <span className="text-secondary">*</span>
</label>
<input className="w-full text-headline-sm font-headline-sm text-primary px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20 shadow-sm transition-all" id="book-title" name="book-title" placeholder="Ingrese el título canónico de la obra..." required type="text" />
</div>

<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1.5" htmlFor="book-subtitle">
                Subtítulo o Título Paralelo
              </label>
<input className="w-full text-body-md font-body-md text-on-surface px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20 shadow-sm transition-all" id="book-subtitle" name="book-subtitle" placeholder="Subtítulo adicional o traducción paralela..." type="text" />
</div>

<div>
<div className="flex items-center justify-between mb-1.5">
<label className="block text-label-md font-label-md text-on-surface font-semibold">
                  Autor(es) Principal(es) y Responsabilidades <span className="text-secondary">*</span>
</label>
<button className="inline-flex items-center gap-1 text-label-md font-label-md text-secondary hover:text-on-secondary-container transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">person_add</span>
                  + Añadir coautor o colaborador
                </button>
</div>
<div className="space-y-2">

<div className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40">
<span className="material-symbols-outlined text-outline">drag_indicator</span>
<div className="flex-1 w-full">
<input className="w-full text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant/60 rounded px-2.5 py-1.5 focus:border-secondary focus:ring-0" type="text" />
</div>
<div className="w-full sm:w-44">
<select className="w-full text-label-md font-label-md bg-surface-container-lowest border border-outline-variant/60 rounded px-2 py-1.5 text-on-surface focus:border-secondary">
<option value="">Seleccionar responsabilidad</option>
<option>Autor Principal</option>
<option>Coautor</option>
<option>Prologuista</option>
<option>Editor Literario</option>
<option>Traductor</option>
<option>Ilustrador</option>
</select>
</div>
<button className="p-1.5 text-outline hover:text-error transition-colors" title="Eliminar autor" type="button">
<span className="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>

<div className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40">
<span className="material-symbols-outlined text-outline">drag_indicator</span>
<div className="flex-1 w-full">
<input className="w-full text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant/60 rounded px-2.5 py-1.5 focus:border-secondary focus:ring-0" type="text" />
</div>
<div className="w-full sm:w-44">
<select className="w-full text-label-md font-label-md bg-surface-container-lowest border border-outline-variant/60 rounded px-2 py-1.5 text-on-surface focus:border-secondary">
<option value="">Seleccionar responsabilidad</option>
<option>Autor Principal</option>
<option>Coautor</option>
<option>Prologuista</option>
<option>Editor Literario</option>
<option>Traductor</option>
</select>
</div>
<button className="p-1.5 text-outline hover:text-error transition-colors" title="Eliminar colaborador" type="button">
<span className="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="publisher">
                  Editorial / Pie de imprenta <span className="text-secondary">*</span>
</label>
<input className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20" id="publisher" type="text" />
</div>
<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="pub-place">
                  Lugar de Publicación
                </label>
<input className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20" id="pub-place" type="text" />
</div>
<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="pub-year">
                  Año de Edición <span className="text-secondary">*</span>
</label>
<input className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20" id="pub-year" type="text" />
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="edition-col">
                  Edición / Colección
                </label>
<input className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20" id="edition-col" type="text" />
</div>
<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="isbn-number">
                  ISBN-13 / ISBN-10
                </label>
<input className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20" id="isbn-number" type="text" />
</div>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="lang-original">
                  Idioma Original
                </label>
<select className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary" id="lang-original">
<option value="">Seleccionar idioma</option>
<option>Español (spa)</option>
<option>Latín (lat)</option>
<option>Francés (fre)</option>
<option>Inglés (eng)</option>
<option>Portugués (por)</option>
<option>Alemán (ger)</option>
</select>
</div>
<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="lang-translated">
                  Idiomas de Traducción disponibles
                </label>
<input className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20" id="lang-translated" type="text" />
</div>
</div>

<div>
<div className="flex items-center justify-between mb-1.5">
<label className="block text-label-md font-label-md text-on-surface font-semibold" htmlFor="synopsis">
                  Sinopsis y Reseña&nbsp;</label>
<span className="text-label-sm font-label-sm text-outline">{synopsis.length} / 2000 caracteres</span>
</div>
<div className="border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary/20">

<div className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
<button className="p-1 hover:bg-surface-container-high rounded text-primary" title="Negrita" type="button">
<span className="material-symbols-outlined text-[16px]">format_bold</span>
</button>
<button className="p-1 hover:bg-surface-container-high rounded text-primary" title="Cursiva" type="button">
<span className="material-symbols-outlined text-[16px]">format_italic</span>
</button>
<span className="w-px h-4 bg-outline-variant/50 mx-1"></span>
<button className="p-1 hover:bg-surface-container-high rounded" title="Lista con viñetas" type="button">
<span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
</button>
<button className="p-1 hover:bg-surface-container-high rounded" title="Cita textual" type="button">
<span className="material-symbols-outlined text-[16px]">format_quote</span>
</button>
<span className="w-px h-4 bg-outline-variant/50 mx-1"></span>
<span className="text-label-sm font-label-sm text-outline px-2">Modo Curador ISBD</span>
</div>
<textarea className="w-full p-3 text-body-md font-body-md text-on-surface border-0 focus:ring-0 focus:outline-none resize-y" id="synopsis" placeholder="Redacte la síntesis analítica y anotaciones del fondo..." rows="4" value={synopsis} onChange={(event) => setSynopsis(event.target.value)} />
</div>
</div>
</div>
</section>



<section className="bg-surface-container-lowest rounded-xl p-space-lg border border-primary/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm mb-space-md">
<div className="flex items-center gap-2.5">
<span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">cloud_upload</span>
</span>
<div>
<h2 className="text-headline-sm font-headline-sm text-primary">Sección C: Repositorio Digital y Archivos Asociados</h2>
<p className="text-label-md font-label-md text-on-surface-variant">Archivos ePub, facsímiles fotográficos, capas OCR y políticas de préstamo digital.</p>
</div>
</div>

<label className="inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" />
<div className="relative w-11 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
<span className="ms-2.5 text-label-md font-label-md font-semibold text-primary">Disponible en digital</span>
</label>
</div>
<div className="space-y-space-md">

<div className="border-2 border-dashed border-outline-variant/80 hover:border-secondary rounded-xl p-space-lg bg-surface-container-low/40 text-center transition-colors">
<div className="max-w-md mx-auto flex flex-col items-center">
<span className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-secondary mb-3">
<span className="material-symbols-outlined text-[28px]">upload_file</span>
</span>
<span className="text-headline-sm font-headline-sm text-primary">Arrastre aquí el archivo digital maestro</span>
<p className="text-body-sm font-body-sm text-on-surface-variant mt-1 mb-4">
                  Formatos aceptados: <strong className="text-primary font-semibold">ePub 3.0, PDF/A-1b institucional, paquete TIFF/ZIP</strong> (Hasta 1.5 GB por volumen).
                </p>
<div className="flex items-center gap-2">
<button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm" type="button">
                    Explorar archivos del equipo
                  </button>

</div>
</div>
</div>

<div className="p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/50">
<div className="flex items-center justify-between mb-2">
<div className="flex items-center gap-3">
<span className="w-9 h-9 rounded bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">book</span>
</span>
<div>
<div className="flex items-center gap-2">
<span className="text-label-lg font-label-lg font-semibold text-primary">{digitalAsset ? formatText(digitalAsset.nombre) : 'No hay archivo digital cargado'}</span>
<span className="px-2 py-0.2 rounded text-[11px] font-mono bg-surface-container-highest text-secondary border border-outline-variant/40">{digitalAsset ? formatText(digitalAsset.formato) : '—'}</span>
</div>
<span className="text-label-sm font-label-sm text-outline">{formatText(digitalAsset?.tamano)} — Hash SHA-256: <span className="font-mono">{formatText(digitalAsset?.hash)}</span></span>
</div>
</div>
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-secondary font-semibold">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {digitalAsset ? formatText(digitalAsset.estado) : 'Sin archivo'}
                  </span>
<button className="p-1 text-outline hover:text-error transition-colors" title="Eliminar archivo digital" type="button">
<span className="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
</div>

<div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-secondary h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, Number(digitalAsset?.progreso) || 0))}%` }}></div>
</div>
</div>


</div>
</section>

<section className="bg-surface-container-lowest rounded-xl p-space-lg border border-primary/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm mb-space-md">
<div className="flex items-center gap-2.5">
<span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">shelves</span>
</span>
<div>
<h2 className="text-headline-sm font-headline-sm text-primary">Sección D: Inventario Físico y Sala de Custodia</h2>
<p className="text-label-md font-label-md text-on-surface-variant">Ubicación física en estantes, depósitos patrimoniales y estado de preservación.</p>
</div>
</div>

<label className="inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" />
<div className="relative w-11 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
<span className="ms-2.5 text-label-md font-label-md font-semibold text-primary">Registrar ejemplares físicos</span>
</label>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">

<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="physical-copies">
                Ejemplares Disponibles en Sala
              </label>
<div className="flex items-center">
<button className="px-3 py-2 bg-surface-container border border-outline-variant rounded-l-lg hover:bg-surface-container-high text-primary" type="button">-</button>
<input className="w-full text-center py-2 bg-surface-container-lowest border-y border-outline-variant focus:border-secondary focus:ring-0 text-primary font-semibold" id="physical-copies" type="number" />
<button className="px-3 py-2 bg-surface-container border border-outline-variant rounded-r-lg hover:bg-surface-container-high text-primary" type="button">+</button>
</div>
<span className="text-label-sm font-label-sm text-outline mt-1 block">Total inventariado en sede central</span>
</div>

<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="shelf-location">
                Estantería y Código de Balda
              </label>
<input className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/20" id="shelf-location" type="text" />
<span className="text-label-sm font-label-sm text-outline mt-1 block">Acceso directo para personal de sala</span>
</div>

<div>
<label className="block text-label-md font-label-md text-on-surface font-semibold mb-1" htmlFor="conservation-state">
                Estado de Conservación del Ejemplar
              </label>
<select className="w-full text-body-sm font-body-sm px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary" id="conservation-state">
<option value="">Seleccionar estado de conservación</option>
<option>Excelente (Encuadernación intacta, sin acidez)</option>
<option>Bueno (Desgaste natural de uso bibliotecario)</option>
<option>Regular (Foxing moderado / En cola de restauración)</option>
<option>En proceso de restauración en taller patrimonial</option>
</select>
<span className="text-label-sm font-label-sm text-outline mt-1 block">Diagnóstico del conservador de papel</span>
</div>
</div>
</section>
</div>

<aside className="lg:col-span-4 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest rounded-xl p-space-lg border border-primary/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-md">
<h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[20px]">photo_camera</span>
              Portada de la Obra
            </h3>
<span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">2:3 Ratio</span>
</div>

<div className="flex flex-col items-center">
<div className="relative w-48 h-72 rounded shadow-md overflow-hidden border-2 border-outline-variant/40 bg-surface-container group mb-space-md">
{coverImageUrl ? (
  <img alt="Vista previa de la portada encuadernada" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={coverImageUrl} />
) : (
  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant">
    <span className="material-symbols-outlined text-4xl">image</span>
    <span className="text-label-md font-label-md">Sin portada cargada</span>
  </div>
)}

<div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent pointer-events-none"></div>

<div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
<button className="px-3 py-1.5 bg-surface-container-lowest text-primary text-label-md font-label-md rounded shadow-sm hover:bg-surface transition-colors flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px]">crop</span>
                  Ajustar Recorte
                </button>
<button className="px-3 py-1.5 bg-error text-on-primary text-label-md font-label-md rounded shadow-sm hover:bg-error/90 transition-colors flex items-center gap-1.5" type="button">
<span className="material-symbols-outlined text-[16px]">delete</span>
                  Quitar
                </button>
</div>
</div>

<div className="w-full space-y-2">
<button className="w-full py-2 px-3 text-label-md font-label-md font-semibold text-primary bg-surface-container-low border border-outline-variant/70 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2" type="button">
<span className="material-symbols-outlined text-[18px] text-secondary">file_upload</span>
                Subir Nueva Portada (JPG, PNG, WebP)
              </button>
<div className="p-2.5 bg-surface-container-low/70 rounded border border-outline-variant/30 text-left">
<p className="text-label-sm font-label-sm text-outline leading-relaxed">
<strong className="text-on-surface-variant font-semibold">Recomendación técnica:</strong> Resolución óptima de 1200 × 1800 px en espacio sRGB. Proporción canónica 2:3 con 300 ppp para catálogos de alta fidelidad.
                </p>
</div>
</div>
</div>
</div>



<div className="bg-surface-container-lowest rounded-xl p-space-lg border border-primary/10 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
<div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-md">
<h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[20px]">assignment_turned_in</span>
              Estado del Registro
            </h3>

</div>
<div className="space-y-space-md">

<div>
<div className="flex items-center justify-between mb-1.5">
<span className="text-label-md font-label-md text-on-surface font-semibold">Completitud de Metadatos</span>
<span className="text-label-md font-label-md font-bold text-secondary">{completion}% completado</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-secondary h-2 rounded-full" style={{ width: `${completion}%` }}></div>
</div>

</div>

<div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/40 space-y-2 text-label-md font-label-md">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="">Última modificación:</span>
<span className="text-primary font-semibold">{formatText(metadata?.ultimaModificacion)}</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant">
<span className="">Responsable técnico:</span>
<span className="text-primary font-semibold">{formatText(administrator.nombre)}</span>
</div>

</div>


</div>
</div>
</aside>
</div>
</main>

<footer className="bg-surface-container dark:bg-inverse-surface border-t border-outline-variant/40 dark:border-outline/30 mt-auto transition-colors">
<div className="w-full py-space-xl px-gutter md:px-margin max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-space-lg text-body-sm font-body-sm">

<div className="flex flex-col md:flex-row items-center gap-space-md text-center md:text-left">
<span className="text-headline-sm font-headline-sm font-semibold text-primary dark:text-inverse-primary tracking-tight">
          Biblioteca
        </span>
<span className="hidden md:inline text-outline-variant">|</span>
<p className="text-on-surface-variant dark:text-surface-variant">
          © {new Date().getFullYear()} Biblioteca Digital. Todos los derechos reservados.
        </p>
</div>


</div>
</footer>







    </div>
  );
}