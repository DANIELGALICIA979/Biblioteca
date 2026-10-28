-- Permite consultar el catálogo público desde la clave anon/autenticada.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.libros TO anon, authenticated;
GRANT SELECT ON TABLE public.generos TO anon, authenticated;

ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "libros_public_read" ON public.libros;
CREATE POLICY "libros_public_read"
ON public.libros
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "generos_public_read" ON public.generos;
CREATE POLICY "generos_public_read"
ON public.generos
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (true);

-- Verificación opcional.
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('libros', 'generos')
ORDER BY tablename, policyname;
