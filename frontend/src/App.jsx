import { useState } from 'react';
// Asegúrate de que las rutas coincidan con tu carpeta "paginas"
import Login from './paginas/Login';
import Register from './paginas/Register';
import SolicitarCambioContrasena from './paginas/SolicitarCambioContrasena';
import EstablecerNuevaContrasena from './paginas/EstablecerNuevaContrasena';
// Nuevas importaciones
import Catalogo from './paginas/Catalogo';
import DetalleLibro from './paginas/DetalleLibro';

export default function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(() => {
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get('type');
    // Modificamos el valor por defecto: si no es recuperación, muestra el catálogo
    return recoveryType === 'recovery' ? 'establecer-password' : 'catalogo';
  });

  const returnToLogin = () => {
    window.history.replaceState(null, '', '/login');
    setCurrentScreen('login');
  };

  return (
    <div>
      {/* Vistas Principales */}
      {currentScreen === 'catalogo' && (
        <Catalogo
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToDetail={(book) => {
            setSelectedBook(book);
            setCurrentScreen('detalle');
          }}
        />
      )}
      {currentScreen === 'detalle' && (
        <DetalleLibro
          bookId={selectedBook?.id}
          initialBook={selectedBook}
          onNavigateToCatalog={() => setCurrentScreen('catalogo')}
        />
      )}

      {/* Flujo de Autenticación */}
      {currentScreen === 'login' && (
        <Login
          onForgotPassword={() => setCurrentScreen('solicitar-password')}
          onRegister={() => setCurrentScreen('register')}
        />
      )}
      {currentScreen === 'register' && (
        <Register onReturnToLogin={() => setCurrentScreen('login')} />
      )}
      {currentScreen === 'solicitar-password' && (
        <SolicitarCambioContrasena onReturnToLogin={() => setCurrentScreen('login')} />
      )}
      {currentScreen === 'establecer-password' && ( 
        <EstablecerNuevaContrasena onReturnToLogin={returnToLogin} />
      )}
    </div>
  );
}