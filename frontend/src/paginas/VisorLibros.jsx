import { Fragment, useState } from 'react';

const themes = {
  sepia: {
    canvas: 'bg-surface-container-low',
    book: 'bg-surface book-spine-shadow border-[#4A3324]/10 text-on-surface',
  },
  light: {
    canvas: 'bg-[#ECEEEF]',
    book: 'bg-white shadow-lg border-gray-200 text-gray-900',
  },
  dark: {
    canvas: 'bg-[#17120E]',
    book: 'bg-[#221A14] shadow-2xl border-[#3C2C20] text-[#E4D7CA]',
  },
};

function Icon({ children, className = '' }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function pageNumberOf(item, fallback) {
  const value = Number(item?.pagina ?? item?.page ?? item?.numero_pagina ?? item?.pagina_inicio ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

function contentParagraphs(pageEntry) {
  const content = typeof pageEntry === 'string'
    ? pageEntry
    : pageEntry?.contenido ?? pageEntry?.contenido_pagina ?? pageEntry?.content ?? pageEntry?.texto ?? pageEntry?.texto_pagina ?? pageEntry?.text ?? pageEntry?.parrafos ?? pageEntry?.paragraphs;
  const items = Array.isArray(content) ? content : typeof content === 'string' ? content.split(/\n+/) : [];
  return items
    .map((item) => typeof item === 'string' ? item : item?.texto ?? item?.text ?? item?.contenido)
    .filter((paragraph) => typeof paragraph === 'string' && paragraph.trim());
}

export default function VisorLibros({
  book,
  isPreview = false,
  previewPageLimit = 5,
  loanStatus,
  onNavigateToLoans,
}) {
  const [activeTab, setActiveTab] = useState('toc');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState('serif');
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState('sepia');
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  // TODO: cargar marcadores y notas con fetch al definir sus endpoints y actualizar estos estados.
  const chapters = Array.isArray(book?.capitulos)
    ? book.capitulos
    : Array.isArray(book?.indice_contenidos) ? book.indice_contenidos : [];
  const pages = Array.isArray(book?.paginas)
    ? book.paginas
    : Array.isArray(book?.pages) ? book.pages : [];
  const chapterPages = chapters.flatMap((chapter) => Array.isArray(chapter?.paginas) ? chapter.paginas : []);
  const allPages = [...pages, ...chapterPages];
  const title = book?.titulo || 'Título no disponible';
  const author = book?.autor || 'Autor desconocido';
  const edition = book?.editorial || book?.edicion || '';
  const numberedPageCount = Math.max(0, ...allPages.map((entry) => pageNumberOf(entry, 0)));
  const pageCount = Math.max(1, Number(book?.numero_paginas) || numberedPageCount || pages.length || chapterPages.length || 1);
  const safePreviewLimit = Math.max(1, Number(previewPageLimit) || 5);
  const navigationPageLimit = isPreview ? Math.min(pageCount, safePreviewLimit) + 1 : pageCount;
  const previewLimitReached = isPreview && page > safePreviewLimit;
  const currentChapter = chapters
    .filter((chapter) => {
      const chapterPage = Number(chapter?.pagina ?? chapter?.page ?? chapter?.pagina_inicio);
      return Number.isFinite(chapterPage) && chapterPage <= page;
    })
    .sort((left, right) => pageNumberOf(right, 1) - pageNumberOf(left, 1))[0];
  const chapterTitle = currentChapter?.titulo ?? currentChapter?.title ?? currentChapter?.nombre ?? currentChapter?.nombre_capitulo;
  const getPage = (pageNumber) => {
    const numberedPage = allPages.find((entry) => pageNumberOf(entry, -1) === pageNumber);
    if (numberedPage) return numberedPage;
    const hasPageNumbers = allPages.some((entry) => entry?.pagina !== undefined
      || entry?.page !== undefined
      || entry?.numero_pagina !== undefined
      || entry?.pagina_inicio !== undefined);
    return hasPageNumbers ? null : allPages[pageNumber - 1] ?? null;
  };
  const currentPage = getPage(page);
  const nextPage = getPage(page + 1);
  const pageSpread = [
    { entry: currentPage, pageNumber: page },
    ...(page < pageCount ? [{ entry: nextPage, pageNumber: page + 1 }] : []),
  ];
  const hasPageContent = contentParagraphs(currentPage).length > 0 || contentParagraphs(nextPage).length > 0;
  const loanDueDate = loanStatus?.fechaVencimiento ?? loanStatus?.fecha_vencimiento ?? loanStatus?.dueDate;
  const loanLabel = typeof loanStatus === 'string' ? loanStatus : loanStatus?.estado ?? 'Estado del préstamo no disponible';
  const progress = Math.min(100, Math.round((page / pageCount) * 100));
  const fontLabels = { serif: 'Editorial Serif', sans: 'Manrope Sans', mono: 'JetBrains Mono' };

  const changePage = (nextPage) => setPage(Math.max(1, Math.min(navigationPageLimit, Number(nextPage))));
  const addBookmark = () => {
    setBookmarks((current) => current.some((bookmark) => pageNumberOf(bookmark, -1) === page)
      ? current
      : [...current, { id: `${page}-${Date.now()}`, pagina: page }]);
  };
  const addNote = () => {
    setNotes((current) => [...current, { id: `draft-${Date.now()}`, pagina: page, texto: '' }]);
  };
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.error('No se pudo cambiar el modo de pantalla completa:', error);
    }
  };

  return (
    <div className="reader-app h-screen min-h-[480px] bg-surface-container-low text-on-surface antialiased flex flex-col overflow-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <header className="w-full bg-surface-container-low z-30 px-space-lg py-space-xs flex items-center justify-between min-h-16 gap-3 transition-all duration-200 ease-out border-b border-outline-variant/30">
        <div className="flex items-center gap-space-md min-w-0">
          <button type="button" onClick={onNavigateToLoans} title="Regresar a Mis Préstamos" className="inline-flex items-center gap-space-xs text-primary hover:text-secondary text-label-lg font-label-lg transition-colors py-1.5 px-2 rounded-lg hover:bg-surface-container-high/50 shrink-0">
            <Icon className="text-[18px]">arrow_back</Icon><span className="hidden sm:inline">Mis Préstamos</span>
          </button>
          <div className="h-4 w-px bg-outline-variant/40 mx-1 shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 title={title} className="text-headline-sm font-headline-sm text-primary tracking-tight truncate max-w-[180px] sm:max-w-[280px] md:max-w-md">{title}</h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant truncate -mt-1">
                {author}
                {edition && <><span className="text-outline mx-1">•</span><span className="text-label-md font-label-md text-secondary">{edition}</span></>}
            </p>
          </div>
        </div>
          {chapters.length > 0 && chapterTitle && <div className="hidden xl:flex items-center gap-space-sm bg-surface rounded-full px-space-md py-1 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] border border-outline-variant/30 shrink-0">
          <Icon className="text-secondary text-[16px]">menu_book</Icon>
            <span className="text-label-md font-label-md text-on-surface">{chapterTitle}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="text-label-md font-label-md text-secondary font-bold">{progress}%</span>
          <span className="text-body-sm font-body-sm text-on-surface-variant">Pág. {page} de {pageCount}</span>
          </div>}
        <div className="flex items-center gap-space-xs md:gap-space-sm shrink-0">
          <div className="flex items-center bg-surface rounded-lg p-0.5 border border-outline-variant/40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
            <button type="button" onClick={() => setFontSize((size) => Math.max(14, size - 2))} className="px-2 py-1 text-label-md font-label-md text-on-surface hover:text-secondary hover:bg-surface-container-high/60 rounded transition-colors" title="Reducir fuente">A<span className="text-[10px] font-bold">-</span></button>
            <span className="text-outline-variant text-[11px] px-1 select-none">|</span>
            <button type="button" onClick={() => setFontSize((size) => Math.min(26, size + 2))} className="px-2 py-1 text-label-md font-label-md text-on-surface hover:text-secondary hover:bg-surface-container-high/60 rounded transition-colors" title="Aumentar fuente">A<span className="text-[12px] font-bold">+</span></button>
          </div>
          <div className="relative">
            <button type="button" aria-expanded={fontMenuOpen} onClick={() => setFontMenuOpen((open) => !open)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface hover:bg-surface-container-high/50 text-on-surface text-label-md font-label-md rounded-lg border border-outline-variant/40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] transition-colors">
              <Icon className="text-[16px] text-on-surface-variant">format_size</Icon>
              <span className="hidden md:inline font-headline-sm text-[13px]">{fontLabels[fontFamily]}</span>
              <Icon className="text-[16px]">expand_more</Icon>
            </button>
            {fontMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-[0_8px_24px_-4px_rgba(46,31,20,0.12)] border border-outline-variant/40 p-1.5 z-50">
                {[
                  ['serif', 'Literata (Serif)', 'font-headline-sm'],
                  ['sans', 'Manrope (Sans)', 'font-label-md'],
                  ['mono', 'Monoespaciada', 'font-mono text-[12px]'],
                ].map(([value, label, style]) => (
                  <button key={value} type="button" onClick={() => { setFontFamily(value); setFontMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-label-md ${style} ${fontFamily === value ? 'text-primary' : 'text-on-surface-variant'} hover:bg-surface-container transition-colors flex items-center justify-between`}>
                    <span>{label}</span>{fontFamily === value && <Icon className="text-secondary text-[16px]">check</Icon>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center bg-surface p-1 rounded-lg border border-outline-variant/40 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)]">
            {[
              ['sepia', 'Modo Pergamino (Cálido)'],
              ['light', 'Modo Claro Puro'],
              ['dark', 'Modo Noche (Madera Oscura)'],
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setTheme(value)} title={label} aria-label={label} aria-pressed={theme === value} className={`w-6 h-6 ${value !== 'sepia' ? 'ml-1' : ''} rounded-md ${value === 'sepia' ? 'bg-[#F4EEDF]' : value === 'light' ? 'bg-white' : 'bg-[#251A13]'} ${theme === value ? 'border-2 border-secondary' : 'border border-outline-variant/40'} flex items-center justify-center transition-transform hover:scale-105`}>
                {theme === value && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Índice y Notas" title="Índice y Notas" className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 rounded-lg transition-colors border border-outline-variant/30">
            <Icon className="text-[20px]">{sidebarOpen ? 'menu_open' : 'menu'}</Icon>
          </button>
          <button type="button" onClick={toggleFullscreen} title="Pantalla completa" aria-label="Pantalla completa" className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 rounded-lg transition-colors hidden sm:block border border-outline-variant/30">
            <Icon className="text-[20px]">fullscreen</Icon>
          </button>
        </div>
      </header>

      <div className="relative flex-1 flex overflow-hidden w-full">
        <aside className={`w-80 md:w-96 bg-surface-container-low border-r border-outline-variant/30 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-20 ${sidebarOpen ? '' : '-ml-80 md:-ml-96'}`}>
          <div className="p-space-md border-b border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-2"><Icon className="text-secondary text-[20px]">library_books</Icon><h2 className="text-headline-sm font-headline-sm text-primary">Navegación</h2></div>
              <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Cerrar índice" className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-high"><Icon className="text-[18px]">close</Icon></button>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-surface-variant/40 p-1 rounded-lg">
              {[
                ['toc', 'Índice'],
                ['bookmarks', `Marcadores (${bookmarks.length})`],
                ['notes', `Notas (${notes.length})`],
              ].map(([tab, label]) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`py-1 px-2 text-label-md font-label-md rounded text-center ${activeTab === tab ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-space-md space-y-space-md">
            {activeTab === 'toc' && (
              <div className="space-y-1">
                <div className="pb-2"><span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Estructura de la obra</span></div>
                {chapters.length > 0 ? chapters.map((chapter, index) => {
                  const chapterPage = pageNumberOf(chapter, index + 1);
                  const chapterName = chapter?.titulo ?? chapter?.title ?? chapter?.nombre ?? 'Capítulo sin título';
                  const numeral = chapter?.numero_romano ?? chapter?.numeral ?? chapter?.numero ?? '';
                  const isCurrentChapter = chapter === currentChapter;
                  return isCurrentChapter ? (
                    <div key={chapter?.id ?? `${chapterName}-${index}`} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high border-l-4 border-secondary shadow-sm">
                      <div className="flex items-start gap-2.5"><span className="text-label-sm font-label-sm text-secondary font-bold mt-0.5">{numeral}</span><div><span className="text-body-md font-body-md font-semibold text-primary block">{chapterName}</span><span className="text-label-sm font-label-sm text-secondary">Leyendo ahora</span></div></div>
                      <span className="text-label-md font-label-md text-primary font-semibold">Pág. {chapterPage}</span>
                    </div>
                  ) : (
                    <button key={chapter?.id ?? `${chapterName}-${index}`} type="button" onClick={() => changePage(chapterPage)} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container transition-colors group text-left">
                      <span className="flex items-start gap-2.5"><span className="text-label-sm font-label-sm text-outline-variant mt-0.5">{numeral}</span><span className="text-body-md font-body-md text-on-surface group-hover:text-primary">{chapterName}</span></span>
                      <span className="text-label-md font-label-md text-outline-variant shrink-0">Pág. {chapterPage}</span>
                    </button>
                  );
                }) : <p className="rounded-lg bg-surface p-3 text-body-sm font-body-sm text-on-surface-variant">Índice no disponible.</p>}
              </div>
            )}
            {activeTab === 'bookmarks' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1"><span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Marcadores ({bookmarks.length})</span><button type="button" onClick={addBookmark} className="text-label-sm font-label-sm text-secondary hover:underline">+ Añadir marcador</button></div>
                {bookmarks.length > 0 ? bookmarks.map((bookmark, index) => (
                  <div key={bookmark?.id ?? `${pageNumberOf(bookmark, index + 1)}-${index}`} className="p-3 bg-surface rounded-xl border border-outline-variant/30 shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] space-y-1">
                    <div className="flex items-center justify-between"><span className="text-label-sm font-label-sm text-secondary font-bold">Página {pageNumberOf(bookmark, index + 1)}</span><span className="text-label-sm font-label-sm text-outline-variant">{bookmark?.fecha ?? bookmark?.created_at ?? ''}</span></div>
                    {(bookmark?.texto ?? bookmark?.cita ?? bookmark?.contenido) && <p className="text-body-sm font-body-sm text-on-surface line-clamp-2">{bookmark.texto ?? bookmark.cita ?? bookmark.contenido}</p>}
                  </div>
                )) : <p className="rounded-lg bg-surface p-3 text-body-sm font-body-sm text-on-surface-variant">Aún no tienes marcadores guardados.</p>}
              </div>
            )}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1"><span className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Notas y Citas ({notes.length})</span><button type="button" onClick={addNote} className="text-label-sm font-label-sm text-secondary hover:underline">+ Nueva nota</button></div>
                {notes.length > 0 ? notes.map((note, index) => (
                  <div key={note?.id ?? `${pageNumberOf(note, index + 1)}-${index}`} className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-2">
                    <div className="flex items-center justify-between"><span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed">{note?.tipo ?? note?.titulo ?? 'Nota'}</span><span className="text-label-sm font-label-sm text-outline-variant">Pág. {pageNumberOf(note, index + 1)}</span></div>
                    {(note?.cita || note?.quote) && <blockquote className="text-body-sm font-body-sm italic border-l-2 border-secondary pl-2 text-primary">{note.cita ?? note.quote}</blockquote>}
                    <p className="text-body-sm font-body-sm text-on-surface">{note?.texto ?? note?.contenido ?? note?.content ?? 'Nota sin contenido.'}</p>
                  </div>
                )) : <p className="rounded-lg bg-surface p-3 text-body-sm font-body-sm text-on-surface-variant">Aún no tienes notas de lectura.</p>}
              </div>
            )}
          </div>
          <div className="border-t border-outline-variant/30 bg-surface/50 p-4">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><Icon>{isPreview ? 'visibility' : 'menu_book'}</Icon></div><div><p className="text-label-md font-label-md text-primary">{isPreview ? 'Vista Previa' : loanLabel}</p><p className="text-body-sm font-body-sm text-outline">{isPreview ? 'Acceso de lectura limitado' : loanDueDate ? `Vence: ${loanDueDate}` : loanLabel}</p></div></div>
          </div>
        </aside>

        <main className={`flex-1 overflow-y-auto flex items-center justify-center p-4 md:p-8 lg:p-12 transition-colors duration-300 ${themes[theme].canvas}`}>
          {previewLimitReached ? (
            <div role="status" className={`w-full max-w-2xl rounded-xl border p-8 text-center ${themes[theme].book}`}>
              <Icon className="text-4xl text-secondary">lock</Icon>
              <h2 className="mt-3 text-headline-md font-headline-md font-semibold">Fin de la vista previa</h2>
              <p className="mt-2 text-body-md">Has llegado al límite de páginas disponibles para esta vista previa.</p>
            </div>
          ) : !hasPageContent ? (
            <div role="status" className={`w-full max-w-2xl rounded-xl border p-8 text-center ${themes[theme].book}`}>
              <Icon className="text-4xl text-secondary">menu_book</Icon>
              <h2 className="mt-3 text-headline-md font-headline-md font-semibold">Contenido de lectura no disponible</h2>
              <p className="mt-2 text-body-md">Aún no se ha cargado el contenido de estas páginas.</p>
            </div>
          ) : (
            <div className={`relative w-full max-w-[1200px] min-h-[640px] rounded-xl border transition-all duration-300 flex flex-col md:flex-row overflow-hidden ${themes[theme].book}`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e6e2db]/40 via-[#d2c4bc]/30 to-[#e6e2db]/40" />
              {pageSpread.map(({ entry, pageNumber }, index) => {
                const paragraphs = contentParagraphs(entry);
                const pageBookmark = bookmarks.some((bookmark) => pageNumberOf(bookmark, -1) === pageNumber);
                return (
                  <Fragment key={pageNumber}>
                    {index === 1 && <div className="hidden md:block w-8 book-gutter-crease shrink-0 relative self-stretch"><div className="absolute inset-y-0 left-1/2 w-px bg-outline-variant/30 transform -translate-x-1/2" /></div>}
                    <article className="flex-1 p-6 md:p-10 lg:p-14 flex flex-col justify-between relative selection:bg-secondary/20">
                    <div className="flex justify-between items-center text-outline text-[12px] font-label-md tracking-wider border-b border-outline-variant/20 pb-3 mb-6 select-none">
                      <span className="uppercase">{index === 0 ? title : author}</span>
                      {(currentChapter?.numero_romano ?? currentChapter?.numeral ?? currentChapter?.numero) && index === 0 && <span className="font-headline-sm text-[13px] text-secondary">{currentChapter.numero_romano ?? currentChapter.numeral ?? currentChapter.numero}</span>}
                    </div>
                    <div className={`reader-text-block flex-1 text-body-lg leading-[1.85] text-justify space-y-5 ${fontFamily === 'serif' ? 'font-body-lg' : fontFamily === 'sans' ? 'font-label-md' : 'font-mono'}`} style={{ fontSize }}>
                      {paragraphs.length > 0
                        ? paragraphs.map((paragraph, paragraphIndex) => <p key={`${pageNumber}-${paragraphIndex}`} className={paragraphIndex === 0 ? 'dropcap' : ''}>{paragraph}</p>)
                        : <p className="text-center text-body-sm text-on-surface-variant">Contenido de esta página no disponible.</p>}
                    </div>
                    <div className="mt-8 pt-3 border-t border-outline-variant/15 flex justify-between items-center text-outline-variant text-label-md font-label-md select-none">
                      {pageBookmark && <span className="text-[11px] text-on-surface-variant flex items-center gap-1"><Icon className="text-[14px] text-secondary">bookmark</Icon>Marcador guardado</span>}
                      <span className="ml-auto">{pageNumber}</span>
                    </div>
                  </article>
                  </Fragment>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <footer className="w-full bg-surface-container z-30 px-space-lg py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-outline-variant/30">
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface hover:bg-surface-container-high text-primary border border-outline-variant/40 text-label-md font-label-md shadow-[0_2px_8px_-2px_rgba(46,31,20,0.05)] transition-all disabled:opacity-50"><Icon className="text-[18px]">arrow_back</Icon><span>Página anterior</span></button>
        </div>
        <div className="flex-1 max-w-2xl w-full flex items-center gap-4 px-2">
          <span className="text-label-md font-label-md text-on-surface-variant w-14 text-right select-none">Pág. {page}</span>
          <div className="relative flex-1 flex items-center"><input aria-label="Página actual" className="w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none" max={navigationPageLimit} min="1" onChange={(event) => changePage(event.target.value)} title="Arrastra para saltar de página" type="range" value={page} /></div>
          <span className="text-label-md font-label-md text-outline-variant w-14 select-none">{pageCount} págs.</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page >= navigationPageLimit} onClick={() => changePage(page + 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-[#4A3324] text-surface border border-transparent text-label-md font-label-md shadow-[0_2px_8px_-2px_rgba(46,31,20,0.12)] transition-all disabled:opacity-50"><span>Página siguiente</span><Icon className="text-[18px]">arrow_forward</Icon></button>
        </div>
      </footer>
    </div>
  );
}
