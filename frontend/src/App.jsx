import { useEffect, useState } from 'react';
import Login from './paginas/Login';
import Register from './paginas/Register';
import SolicitarCambioContrasena from './paginas/SolicitarCambioContrasena';
import EstablecerNuevaContrasena from './paginas/EstablecerNuevaContrasena';
import Catalogo from './paginas/Catalogo';
import DetalleLibro from './paginas/DetalleLibro';
import DashBoardAdmin from './paginas/dashBoardAdmin';
import CatalogoAdmin from './paginas/catalogoAdmin';
import FormularioDatosNuevoLibro from './paginas/formularioDatosNuevoLibro';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [userName, setUserName] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [dashboardData, setDashboardData] = useState({});
  const [adminBooks, setAdminBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [currentScreen, setCurrentScreen] = useState(() => {
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get('type');
    return recoveryType === 'recovery' ? 'establecer-password' : 'login';
  });

  const returnToLogin = () => {
    setAdminToken('');
    setUserName('');
    window.history.replaceState(null, '', '/login');
    setCurrentScreen('login');
  };

  useEffect(() => {
    if (!adminToken || !['dashboard-admin', 'catalogo-admin'].includes(currentScreen)) return;

    const controller = new AbortController();
    const loadAdminData = async () => {
      setAdminError('');
      try {
        const [statsResponse, booksResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/estadisticas`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            signal: controller.signal,
          }),
          currentScreen === 'catalogo-admin'
            ? fetch(`${API_BASE_URL}/admin/libros`, {
              headers: { Authorization: `Bearer ${adminToken}` },
              signal: controller.signal,
            })
            : Promise.resolve(null),
        ]);

        const stats = await statsResponse.json();
        if (!statsResponse.ok) throw new Error(stats?.error || 'No se pudieron cargar las estadísticas.');
        setDashboardData(stats);

        if (booksResponse) {
          const books = await booksResponse.json();
          if (!booksResponse.ok) throw new Error(books?.error || 'No se pudo cargar el catálogo administrativo.');
          setAdminBooks(Array.isArray(books) ? books : []);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error al cargar los datos administrativos:', error);
          setAdminError(error.message || 'No se pudieron cargar los datos administrativos.');
        }
      }
    };

    loadAdminData();
    return () => controller.abort();
  }, [adminToken, currentScreen]);

  const handleLogin = ({ nombre, role, accessToken }) => {
    setUserName(nombre || '');
    if ((role === 'admin' || role === 'administrador') && accessToken) {
      setAdminToken(accessToken);
      setCurrentScreen('dashboard-admin');
      return;
    }

    setAdminToken('');
    setCurrentScreen('catalogo');
  };

  const handleDeleteBook = async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/libros/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || 'No se pudo eliminar el libro.');
    setAdminBooks((books) => books.filter((book) => String(book.id) !== String(id)));
  };

  const catalogData = {
    administrador: dashboardData.administrador,
    totalObras: dashboardData.totalObras ?? adminBooks.length,
    obrasNuevasMes: dashboardData.obrasNuevasMes,
    obrasDigitales: dashboardData.obrasDigitales,
    archivosDigitalesCargados: dashboardData.archivosDigitalesCargados,
    obrasFisicas: dashboardData.obrasFisicas,
    ejemplaresFisicos: dashboardData.ejemplaresFisicos,
    obrasActivas: dashboardData.obrasActivas,
    totalPaginas: adminBooks.length > 0 ? 1 : 0,
    paginaActual: 1,
  };

  return (
    <div>
      {currentScreen === 'dashboard-admin' && (
        <>
          {adminError && <p role="alert" className="p-4 text-error">{adminError}</p>}
          <DashBoardAdmin
            dashboardData={dashboardData}
            onNavigateToCatalog={() => setCurrentScreen('catalogo-admin')}
            onNavigateToNewBook={() => setCurrentScreen('nuevo-libro')}
          />
        </>
      )}
      {currentScreen === 'catalogo-admin' && (
        <>
          {adminError && <p role="alert" className="p-4 text-error">{adminError}</p>}
          <CatalogoAdmin
            catalogData={catalogData}
            libros={adminBooks.map((book) => ({
              ...book,
              portadaUrl: book.portada_url,
              formato: book.formato?.toUpperCase() ?? 'Sin formato',
              copiasTotales: Array.isArray(book.ejemplares)
                ? book.ejemplares.filter((copy) => copy.ubicacion || copy.estado_conservacion).length
                : Number(book.total_ejemplares) || 0,
              estado: book.activo ? 'Activo' : 'Inactivo',
              estadoTipo: book.activo ? 'disponible' : 'restauracion',
              fechaIngreso: book.created_at,
              ubicacion: book.ejemplares?.find((copy) => copy.ubicacion)?.ubicacion ?? '',
              edicion: book.edicion ?? book.generos?.nombre ?? book.genero ?? '',
            }))}
            onDeleteBook={handleDeleteBook}
            onEditBook={(book) => {
              setEditingBook(book);
              setCurrentScreen('editar-libro');
            }}
            onNavigateToDashboard={() => setCurrentScreen('dashboard-admin')}
            onNavigateToNewBook={() => setCurrentScreen('nuevo-libro')}
          />
        </>
      )}
      {currentScreen === 'nuevo-libro' && (
        <FormularioDatosNuevoLibro
          key="nuevo-libro"
          adminToken={adminToken}
          metadata={{ administrador: dashboardData.administrador }}
          onCreated={(book) => {
            setAdminBooks((books) => [...books, book]);
            setCurrentScreen('catalogo-admin');
          }}
          onNavigateToDashboard={() => setCurrentScreen('dashboard-admin')}
          onNavigateToCatalog={() => setCurrentScreen('catalogo-admin')}
        />
      )}
      {currentScreen === 'editar-libro' && editingBook && (
        <FormularioDatosNuevoLibro
          key={editingBook.id}
          adminToken={adminToken}
          editingBook={editingBook}
          coverImageUrl={editingBook.portada_url ?? ''}
          metadata={{
            administrador: dashboardData.administrador,
            ultimaModificacion: editingBook.updated_at,
          }}
          onCreated={(book) => {
            setAdminBooks((books) => books.map((currentBook) =>
              String(currentBook.id) === String(book.id) ? book : currentBook,
            ));
            setEditingBook(null);
            setCurrentScreen('catalogo-admin');
          }}
          onNavigateToDashboard={() => setCurrentScreen('dashboard-admin')}
          onNavigateToCatalog={() => {
            setEditingBook(null);
            setCurrentScreen('catalogo-admin');
          }}
        />
      )}
      {currentScreen === 'catalogo' && (
        <Catalogo
          userName={userName}
          onNavigateToLogin={() => {
            if (!userName) setCurrentScreen('login');
          }}
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
      {currentScreen === 'login' && (
        <Login
          onForgotPassword={() => setCurrentScreen('solicitar-password')}
          onRegister={() => setCurrentScreen('register')}
          onNavigateToCatalog={handleLogin}
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
