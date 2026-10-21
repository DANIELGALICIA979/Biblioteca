import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // Puedes cambiar la pantalla con un router o temporalmente con un estado simple:
  const [currentScreen, setCurrentScreen] = useState('register'); // 'login' o 'register'

  return (
    <div>
      {currentScreen === 'register' ? (
        <Register />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;