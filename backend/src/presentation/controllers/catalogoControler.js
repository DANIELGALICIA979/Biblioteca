import { supabase } from '../../data/config/supabaseClient.js';

const parseListParam = (value) => {
  if (!value) return [];

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeValue = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es')
  .trim();

const includesValue = (value, expectedValues) => {
  if (!value) return false;

  const values = (Array.isArray(value) ? value : String(value).split(','))
    .flatMap((item) => String(item).split(/[;,]/))
    .map(normalizeValue)
    .filter(Boolean);

  return expectedValues.some((expected) => {
    const normalizedExpected = normalizeValue(expected);
    const isDigital = normalizedExpected.includes('digital')
      || normalizedExpected.includes('epub')
      || normalizedExpected.includes('pdf');
    const isPhysical = normalizedExpected.includes('fisico')
      || normalizedExpected.includes('sala');

    return values.some((item) => {
      if (normalizedExpected === item) return true;
      if (isDigital) return item.includes('digital') || item.includes('epub') || item.includes('pdf');
      if (isPhysical) return item.includes('fisico') || item.includes('sala');
      return false;
    });
  });
};

export const obtenerCatalogo = async (req, res) => {
  const {
    busqueda = '',
    soloDigitales = 'false',
    generos = '',
    formatos = '',
    estado = 'Todos',
    ordenarPor = '',
  } = req.query;

  const generosSeleccionados = parseListParam(generos);
  const formatosSeleccionados = parseListParam(formatos);

  try {
    let consulta = supabase.from('libros').select('*, generos(id, nombre)');

    const terminoBusqueda = String(busqueda).trim();
    if (terminoBusqueda) {
      const terminoSeguro = terminoBusqueda.replace(/([%,])/g, '\\$1');
      consulta = consulta.or(
        `titulo.ilike.%${terminoSeguro}%,autor.ilike.%${terminoSeguro}%`,
      );
    }

    let generoIds = [];
    if (generosSeleccionados.length > 0) {
      const { data: generos, error: generosError } = await supabase
        .from('generos')
        .select('id, nombre');

      if (generosError) {
        return res.status(500).json({ error: generosError.message });
      }

      const nombresSeleccionados = new Set(
        generosSeleccionados.map(normalizeValue).filter(Boolean),
      );
      generoIds = (generos ?? [])
        .filter((genero) => nombresSeleccionados.has(normalizeValue(genero.nombre)))
        .map((genero) => genero.id);

      if (generoIds.length === 0) return res.status(200).json([]);
      consulta = consulta.in('genero_id', generoIds);
    }

    if (estado === 'Disponible ahora') {
      consulta = consulta.eq('activo', true).gt('total_ejemplares', 0);
    } else {
      consulta = consulta.eq('activo', true);
    }

    const { data, error } = await consulta;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    let libros = (data ?? []).map((libro) => ({
      ...libro,
      genero: libro.generos?.nombre ?? libro.genero ?? null,
    }));

    if (String(soloDigitales).toLowerCase() === 'true') {
      libros = libros.filter((libro) =>
        includesValue(libro.formato, ['digital', 'EPUB', 'PDF']),
      );
    }

    if (formatosSeleccionados.length > 0) {
      libros = libros.filter((libro) => {
        const formatoLibro = normalizeValue(libro.formato);
        const esFisico = formatoLibro.includes('fisico') || formatoLibro.includes('sala');
        const esDigital = formatoLibro.includes('digital') || formatoLibro.includes('epub') || formatoLibro.includes('pdf');

        return formatosSeleccionados.some((formatoSeleccionado) => {
          const formato = normalizeValue(formatoSeleccionado);
          if (formato.includes('fisico') || formato.includes('sala')) return esFisico;
          if (formato.includes('digital') || formato.includes('epub') || formato.includes('pdf')) return esDigital;
          return formatoLibro === formato;
        });
      });
    }

    switch (ordenarPor) {
      case 'alfabetico':
        libros.sort((a, b) => String(a.titulo ?? '').localeCompare(String(b.titulo ?? ''), 'es'));
        break;
      case 'recientes':
        libros.sort((a, b) => new Date(b.fecha_incorporacion ?? 0) - new Date(a.fecha_incorporacion ?? 0));
        break;
      case 'antiguos':
        libros.sort((a, b) => Number(a.anio_publicacion ?? 0) - Number(b.anio_publicacion ?? 0));
        break;
      case 'nuevos':
        libros.sort((a, b) => Number(b.anio_publicacion ?? 0) - Number(a.anio_publicacion ?? 0));
        break;
      case 'populares':
        libros.sort((a, b) => Number(b.numero_prestamos ?? 0) - Number(a.numero_prestamos ?? 0));
        break;
      default:
        break;
    }

    return res.status(200).json(libros);
  } catch (error) {
    console.error('Error al consultar el catálogo:', error);
    return res.status(500).json({ error: 'No se pudo consultar el catálogo.' });
  }
};
