import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '../../data/config/supabaseClient.js';

const writableBookFields = new Set([
  'titulo',
  'autor',
  'subtitulo',
  'descripcion',
  'genero_id',
  'editorial',
  'lugar_publicacion',
  'anio_publicacion',
  'edicion',
  'isbn',
  'idioma_original',
  'idiomas_traduccion',
  'portada_url',
  'archivo_path',
  'formato',
  'licencia',
  'total_ejemplares',
  'activo',
]);
const allowedAuthorRoles = new Set([
  'coautor',
  'prologuista',
  'editor_literario',
  'traductor',
  'ilustrador',
]);
const allowedConservationStates = new Set(['excelente', 'bueno', 'regular', 'restauracion']);

const getBookPayload = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'El cuerpo de la solicitud debe ser un objeto JSON.' };
  }

  const fields = Object.keys(body);
  const unknownFields = fields.filter((field) => !writableBookFields.has(field));
  if (unknownFields.length > 0) {
    return { error: `Campos no permitidos: ${unknownFields.join(', ')}.` };
  }

  if (fields.length === 0) {
    return { error: 'Debe proporcionar al menos un campo del libro.' };
  }

  for (const field of [
    'titulo',
    'autor',
    'subtitulo',
    'descripcion',
    'editorial',
    'lugar_publicacion',
    'edicion',
    'isbn',
    'idioma_original',
    'portada_url',
    'archivo_path',
    'formato',
    'licencia',
  ]) {
    if (Object.hasOwn(body, field) && body[field] !== null && typeof body[field] !== 'string') {
      return { error: `El campo "${field}" debe ser texto.` };
    }
  }

  for (const field of ['titulo', 'autor']) {
    if (Object.hasOwn(body, field) && !body[field]?.trim()) {
      return { error: `El campo "${field}" no puede estar vacío.` };
    }
  }

  if (
    Object.hasOwn(body, 'total_ejemplares')
    && (!Number.isInteger(body.total_ejemplares) || body.total_ejemplares < 0)
  ) {
    return { error: 'El total de ejemplares debe ser un entero igual o mayor que cero.' };
  }

  if (
    Object.hasOwn(body, 'anio_publicacion')
    && body.anio_publicacion !== null
    && (!Number.isInteger(body.anio_publicacion) || body.anio_publicacion < 0 || body.anio_publicacion > 9999)
  ) {
    return { error: 'El año de publicación debe ser un año válido.' };
  }

  if (
    Object.hasOwn(body, 'idiomas_traduccion')
    && (!Array.isArray(body.idiomas_traduccion)
      || body.idiomas_traduccion.some((language) => typeof language !== 'string'))
  ) {
    return { error: 'Los idiomas de traducción deben enviarse como una lista de textos.' };
  }

  if (Object.hasOwn(body, 'formato') && body.formato !== null && !['epub', 'pdf'].includes(body.formato)) {
    return { error: 'El formato debe ser EPUB o PDF.' };
  }

  if (
    Object.hasOwn(body, 'licencia')
    && !['dominio_publico', 'permiso_distribucion', 'pendiente_revision'].includes(body.licencia)
  ) {
    return { error: 'La licencia seleccionada no es válida.' };
  }

  if (Object.hasOwn(body, 'activo') && typeof body.activo !== 'boolean') {
    return { error: 'El campo "activo" debe ser booleano.' };
  }

  return { payload: body };
};

const sendDatabaseError = (res, context, error) => {
  console.error(`${context}:`, error);
  return res.status(500).json({ error: 'No se pudo completar la operación en el catálogo.' });
};

const requireServiceRoleKey = (res) => {
  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Las operaciones administrativas requieren SUPABASE_SERVICE_ROLE_KEY.' });
    return false;
  }
  return true;
};

export const crearLibro = async (req, res) => {
  const { autores, ejemplares, ...bookFields } = req.body ?? {};
  const { payload, error: validationError } = getBookPayload(bookFields);
  if (validationError) return res.status(400).json({ error: validationError });

  if (!payload.titulo?.trim() || !payload.autor?.trim() || !payload.editorial?.trim()) {
    return res.status(400).json({ error: 'El título, el autor principal y la editorial son obligatorios.' });
  }
  if (!Number.isInteger(payload.anio_publicacion)) {
    return res.status(400).json({ error: 'El año de publicación es obligatorio y debe ser numérico.' });
  }
  if (!Array.isArray(autores)) {
    return res.status(400).json({ error: 'La lista de autores no tiene un formato válido.' });
  }
  if (!Array.isArray(ejemplares)) {
    return res.status(400).json({ error: 'La lista de ejemplares no tiene un formato válido.' });
  }
  if (ejemplares.length > 500) {
    return res.status(400).json({ error: 'No se pueden registrar más de 500 ejemplares en una sola operación.' });
  }
  if (autores.some((author) =>
    !author
    || typeof author.nombre !== 'string'
    || (author.nombre.trim() && !allowedAuthorRoles.has(author.responsabilidad)),
  )) {
    return res.status(400).json({ error: 'La lista contiene un colaborador o una responsabilidad no válida.' });
  }
  if (ejemplares.some((copy) =>
    !copy
    || (copy.ubicacion !== null && copy.ubicacion !== undefined && typeof copy.ubicacion !== 'string')
    || (copy.estado_conservacion && !allowedConservationStates.has(copy.estado_conservacion)),
  )) {
    return res.status(400).json({ error: 'La lista contiene datos de ejemplar no válidos.' });
  }
  if (!requireServiceRoleKey(res)) return;

  try {
    const { data, error } = await supabaseAdmin
      .from('libros')
      .insert({ ...payload, total_ejemplares: 0 })
      .select()
      .single();

    if (error) return sendDatabaseError(res, 'Error al crear el libro', error);

    const cleanupBook = async () => {
      const { error: cleanupError } = await supabaseAdmin.from('libros').delete().eq('id', data.id);
      if (cleanupError) console.error('No se pudo revertir el libro parcialmente creado:', cleanupError);
    };

    const authors = autores
      .filter((author) => author && typeof author.nombre === 'string' && author.nombre.trim())
      .map((author, index) => ({
        libro_id: data.id,
        nombre: author.nombre.trim(),
        responsabilidad: author.responsabilidad,
        orden: index + 1,
      }));
    if (authors.length > 0) {
      const { error: authorsError } = await supabaseAdmin.from('libro_autores').insert(authors);
      if (authorsError) {
        await cleanupBook();
        return sendDatabaseError(res, 'Error al guardar los colaboradores del libro', authorsError);
      }
    }

    const copies = ejemplares;
    if (copies.length > 0) {
      const { error: copiesError } = await supabaseAdmin.from('ejemplares').insert(
        copies.map((copy) => ({
          libro_id: data.id,
          ubicacion: typeof copy.ubicacion === 'string' && copy.ubicacion.trim()
            ? copy.ubicacion.trim()
            : null,
          estado_conservacion: copy.estado_conservacion || null,
        })),
      );
      if (copiesError) {
        await cleanupBook();
        return sendDatabaseError(res, 'Error al guardar el inventario físico', copiesError);
      }
    }

    return res.status(201).json({ ...data, total_ejemplares: copies.length });
  } catch (error) {
    return sendDatabaseError(res, 'Error al crear el libro', error);
  }
};

const storageBuckets = {
  portada: 'Portadas',
  archivo: 'Archivos',
};

const allowedUploads = {
  portada: new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
  ]),
  archivo: new Map([
    ['application/epub+zip', 'epub'],
    ['application/zip', null],
    ['application/pdf', 'pdf'],
    ['application/octet-stream', null],
  ]),
};

export const crearUrlSubida = async (req, res) => {
  const { tipo, nombre, contentType } = req.body ?? {};
  const bucket = storageBuckets[tipo];
  const extensions = allowedUploads[tipo];
  const extension = typeof nombre === 'string' ? nombre.split('.').pop()?.toLowerCase() : '';

  if (!bucket || !extensions || typeof contentType !== 'string') {
    return res.status(400).json({ error: 'Tipo de archivo o contenido no válido.' });
  }

  const allowedExtension = [...extensions.values()].filter(Boolean).includes(extension);
  const allowedMime = extensions.has(contentType);
  const isJpeg = tipo === 'portada' && contentType === 'image/jpeg' && extension === 'jpeg';
  if ((!allowedExtension && !isJpeg) || !allowedMime) {
    return res.status(400).json({
      error: tipo === 'archivo'
        ? 'Solo se permiten archivos EPUB y PDF.'
        : 'La portada debe ser JPG, PNG o WebP.',
    });
  }
  if (
    contentType !== 'application/octet-stream'
    && !isJpeg
    && extensions.get(contentType) !== extension
  ) {
    return res.status(400).json({ error: 'La extensión del archivo no corresponde a su formato.' });
  }
  if (!requireServiceRoleKey(res)) return;

  try {
    const path = `${randomUUID()}.${extension}`;
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
    if (error) {
      console.error(`Error al generar URL de subida para ${bucket}:`, error);
      return res.status(500).json({ error: `No se pudo preparar la subida al bucket ${bucket}.` });
    }

    return res.status(200).json({
      bucket,
      path: data.path,
      signedUrl: data.signedUrl,
      publicUrl: tipo === 'portada'
        ? supabaseAdmin.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
        : null,
    });
  } catch (error) {
    console.error('Error al generar la URL de subida:', error);
    return res.status(500).json({ error: 'No se pudo preparar la subida del archivo.' });
  }
};

export const eliminarArchivoStorage = async (req, res) => {
  const { bucket, path } = req.body ?? {};
  if (!Object.values(storageBuckets).includes(bucket) || typeof path !== 'string' || path.includes('..')) {
    return res.status(400).json({ error: 'La ruta del archivo no es válida.' });
  }
  if (!requireServiceRoleKey(res)) return;

  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) {
      console.error(`Error al limpiar un archivo de ${bucket}:`, error);
      return res.status(500).json({ error: 'No se pudo eliminar el archivo de almacenamiento.' });
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar un archivo de almacenamiento:', error);
    return res.status(500).json({ error: 'No se pudo eliminar el archivo de almacenamiento.' });
  }
};

export const obtenerGenerosAdmin = async (_req, res) => {
  if (!requireServiceRoleKey(res)) return;

  try {
    const { data, error } = await supabaseAdmin.from('generos').select('id, nombre').order('nombre');
    if (error) return sendDatabaseError(res, 'Error al consultar los géneros', error);
    return res.status(200).json(data ?? []);
  } catch (error) {
    return sendDatabaseError(res, 'Error al consultar los géneros', error);
  }
};

export const actualizarLibro = async (req, res) => {
  const { autores, ejemplares, ...bookFields } = req.body ?? {};
  const { payload, error: validationError } = getBookPayload(bookFields);
  if (validationError) return res.status(400).json({ error: validationError });
  if (autores !== undefined && (!Array.isArray(autores) || autores.some((author) =>
    !author
    || typeof author.nombre !== 'string'
    || (author.nombre.trim() && !allowedAuthorRoles.has(author.responsabilidad)),
  ))) {
    return res.status(400).json({ error: 'La lista contiene un colaborador o una responsabilidad no válida.' });
  }
  if (ejemplares !== undefined && (
    !Array.isArray(ejemplares)
    || ejemplares.length > 500
    || ejemplares.some((copy) =>
      !copy
      || (copy.ubicacion !== null && copy.ubicacion !== undefined && typeof copy.ubicacion !== 'string')
      || (copy.estado_conservacion && !allowedConservationStates.has(copy.estado_conservacion)),
    )
  )) {
    return res.status(400).json({ error: 'La lista contiene datos de ejemplar no válidos.' });
  }
  if (!requireServiceRoleKey(res)) return;

  try {
    if (autores !== undefined) {
      const { data: currentAuthors, error: authorsReadError } = await supabaseAdmin
        .from('libro_autores')
        .select('id')
        .eq('libro_id', req.params.id);
      if (authorsReadError) return sendDatabaseError(res, 'Error al consultar colaboradores', authorsReadError);

      const currentAuthorIds = new Set((currentAuthors ?? []).map((author) => author.id));
      const authorsWithInvalidIds = autores.some((author) => author.id && !currentAuthorIds.has(author.id));
      if (authorsWithInvalidIds) {
        return res.status(400).json({ error: 'La lista incluye colaboradores que no pertenecen a este libro.' });
      }

      const authorsToSave = autores
        .filter((author) => author.nombre.trim())
        .map((author, index) => ({
          ...(author.id ? { id: author.id } : {}),
          libro_id: req.params.id,
          nombre: author.nombre.trim(),
          responsabilidad: author.responsabilidad,
          orden: index + 1,
        }));
      const authorIdsToKeep = authorsToSave.filter((author) => author.id).map((author) => author.id);
      const authorIdsToDelete = [...currentAuthorIds].filter((id) => !authorIdsToKeep.includes(id));

      if (authorsToSave.length > 0) {
        const { error: saveAuthorsError } = await supabaseAdmin
          .from('libro_autores')
          .upsert(authorsToSave, { onConflict: 'id' });
        if (saveAuthorsError) return sendDatabaseError(res, 'Error al guardar colaboradores', saveAuthorsError);
      }
      if (authorIdsToDelete.length > 0) {
        const { error: deleteAuthorsError } = await supabaseAdmin
          .from('libro_autores')
          .delete()
          .eq('libro_id', req.params.id)
          .in('id', authorIdsToDelete);
        if (deleteAuthorsError) return sendDatabaseError(res, 'Error al actualizar colaboradores', deleteAuthorsError);
      }
    }

    if (ejemplares !== undefined) {
      const { data: currentCopies, error: copiesReadError } = await supabaseAdmin
        .from('ejemplares')
        .select('id')
        .eq('libro_id', req.params.id);
      if (copiesReadError) return sendDatabaseError(res, 'Error al consultar ejemplares', copiesReadError);

      const copiesToKeep = (currentCopies ?? []).slice(0, ejemplares.length);
      const copiesToDelete = (currentCopies ?? []).slice(ejemplares.length).map((copy) => copy.id);
      if (copiesToKeep.length > 0) {
        const copy = ejemplares[0];
        const { error: updateCopiesError } = await supabaseAdmin
          .from('ejemplares')
          .update({
            ubicacion: typeof copy.ubicacion === 'string' && copy.ubicacion.trim()
              ? copy.ubicacion.trim()
              : null,
            estado_conservacion: copy.estado_conservacion || null,
          })
          .in('id', copiesToKeep.map((item) => item.id));
        if (updateCopiesError) return sendDatabaseError(res, 'Error al actualizar ejemplares', updateCopiesError);
      }
      if (copiesToDelete.length > 0) {
        const { error: deleteCopiesError } = await supabaseAdmin
          .from('ejemplares')
          .delete()
          .eq('libro_id', req.params.id)
          .in('id', copiesToDelete);
        if (deleteCopiesError) return sendDatabaseError(res, 'Error al retirar ejemplares', deleteCopiesError);
      }
      if (ejemplares.length > copiesToKeep.length) {
        const copy = ejemplares[0];
        const newCopies = Array.from({ length: ejemplares.length - copiesToKeep.length }, () => ({
          libro_id: req.params.id,
          ubicacion: typeof copy.ubicacion === 'string' && copy.ubicacion.trim()
            ? copy.ubicacion.trim()
            : null,
          estado_conservacion: copy.estado_conservacion || null,
        }));
        const { error: insertCopiesError } = await supabaseAdmin.from('ejemplares').insert(newCopies);
        if (insertCopiesError) return sendDatabaseError(res, 'Error al agregar ejemplares', insertCopiesError);
      }
      payload.total_ejemplares = ejemplares.length;
    }

    const { data, error } = await supabaseAdmin
      .from('libros')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) return sendDatabaseError(res, 'Error al actualizar el libro', error);
    if (!data) return res.status(404).json({ error: 'No se encontró el libro solicitado.' });
    return res.status(200).json(data);
  } catch (error) {
    return sendDatabaseError(res, 'Error al actualizar el libro', error);
  }
};

export const eliminarLibro = async (req, res) => {
  if (!requireServiceRoleKey(res)) return;

  try {
    const { data, error } = await supabaseAdmin
      .from('libros')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) return sendDatabaseError(res, 'Error al eliminar el libro', error);
    if (!data) return res.status(404).json({ error: 'No se encontró el libro solicitado.' });
    return res.status(200).json({ message: 'Libro eliminado correctamente.', id: data.id });
  } catch (error) {
    return sendDatabaseError(res, 'Error al eliminar el libro', error);
  }
};

export const obtenerLibrosAdmin = async (_req, res) => {
  if (!requireServiceRoleKey(res)) return;

  try {
    const { data, error } = await supabaseAdmin
      .from('libros')
      .select('*, generos(nombre), ejemplares(id, ubicacion, estado_conservacion), libro_autores(id, nombre, responsabilidad, orden)')
      .order('titulo');

    if (error) return sendDatabaseError(res, 'Error al consultar el catálogo administrativo', error);
    return res.status(200).json(data ?? []);
  } catch (error) {
    return sendDatabaseError(res, 'Error al consultar el catálogo administrativo', error);
  }
};

export const obtenerEstadisticas = async (req, res) => {
  if (!requireServiceRoleKey(res)) return;

  try {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [
      total,
      activas,
      disponibles,
      archivosDigitales,
      fisicasDigitales,
      formatoDigital,
      ejemplaresFisicos,
      obrasNuevasMes,
      lectores,
      lectoresNuevosSemana,
      prestamosActivos,
    ] = await Promise.all([
      supabaseAdmin.from('libros').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('libros').select('id', { count: 'exact', head: true }).eq('activo', true),
      supabaseAdmin.from('libros')
        .select('id, ejemplares!inner(id, ubicacion)', { count: 'exact', head: true })
        .eq('activo', true)
        .not('ejemplares.ubicacion', 'is', null),
      supabaseAdmin.from('libros')
        .select('id', { count: 'exact', head: true })
        .not('archivo_path', 'is', null),
      supabaseAdmin.from('libros')
        .select('id, formato, ejemplares!inner(id, ubicacion)')
        .not('ejemplares.ubicacion', 'is', null),
      supabaseAdmin.from('libros')
        .select('id', { count: 'exact', head: true })
        .in('formato', ['epub', 'pdf']),
      supabaseAdmin.from('ejemplares')
        .select('id', { count: 'exact', head: true })
        .not('ubicacion', 'is', null),
      supabaseAdmin.from('libros')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart),
      supabaseAdmin.from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('rol', 'lector'),
      supabaseAdmin.from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('rol', 'lector')
        .gte('created_at', weekStart),
      supabaseAdmin.from('prestamos')
        .select('id', { count: 'exact', head: true })
        .in('estado', ['activo', 'vencido']),
    ]);

    const queries = [
      total,
      activas,
      disponibles,
      archivosDigitales,
      fisicasDigitales,
      formatoDigital,
      ejemplaresFisicos,
      obrasNuevasMes,
      lectores,
      lectoresNuevosSemana,
      prestamosActivos,
    ];
    const failedQuery = queries.find(({ error }) => error);
    if (failedQuery) {
      return sendDatabaseError(res, 'Error al calcular las estadísticas del catálogo', failedQuery.error);
    }

    const totalObras = total.count ?? 0;
    const physicalDigitalTitles = new Set(
      (fisicasDigitales.data ?? [])
        .filter((book) => ['epub', 'pdf'].includes(book.formato))
        .map((book) => book.id),
    ).size;
    const obrasFisicas = fisicasDigitales.data?.length ?? 0;
    const obrasDigitales = Math.max(0, (formatoDigital.count ?? 0) - physicalDigitalTitles);
    return res.status(200).json({
      totalObras,
      obrasNuevasMes: obrasNuevasMes.count ?? 0,
      obrasDigitales,
      archivosDigitalesCargados: archivosDigitales.count ?? 0,
      obrasFisicas,
      obrasActivas: activas.count ?? 0,
      obrasDisponibles: disponibles.count ?? 0,
      ejemplaresFisicos: ejemplaresFisicos.count ?? 0,
      porcentajeObrasDigitales: totalObras > 0
        ? Math.round((obrasDigitales / totalObras) * 100)
        : 0,
      lectoresRegistrados: lectores.count ?? 0,
      lectoresNuevosSemana: lectoresNuevosSemana.count ?? 0,
      tipoLectores: 'Cuentas con rol lector',
      prestamosActivos: prestamosActivos.count ?? 0,
      administrador: {
        nombre: req.adminProfile?.nombre
          || req.adminUser?.user_metadata?.full_name
          || req.adminUser?.user_metadata?.name
          || req.adminUser?.email
          || '',
        email: req.adminProfile?.email || req.adminUser?.email || '',
      },
      ultimaActualizacion: new Date().toISOString(),
    });
  } catch (error) {
    return sendDatabaseError(res, 'Error al calcular las estadísticas del catálogo', error);
  }
};
