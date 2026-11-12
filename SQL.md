-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  nombre_usuario text NOT NULL UNIQUE CHECK (char_length(nombre_usuario) >= 3),
  rol USER-DEFINED NOT NULL DEFAULT 'lector'::rol_usuario,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.generos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  CONSTRAINT generos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.libros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  autor text NOT NULL,
  descripcion text,
  genero_id uuid,
  portada_url text,
  archivo_path text,
  formato text CHECK (formato IS NULL OR (formato = ANY (ARRAY['epub'::text, 'pdf'::text, 'tiff'::text, 'zip'::text]))),
  licencia text NOT NULL DEFAULT 'pendiente_revision'::text CHECK (licencia = ANY (ARRAY['dominio_publico'::text, 'permiso_distribucion'::text, 'pendiente_revision'::text])),
  total_ejemplares integer NOT NULL DEFAULT 0 CHECK (total_ejemplares >= 0),
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  subtitulo text,
  editorial text,
  lugar_publicacion text,
  anio_publicacion integer,
  edicion text,
  isbn text,
  idioma_original text,
  idiomas_traduccion ARRAY NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT libros_pkey PRIMARY KEY (id),
  CONSTRAINT libros_genero_id_fkey FOREIGN KEY (genero_id) REFERENCES public.generos(id)
);
CREATE TABLE public.prestamos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  libro_id uuid NOT NULL,
  fecha_prestamo timestamp with time zone NOT NULL DEFAULT now(),
  fecha_limite timestamp with time zone NOT NULL,
  fecha_devolucion timestamp with time zone,
  estado USER-DEFINED NOT NULL DEFAULT 'activo'::estado_prestamo,
  CONSTRAINT prestamos_pkey PRIMARY KEY (id),
  CONSTRAINT prestamos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT prestamos_libro_id_fkey FOREIGN KEY (libro_id) REFERENCES public.libros(id)
);
CREATE TABLE public.progreso_lectura (
  prestamo_id uuid NOT NULL,
  ubicacion text,
  porcentaje numeric NOT NULL DEFAULT 0 CHECK (porcentaje >= 0::numeric AND porcentaje <= 100::numeric),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT progreso_lectura_pkey PRIMARY KEY (prestamo_id),
  CONSTRAINT progreso_lectura_prestamo_id_fkey FOREIGN KEY (prestamo_id) REFERENCES public.prestamos(id)
);
CREATE TABLE public.libro_autores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  libro_id uuid NOT NULL,
  nombre text NOT NULL,
  responsabilidad text NOT NULL CHECK (responsabilidad = ANY (ARRAY['coautor'::text, 'prologuista'::text, 'editor_literario'::text, 'traductor'::text, 'ilustrador'::text])),
  orden integer NOT NULL DEFAULT 0,
  CONSTRAINT libro_autores_pkey PRIMARY KEY (id),
  CONSTRAINT libro_autores_libro_id_fkey FOREIGN KEY (libro_id) REFERENCES public.libros(id)
);
CREATE TABLE public.ejemplares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  libro_id uuid NOT NULL,
  codigo_inventario text UNIQUE,
  ubicacion text,
  estado_conservacion text CHECK (estado_conservacion IS NULL OR (estado_conservacion = ANY (ARRAY['excelente'::text, 'bueno'::text, 'regular'::text, 'restauracion'::text]))),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ejemplares_pkey PRIMARY KEY (id),
  CONSTRAINT ejemplares_libro_id_fkey FOREIGN KEY (libro_id) REFERENCES public.libros(id)
);