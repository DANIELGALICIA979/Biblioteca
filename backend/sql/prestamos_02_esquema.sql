ALTER TABLE public.ejemplares
  ADD CONSTRAINT ejemplares_libro_id_id_key UNIQUE (libro_id, id);

ALTER TABLE public.prestamos
  ADD COLUMN tipo_prestamo text NOT NULL,
  ADD COLUMN ejemplar_id uuid,
  ADD COLUMN fecha_solicitud timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN fecha_limite_retiro timestamp with time zone;

ALTER TABLE public.prestamos
  ALTER COLUMN fecha_prestamo DROP NOT NULL,
  ALTER COLUMN fecha_prestamo DROP DEFAULT,
  ALTER COLUMN fecha_limite DROP NOT NULL;

ALTER TABLE public.prestamos
  ADD CONSTRAINT prestamos_tipo_prestamo_check
    CHECK (tipo_prestamo IN ('digital', 'fisico')),
  ADD CONSTRAINT prestamos_estado_check
    CHECK (estado::text IN ('pendiente', 'activo', 'devuelto', 'vencido', 'cancelado')),
  ADD CONSTRAINT prestamos_ejemplar_libro_fkey
    FOREIGN KEY (libro_id, ejemplar_id)
    REFERENCES public.ejemplares (libro_id, id)
    ON DELETE RESTRICT,
  ADD CONSTRAINT prestamos_flujo_fechas_check
    CHECK (
      (
        tipo_prestamo = 'digital'
        AND ejemplar_id IS NULL
        AND fecha_limite IS NULL
        AND fecha_limite_retiro IS NULL
        AND (
          (estado = 'activo' AND fecha_prestamo IS NOT NULL AND fecha_devolucion IS NULL)
          OR (estado = 'devuelto' AND fecha_prestamo IS NOT NULL AND fecha_devolucion IS NOT NULL)
        )
      )
      OR
      (
        tipo_prestamo = 'fisico'
        AND ejemplar_id IS NOT NULL
        AND fecha_limite_retiro IS NOT NULL
        AND (
          (
            estado = 'pendiente'
            AND fecha_prestamo IS NULL
            AND fecha_limite IS NULL
            AND fecha_devolucion IS NULL
          )
          OR (
            estado = 'activo'
            AND fecha_prestamo IS NOT NULL
            AND fecha_limite IS NOT NULL
            AND fecha_devolucion IS NULL
          )
          OR (
            estado = 'vencido'
            AND fecha_prestamo IS NOT NULL
            AND fecha_limite IS NOT NULL
            AND fecha_devolucion IS NULL
          )
          OR (
            estado = 'devuelto'
            AND fecha_prestamo IS NOT NULL
            AND fecha_limite IS NOT NULL
            AND fecha_devolucion IS NOT NULL
          )
          OR (
            estado = 'cancelado'
            AND fecha_prestamo IS NULL
            AND fecha_limite IS NULL
            AND fecha_devolucion IS NULL
          )
        )
      )
    );

CREATE UNIQUE INDEX prestamos_un_ejemplar_en_circulacion
  ON public.prestamos (ejemplar_id)
  WHERE tipo_prestamo = 'fisico'
    AND estado IN ('pendiente', 'activo', 'vencido');
