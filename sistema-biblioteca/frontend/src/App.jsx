import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const isRegisterPage = window.location.pathname.replace(/\/+$/, '') === '/registro';

  return (
    <div>
      {isRegisterPage ? (
        <Register />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;