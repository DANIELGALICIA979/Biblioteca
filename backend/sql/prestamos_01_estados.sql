-- Ejecutar y confirmar esta migración antes de aplicar prestamos_02_esquema.sql.
ALTER TYPE public.estado_prestamo ADD VALUE IF NOT EXISTS 'pendiente';
ALTER TYPE public.estado_prestamo ADD VALUE IF NOT EXISTS 'devuelto';
ALTER TYPE public.estado_prestamo ADD VALUE IF NOT EXISTS 'vencido';
ALTER TYPE public.estado_prestamo ADD VALUE IF NOT EXISTS 'cancelado';
