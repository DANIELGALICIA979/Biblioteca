CREATE SEQUENCE IF NOT EXISTS public.ejemplares_codigo_inventario_seq;

CREATE OR REPLACE FUNCTION public.generar_codigo_inventario(p_ubicacion text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_piso text;
  v_pasillo text;
  v_estante text;
  v_grupo text;
  v_consecutivo bigint;
BEGIN
  v_piso := substring(p_ubicacion from '(?i)piso\s*([0-9]+)');
  v_pasillo := substring(p_ubicacion from '(?i)pasillo\s*([0-9]+)');
  v_estante := substring(p_ubicacion from '(?i)estante\s*([0-9]+)');
  v_grupo := substring(p_ubicacion from '(?i)g\s*([0-9]+)');

  v_piso := COALESCE(v_piso, (floor(random() * 9) + 1)::integer::text);
  v_pasillo := COALESCE(v_pasillo, (floor(random() * 9) + 1)::integer::text);
  v_estante := COALESCE(v_estante, (floor(random() * 99) + 1)::integer::text);
  v_grupo := COALESCE(v_grupo, (floor(random() * 99) + 1)::integer::text);
  v_consecutivo := nextval('public.ejemplares_codigo_inventario_seq');

  RETURN format(
    'P%sP%s-E%sG%s-%s',
    v_piso,
    v_pasillo,
    v_estante,
    v_grupo,
    lpad(v_consecutivo::text, 3, '0')
  );
END;
$$;

UPDATE public.ejemplares
SET codigo_inventario = public.generar_codigo_inventario(ubicacion)
WHERE codigo_inventario IS NULL;

SELECT setval(
  'public.ejemplares_codigo_inventario_seq',
  COALESCE(
    (SELECT MAX(substring(codigo_inventario from '-([0-9]+)$')::bigint)
     FROM public.ejemplares
     WHERE codigo_inventario ~ '-[0-9]+$'),
    0
  ) + 1,
  false
);

CREATE OR REPLACE FUNCTION public.asignar_codigo_inventario_ejemplar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
BEGIN
  IF NEW.codigo_inventario IS NULL OR btrim(NEW.codigo_inventario) = '' THEN
    NEW.codigo_inventario := public.generar_codigo_inventario(NEW.ubicacion);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ejemplares_generar_codigo_inventario ON public.ejemplares;
CREATE TRIGGER ejemplares_generar_codigo_inventario
BEFORE INSERT ON public.ejemplares
FOR EACH ROW
EXECUTE FUNCTION public.asignar_codigo_inventario_ejemplar();

REVOKE ALL ON FUNCTION public.generar_codigo_inventario(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.asignar_codigo_inventario_ejemplar() FROM PUBLIC;
