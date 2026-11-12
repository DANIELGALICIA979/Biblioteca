import { supabaseAdmin } from '../../data/config/supabaseClient.js';

export const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let remainingDays = days;

  while (remainingDays > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    const dayOfWeek = result.getUTCDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) remainingDays -= 1;
  }

  return result;
};

export const processLoanTransitions = async () => {
  if (!supabaseAdmin) {
    return { error: new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada.') };
  }

  const now = new Date().toISOString();
  const [expiredRequests, overdueLoans] = await Promise.all([
    supabaseAdmin
      .from('prestamos')
      .update({ estado: 'cancelado' })
      .eq('tipo_prestamo', 'fisico')
      .eq('estado', 'pendiente')
      .lte('fecha_limite_retiro', now)
      .select('id'),
    supabaseAdmin
      .from('prestamos')
      .update({ estado: 'vencido' })
      .eq('tipo_prestamo', 'fisico')
      .eq('estado', 'activo')
      .lte('fecha_limite', now)
      .select('id'),
  ]);

  const failedQuery = [expiredRequests, overdueLoans].find(({ error }) => error);
  if (failedQuery) return { error: failedQuery.error };

  return {
    cancelledRequests: expiredRequests.data?.length ?? 0,
    overdueLoans: overdueLoans.data?.length ?? 0,
  };
};
