import express from 'express';
import cors from 'cors';
import authRoutes from './presentation/routes/authRoutes.js';
import catalogoRoutes from './presentation/routes/catalogoRoutes.js';
import adminRoutes from './presentation/routes/adminRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Servidor Backend escuchando en http://localhost:${PORT}`);
});