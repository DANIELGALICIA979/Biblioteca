import { supabaseAdmin } from '../../data/config/supabaseClient.js';
import { addBusinessDays, processLoanTransitions } from '../../business/services/prestamoService.js';

const isUuid = (value) => typeof value === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const requireServiceRole = (res) => {
  if (supabaseAdmin) return true;
  res.status(503).json({ error: 'El servidor no está configurado para gestionar préstamos.' });
  return false;
};

const sendDatabaseError = (res, message, error) => {
  console.error(`${message}:`, error);
  return res.status(500).json({ error: message });
};

const synchronizeLoanStates = async (res) => {
  try {
    const { error } = await processLoanTransitions();
    if (!error) return true;
    sendDatabaseError(res, 'No se pudieron actualizar los estados de los préstamos', error);
    return false;
  } catch (error) {
    sendDatabaseError(res, 'No se pudieron actualizar los estados de los préstamos', error);
    return false;
  }
};

const getLoanRelations = `
  id, usuario_id, libro_id, tipo_prestamo, ejemplar_id, fecha_solicitud,
  fecha_prestamo, fecha_limite, fecha_limite_retiro, fecha_devolucion, estado,
  libros!prestamos_libro_id_fkey(id, titulo, autor, portada_url, formato),
  ejemplares!prestamos_ejemplar_libro_fkey(id, codigo_inventario, ubicacion)
`;

export const obtenerEjemplaresDisponibles = async (req, res) => {
  const { libroId } = req.query;
  if (!isUuid(libroId)) {
    return res.status(400).json({ error: 'El identificador del libro no es válido.' });
  }
  if (!requireServiceRole(res)) return;
  if (!await synchronizeLoanStates(res)) return;

  try {
    const { data: book, error: bookError } = await supabaseAdmin
      .from('libros')
      .select('id, activo')
      .eq('id', libroId)
      .maybeSingle();
    if (bookError) return sendDatabaseError(res, 'No se pudo consultar el libro', bookError);
    if (!book || !book.activo) return res.status(404).json({ error: 'No se encontró el libro activo solicitado.' });

    const { data: copies, error: copiesError } = await supabaseAdmin
      .from('ejemplares')
      .select('id, codigo_inventario, ubicacion, estado_conservacion')
      .eq('libro_id', libroId)
      .order('codigo_inventario');
    if (copiesError) return sendDatabaseError(res, 'No se pudieron consultar los ejemplares', copiesError);

    const { data: occupiedCopies, error: loansError } = await supabaseAdmin
      .from('prestamos')
      .select('ejemplar_id')
      .eq('libro_id', libroId)
      .eq('tipo_prestamo', 'fisico')
      .in('estado', ['pendiente', 'activo', 'vencido']);
    if (loansError) return sendDatabaseError(res, 'No se pudo consultar la disponibilidad de ejemplares', loansError);

    const occupiedIds = new Set((occupiedCopies ?? []).map((loan) => loan.ejemplar_id));
    return res.status(200).json((copies ?? []).filter((copy) => !occupiedIds.has(copy.id)));
  } catch (error) {
    return sendDatabaseError(res, 'No se pudieron consultar los ejemplares disponibles', error);
  }
};

export const solicitarPrestamo = async (req, res) => {
  const { libroId, tipoPrestamo, ejemplarId } = req.body ?? {};
  if (!isUuid(libroId) || !['digital', 'fisico'].includes(tipoPrestamo)) {
    return res.status(400).json({ error: 'El libro o el tipo de préstamo no son válidos.' });
  }
  if (ejemplarId !== undefined && ejemplarId !== null) {
    return res.status(400).json({ error: 'El ejemplar físico se asigna automáticamente; no envíes ejemplarId.' });
  }
  if (!requireServiceRole(res)) return;
  if (!await synchronizeLoanStates(res)) return;

  try {
    const { data: book, error: bookError } = await supabaseAdmin
      .from('libros')
      .select('id, activo, archivo_path, formato')
      .eq('id', libroId)
      .maybeSingle();
    if (bookError) return sendDatabaseError(res, 'No se pudo validar el libro', bookError);
    if (!book || !book.activo) return res.status(404).json({ error: 'No se encontró el libro activo solicitado.' });

    const now = new Date();
    let loan;
    if (tipoPrestamo === 'digital') {
      if (!book.archivo_path || !['pdf', 'epub'].includes(String(book.formato ?? '').toLowerCase())) {
        return res.status(409).json({ error: 'El libro no tiene un archivo PDF o EPUB disponible para préstamo digital.' });
      }

      const { data, error } = await supabaseAdmin
        .from('prestamos')
        .insert({
          usuario_id: req.readerUser.id,
          libro_id: libroId,
          tipo_prestamo: 'digital',
          ejemplar_id: null,
          fecha_solicitud: now.toISOString(),
          fecha_prestamo: now.toISOString(),
          fecha_limite: null,
          fecha_limite_retiro: null,
          estado: 'activo',
        })
        .select(getLoanRelations)
        .single();
      if (error) return sendDatabaseError(res, 'No se pudo registrar el préstamo digital', error);
      loan = data;
    } else {
      const { data: copies, error: copyError } = await supabaseAdmin
        .from('ejemplares')
        .select('id')
        .eq('libro_id', libroId)
        .order('created_at');
      if (copyError) return sendDatabaseError(res, 'No se pudo validar el ejemplar seleccionado', copyError);
      if (!copies?.length) return res.status(409).json({ error: 'Este libro no tiene ejemplares físicos registrados.' });

      const { data: occupiedCopies, error: loansError } = await supabaseAdmin
        .from('prestamos')
        .select('ejemplar_id')
        .eq('libro_id', libroId)
        .eq('tipo_prestamo', 'fisico')
        .in('estado', ['pendiente', 'activo', 'vencido']);
      if (loansError) return sendDatabaseError(res, 'No se pudo consultar la disponibilidad de ejemplares', loansError);

      const occupiedIds = new Set((occupiedCopies ?? []).map((loan) => loan.ejemplar_id));
      const candidateIds = copies.filter((copy) => !occupiedIds.has(copy.id)).map((copy) => copy.id);
      if (!candidateIds.length) return res.status(409).json({ error: 'No hay ejemplares físicos disponibles para este libro.' });

      let allocationError;
      for (const candidateId of candidateIds) {
        const { data, error } = await supabaseAdmin
          .from('prestamos')
          .insert({
            usuario_id: req.readerUser.id,
            libro_id: libroId,
            tipo_prestamo: 'fisico',
            ejemplar_id: candidateId,
            fecha_solicitud: now.toISOString(),
            fecha_prestamo: null,
            fecha_limite: null,
            fecha_limite_retiro: addBusinessDays(now, 3).toISOString(),
            estado: 'pendiente',
          })
          .select(getLoanRelations)
          .single();
        if (!error) {
          loan = data;
          break;
        }
        if (error.code !== '23505') {
          allocationError = error;
          break;
        }
      }
      if (allocationError) return sendDatabaseError(res, 'No se pudo registrar la solicitud física', allocationError);
      if (!loan) return res.status(409).json({ error: 'Los ejemplares se acaban de reservar. Inténtalo nuevamente.' });
    }

    return res.status(201).json({
      message: tipoPrestamo === 'digital'
        ? 'El préstamo digital está activo y disponible en Mis Préstamos.'
        : 'Solicitud registrada. El ejemplar queda reservado hasta que el administrador confirme la entrega.',
      prestamo: loan,
    });
  } catch (error) {
    return sendDatabaseError(res, 'No se pudo registrar el préstamo', error);
  }
};

export const obtenerMisPrestamos = async (req, res) => {
  if (!requireServiceRole(res)) return;
  if (!await synchronizeLoanStates(res)) return;

  try {
    const { data, error } = await supabaseAdmin
      .from('prestamos')
      .select(getLoanRelations)
      .eq('usuario_id', req.readerUser.id)
      .order('fecha_solicitud', { ascending: false });
    if (error) return sendDatabaseError(res, 'No se pudieron consultar tus préstamos', error);
    return res.status(200).json(data ?? []);
  } catch (error) {
    return sendDatabaseError(res, 'No se pudieron consultar tus préstamos', error);
  }
};

export const devolverPrestamoLector = async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'El identificador del préstamo no es válido.' });
  if (!requireServiceRole(res)) return;

  try {
    const { data: loan, error: loanError } = await supabaseAdmin
      .from('prestamos')
      .select('id, tipo_prestamo, estado')
      .eq('id', req.params.id)
      .eq('usuario_id', req.readerUser.id)
      .maybeSingle();
    if (loanError) return sendDatabaseError(res, 'No se pudo consultar el préstamo', loanError);
    if (!loan) return res.status(404).json({ error: 'No se encontró el préstamo solicitado.' });
    if (loan.tipo_prestamo !== 'digital') {
      return res.status(409).json({ error: 'La devolución de ejemplares físicos debe registrarla el administrador al recibirlos.' });
    }
    if (loan.estado !== 'activo') {
      return res.status(409).json({ error: 'Solo se puede revocar un préstamo digital activo.' });
    }

    const { data, error } = await supabaseAdmin
      .from('prestamos')
      .update({ estado: 'devuelto', fecha_devolucion: new Date().toISOString() })
      .eq('id', loan.id)
      .eq('estado', 'activo')
      .select('id, estado, fecha_devolucion')
      .maybeSingle();
    if (error) return sendDatabaseError(res, 'No se pudo revocar el acceso digital', error);
    if (!data) return res.status(409).json({ error: 'El préstamo ya no está activo.' });
    return res.status(200).json({ message: 'El acceso digital fue revocado.', prestamo: data });
  } catch (error) {
    return sendDatabaseError(res, 'No se pudo revocar el acceso digital', error);
  }
};

export const obtenerArchivoPrestamo = async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'El identificador del préstamo no es válido.' });
  if (!requireServiceRole(res)) return;

  try {
    const { data: loan, error: loanError } = await supabaseAdmin
      .from('prestamos')
      .select('id, tipo_prestamo, estado, libros!prestamos_libro_id_fkey(archivo_path)')
      .eq('id', req.params.id)
      .eq('usuario_id', req.readerUser.id)
      .maybeSingle();
    if (loanError) return sendDatabaseError(res, 'No se pudo consultar el préstamo digital', loanError);
    if (!loan) return res.status(404).json({ error: 'No se encontró el préstamo solicitado.' });
    if (loan.tipo_prestamo !== 'digital' || loan.estado !== 'activo') {
      return res.status(403).json({ error: 'El acceso está disponible solo para préstamos digitales activos.' });
    }

    const [bucket, ...pathParts] = String(loan.libros?.archivo_path ?? '').split('/');
    const path = pathParts.join('/');
    if (bucket !== 'Archivos' || !path || pathParts.some((part) => part === '..')) {
      return res.status(409).json({ error: 'La ruta del archivo digital no está configurada correctamente.' });
    }

    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 300);
    if (error) return sendDatabaseError(res, 'No se pudo preparar el acceso al archivo digital', error);
    return res.status(200).json({ signedUrl: data.signedUrl, expiresIn: 300 });
  } catch (error) {
    return sendDatabaseError(res, 'No se pudo preparar el acceso al archivo digital', error);
  }
};

export const obtenerPrestamosAdmin = async (_req, res) => {
  if (!requireServiceRole(res)) return;
  if (!await synchronizeLoanStates(res)) return;

  try {
    const { data, error } = await supabaseAdmin
      .from('prestamos')
      .select(`${getLoanRelations}, perfiles!prestamos_usuario_id_fkey(id, nombre_usuario)`)
      .order('fecha_solicitud', { ascending: false });
    if (error) return sendDatabaseError(res, 'No se pudieron consultar los préstamos administrativos', error);
    return res.status(200).json(data ?? []);
  } catch (error) {
    return sendDatabaseError(res, 'No se pudieron consultar los préstamos administrativos', error);
  }
};

export const confirmarEntregaPrestamo = async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'El identificador del préstamo no es válido.' });
  if (!requireServiceRole(res)) return;
  if (!await synchronizeLoanStates(res)) return;

  const now = new Date();
  try {
    const { data, error } = await supabaseAdmin
      .from('prestamos')
      .update({
        estado: 'activo',
        fecha_prestamo: now.toISOString(),
        fecha_limite: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', req.params.id)
      .eq('tipo_prestamo', 'fisico')
      .eq('estado', 'pendiente')
      .gt('fecha_limite_retiro', now.toISOString())
      .select(getLoanRelations)
      .maybeSingle();
    if (error) return sendDatabaseError(res, 'No se pudo confirmar la entrega del ejemplar', error);
    if (!data) return res.status(409).json({ error: 'La solicitud ya no está pendiente o su plazo de recogida venció.' });
    return res.status(200).json({ message: 'Entrega registrada; comenzó el plazo de 15 días.', prestamo: data });
  } catch (error) {
    return sendDatabaseError(res, 'No se pudo confirmar la entrega del ejemplar', error);
  }
};

export const cancelarSolicitudPrestamo = async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'El identificador del préstamo no es válido.' });
  if (!requireServiceRole(res)) return;

  try {
    const { data, error } = await supabaseAdmin
      .from('prestamos')
      .update({ estado: 'cancelado' })
      .eq('id', req.params.id)
      .eq('tipo_prestamo', 'fisico')
      .eq('estado', 'pendiente')
      .select('id, estado, ejemplar_id')
      .maybeSingle();
    if (error) return sendDatabaseError(res, 'No se pudo cancelar la solicitud', error);
    if (!data) return res.status(409).json({ error: 'Solo se pueden cancelar solicitudes físicas pendientes.' });
    return res.status(200).json({ message: 'Solicitud cancelada y ejemplar liberado.', prestamo: data });
  } catch (error) {
    return sendDatabaseError(res, 'No se pudo cancelar la solicitud', error);
  }
};

export const devolverPrestamoAdmin = async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'El identificador del préstamo no es válido.' });
  if (!requireServiceRole(res)) return;

  try {
    const { data, error } = await supabaseAdmin
      .from('prestamos')
      .update({ estado: 'devuelto', fecha_devolucion: new Date().toISOString() })
      .eq('id', req.params.id)
      .in('estado', ['activo', 'vencido'])
      .select(getLoanRelations)
      .maybeSingle();
    if (error) return sendDatabaseError(res, 'No se pudo registrar la devolución', error);
    if (!data) return res.status(409).json({ error: 'Solo se pueden devolver préstamos activos o vencidos.' });
    return res.status(200).json({ message: 'Préstamo devuelto y acceso o ejemplar liberado.', prestamo: data });
  } catch (error) {
    return sendDatabaseError(res, 'No se pudo registrar la devolución', error);
  }
};
