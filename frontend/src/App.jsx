import { useState } from 'react';
// Asegúrate de que las rutas coincidan con tu carpeta "paginas"
import Login from './paginas/Login';
import Register from './paginas/Register';
import SolicitarCambioContrasena from './paginas/SolicitarCambioContrasena';
import EstablecerNuevaContrasena from './paginas/EstablecerNuevaContrasena';

export default function App() {
  // Cambia este texto a 'register', 'solicitar-password' o 'establecer-password' para ver las otras pantallas
  const [currentScreen, setCurrentScreen] = useState(() => {
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get('type');
    return recoveryType === 'recovery' ? 'establecer-password' : 'login';
  });
  const returnToLogin = () => {
    window.history.replaceState(null, '', '/login');
    setCurrentScreen('login');
  };

  return (
    <div>
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
      {currentScreen === 'establecer-password' &&       <EstablecerNuevaContrasena onReturnToLogin={returnToLogin} />}
    </div>
  );
}