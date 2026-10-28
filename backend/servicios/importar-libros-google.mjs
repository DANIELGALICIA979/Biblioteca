
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
const { error: dotenvError } = dotenv.config({ path: envPath });

if (dotenvError) {
  throw new Error(`No se pudo leer el archivo de configuración ${envPath}: ${dotenvError.message}`);
}

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  GOOGLE_BOOKS_API_KEY,
  VITE_GOOGLE_BOOKS_API_KEY,
} = process.env;
const googleBooksApiKey = GOOGLE_BOOKS_API_KEY || VITE_GOOGLE_BOOKS_API_KEY;

const variablesFaltantes = [
  !SUPABASE_URL && "SUPABASE_URL",
  !SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  !googleBooksApiKey && "GOOGLE_BOOKS_API_KEY",
].filter(Boolean);

if (variablesFaltantes.length > 0) {
  throw new Error(`Faltan estas variables en ${envPath}: ${variablesFaltantes.join(", ")}`);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

const libros = [
  { titulo: "Harry Potter y la piedra filosofal", autor: "J. K. Rowling", genero: "Fantasía" },
  { titulo: "Harry Potter y la cámara secreta", autor: "J. K. Rowling", genero: "Fantasía" },
  { titulo: "El señor de los anillos", autor: "J. R. R. Tolkien", genero: "Fantasía" },
  { titulo: "El hobbit", autor: "J. R. R. Tolkien", genero: "Fantasía" },
  { titulo: "Los juegos del hambre", autor: "Suzanne Collins", genero: "Ciencia ficción" },
  { titulo: "En llamas", autor: "Suzanne Collins", genero: "Ciencia ficción" },
  { titulo: "Divergente", autor: "Veronica Roth", genero: "Ciencia ficción" },
  { titulo: "Crepúsculo", autor: "Stephenie Meyer", genero: "Romance" },
  { titulo: "Bajo la misma estrella", autor: "John Green", genero: "Romance" },
  { titulo: "Boulevard", autor: "Flor M. Salvador", genero: "Romance" },
  { titulo: "Cien años de soledad", autor: "Gabriel García Márquez", genero: "Realismo mágico" },
  { titulo: "El código Da Vinci", autor: "Dan Brown", genero: "Misterio" },
  { titulo: "Asesinato en el Orient Express", autor: "Agatha Christie", genero: "Misterio" },
  { titulo: "La chica del tren", autor: "Paula Hawkins", genero: "Suspenso" },
  { titulo: "It", autor: "Stephen King", genero: "Terror" },
  { titulo: "Dune", autor: "Frank Herbert", genero: "Ciencia ficción" },
  { titulo: "1984", autor: "George Orwell", genero: "Distopía" },
  { titulo: "Orgullo y prejuicio", autor: "Jane Austen", genero: "Romance clásico" },
  { titulo: "Hábitos atómicos", autor: "James Clear", genero: "Desarrollo personal" },
  { titulo: "El hombre en busca de sentido", autor: "Viktor E. Frankl", genero: "Psicología" },
];
function normalizar(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizarTokens(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function puntuarTexto(valor, buscado, maximo) {
  const textoNormalizado = normalizar(valor);
  const busquedaNormalizada = normalizar(buscado);

  if (!textoNormalizado || !busquedaNormalizada) return 0;
  if (textoNormalizado === busquedaNormalizada) return maximo;
  if (
    textoNormalizado.includes(busquedaNormalizada)
    || busquedaNormalizada.includes(textoNormalizado)
  ) {
    return Math.round(maximo * 0.75);
  }

  const tokensBuscados = [...new Set(normalizarTokens(buscado))];
  if (tokensBuscados.length === 0) return 0;

  const tokensTexto = new Set(normalizarTokens(valor));
  const coincidencias = tokensBuscados.filter((token) => tokensTexto.has(token)).length;
  return Math.round((coincidencias / tokensBuscados.length) * maximo * 0.65);
}

async function consultarGoogleBooks(query) {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("printType", "books");
  url.searchParams.set("key", googleBooksApiKey);

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Google Books HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  return datos.items || [];
}

function puntuarCandidato(item, libro) {
  const info = item.volumeInfo || {};
  const titulo = `${info.title || ""} ${info.subtitle || ""}`.trim();
  const autores = (info.authors || []).join(" ");
  const puntuacionTitulo = puntuarTexto(titulo, libro.titulo, 12);
  const puntuacionAutor = puntuarTexto(autores, libro.autor, 8);
  const bonificacionIdioma = info.language?.toLowerCase().startsWith("es") ? 2 : 0;
  const bonificacionDescripcion = info.description ? 1 : 0;
  const bonificacionPortada = info.imageLinks?.thumbnail ? 1 : 0;

  return {
    info,
    puntuacionTitulo,
    puntuacionAutor,
    puntos: puntuacionTitulo
      + puntuacionAutor
      + bonificacionIdioma
      + bonificacionDescripcion
      + bonificacionPortada,
  };
}

async function buscarLibro(libro) {
  const escaparTermino = (texto) => texto.replaceAll('"', '\\"');
  const titulo = escaparTermino(libro.titulo);
  const autor = escaparTermino(libro.autor);
  const consultas = [
    `intitle:"${titulo}" inauthor:"${autor}"`,
    `intitle:"${titulo}"`,
    `"${titulo}" "${autor}"`,
  ];
  const itemsPorId = new Map();

  for (const consulta of consultas) {
    const items = await consultarGoogleBooks(consulta);
    for (const item of items) {
      const clave = item.id
        || `${item.volumeInfo?.title || ""}|${(item.volumeInfo?.authors || []).join(",")}`;
      if (!itemsPorId.has(clave)) itemsPorId.set(clave, item);
    }

    const candidatoFuerte = [...itemsPorId.values()]
      .map((item) => puntuarCandidato(item, libro))
      .some(({ puntuacionTitulo, puntuacionAutor }) =>
        puntuacionTitulo >= 9 && puntuacionAutor >= 5,
      );

    if (candidatoFuerte) break;
  }

  const candidatos = [...itemsPorId.values()]
    .map((item) => puntuarCandidato(item, libro))
    .sort((a, b) => b.puntos - a.puntos);
  const mejorCandidato = candidatos[0];
  const coincideLibro = mejorCandidato
    && mejorCandidato.puntuacionTitulo >= 5
    && (mejorCandidato.puntuacionAutor >= 3 || mejorCandidato.puntuacionTitulo >= 11);

  return coincideLibro ? mejorCandidato.info : null;
}

async function importar() {
  const { data: generos, error: errorGeneros } = await supabase
    .from("generos")
    .select("id, nombre");

  if (errorGeneros) throw errorGeneros;

  const generosPorNombre = new Map(
    generos.map((g) => [normalizar(g.nombre), g.id])
  );

  const resumen = {
    importados: 0,
    duplicados: 0,
    noEncontrados: [],
    errores: [],
  };

  for (const libro of libros) {
    try {
      console.log(`Buscando: ${libro.titulo}`);

      const info = await buscarLibro(libro);

      if (!info) {
        console.log(`  No se encontró una coincidencia adecuada.`);
        resumen.noEncontrados.push(libro.titulo);
        continue;
      }

      const titulo = info.title || libro.titulo;
      const autor = (info.authors || [libro.autor]).join(", ");

      // Evitar duplicados por título y autor.
      const { data: existente, error: errorBusqueda } = await supabase
        .from("libros")
        .select("id")
        .ilike("titulo", titulo)
        .ilike("autor", autor)
        .limit(1)
        .maybeSingle();

      if (errorBusqueda) throw errorBusqueda;

      if (existente) {
        console.log(`  Ya existe: ${titulo}`);
        resumen.duplicados++;
        continue;
      }

      const generoId =
        generosPorNombre.get(normalizar(libro.genero)) ?? null;

      if (!generoId) {
        console.log(`  Aviso: no existe el género "${libro.genero}".`);
      }

      const portada =
        info.imageLinks?.thumbnail
          ?.replace("http://", "https://")
          .replace("&edge=curl", "") ?? null;

      const nuevoLibro = {
        titulo,
        autor,
        descripcion: info.description || null,
        genero_id: generoId,
        portada_url: portada,
        archivo_path: null,
        formato: "epub",
        licencia: "pendiente_revision",
        total_ejemplares: 1,
        activo: true,
      };

      const { error: errorInsercion } = await supabase
        .from("libros")
        .insert(nuevoLibro);

      if (errorInsercion) throw errorInsercion;

      resumen.importados++;
      console.log(`  Importado correctamente: ${titulo}`);

      // Pausa breve para no enviar todas las consultas seguidas.
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`  Error con "${libro.titulo}": ${error.message}`);
      resumen.errores.push({
        titulo: libro.titulo,
        error: error.message,
      });
    }
  }

  console.log("\n===== RESUMEN DE IMPORTACIÓN =====");
  console.log(`Importados: ${resumen.importados}`);
  console.log(`Duplicados omitidos: ${resumen.duplicados}`);
  console.log(`No encontrados: ${resumen.noEncontrados.length}`);
  console.log(`Errores: ${resumen.errores.length}`);

  if (resumen.noEncontrados.length) {
    console.log("\nNo encontrados:", resumen.noEncontrados);
  }

  if (resumen.errores.length) {
    console.table(resumen.errores);
  }
}

importar().catch((error) => {
  console.error("No se pudo ejecutar la importación:", error.message);
  process.exitCode = 1;
});
