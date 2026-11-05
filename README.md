# Biblioteca
Sistema WEB de una Biblioteca

## API administrativa

Las rutas administrativas requieren `Authorization: Bearer <access_token>` de Supabase. El backend valida el token con Auth y consulta `perfiles.rol` por `perfiles.id = auth.users.id`; solo el valor `administrador` autoriza las rutas protegidas. Configura `SUPABASE_SERVICE_ROLE_KEY` únicamente en el entorno privado del backend: sin ella, las operaciones de administración responden `503`.

- `POST /api/admin/libros`: registra una obra. Requiere `titulo` y `autor`.
- `PUT /api/admin/libros/:id`: actualiza los campos bibliográficos permitidos y, cuando se envían, sus colaboradores y ejemplares.
- `DELETE /api/admin/libros/:id`: elimina una obra.
- `GET /api/admin/estadisticas`: devuelve conteos exactos de títulos totales, nuevos este mes, marcados EPUB/PDF, con ruta de archivo cargada, con ejemplares físicos, activos y disponibles; copias físicas; lectores registrados y nuevos en los últimos siete días; y préstamos sin fecha de devolución. Títulos y ejemplares son métricas distintas: una obra puede tener varias copias.
- `POST /api/admin/storage/signed-upload`: emite una URL temporal para subir portadas o archivos; el archivo se carga directamente a Supabase Storage, no pasa por la memoria del servidor.
- `GET /api/admin/generos`: lista géneros para el formulario de catalogación.
- Las estadísticas clasifican como físicas las obras que tienen ejemplares con ubicación registrada; los títulos EPUB/PDF restantes se cuentan como digitales. Los archivos realmente subidos se informan por separado.

Las estadísticas usan `select` con `count: 'exact'` y `head: true`: PostgREST solicita el agregado a PostgreSQL sin transferir las filas a Node.js. Los préstamos activos se cuentan como filas de `prestamos` con `fecha_devolucion IS NULL`.

El formulario de libros guarda metadatos en `libros`, colaboradores en `libro_autores` y una fila por copia física en `ejemplares`. Los buckets de Storage esperados se llaman `Portadas` y `Archivos`: configura `Portadas` como público para que la portada se vea en el catálogo, y deja `Archivos` privado. La interfaz solo acepta archivos EPUB y PDF.

Esta autorización contribuye al atributo de **Seguridad** de ISO/IEC 25010: las operaciones de escritura y eliminación quedan bloqueadas con `401` si falta o no es válido el token, y con `403` si el usuario autenticado no tiene `rol = administrador` en su fila de perfil. La clave `SUPABASE_SERVICE_ROLE_KEY` debe permanecer exclusivamente en el backend.
