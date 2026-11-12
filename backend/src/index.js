import express from 'express';
import cors from 'cors';
import authRoutes from './presentation/routes/authRoutes.js';
import catalogoRoutes from './presentation/routes/catalogoRoutes.js';
import adminRoutes from './presentation/routes/adminRoutes.js';
import prestamosRoutes from './presentation/routes/prestamosRoutes.js';
import { supabaseAdmin } from './data/config/supabaseClient.js';
import { processLoanTransitions } from './business/services/prestamoService.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prestamos', prestamosRoutes);

if (supabaseAdmin) {
  const updateLoanStates = async () => {
    try {
      const { error } = await processLoanTransitions();
      if (error) console.error('Error al actualizar los estados de préstamos:', error);
    } catch (error) {
      console.error('Error al actualizar los estados de préstamos:', error);
    }
  };
  void updateLoanStates();
  const loanStateTimer = setInterval(updateLoanStates, 60_000);
  loanStateTimer.unref();
} else {
  console.error('No se inició la actualización automática de préstamos: falta SUPABASE_SERVICE_ROLE_KEY.');
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Servidor Backend escuchando en http://localhost:${PORT}`);
});