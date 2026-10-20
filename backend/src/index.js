import express from 'express';
import cors from 'cors';
import authRoutes from './presentation/routes/authRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Servidor Backend escuchando en http://localhost:${PORT}`);
});