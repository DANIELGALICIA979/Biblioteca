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
import PrestamosLector from './paginas/prestamosLector';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_SESSION_KEY = 'biblioteca.auth-session';
let sessionRestoreRequest;

const makeAuthSession = (payload, fallbackName = '') => {
  const role = payload?.role;
  const accessToken = payload?.session?.access_token;
  const refreshToken = payload?.session?.refresh_token;
  if (!['administrador', 'lector'].includes(role) || !accessToken || !refreshToken) return null;

  return {
    role,
    nombre: payload?.displayName || fallbackName,
    accessToken,
    refreshToken,
    expiresAt: payload.session.expires_at,
  };
};

export default function App() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [userName, setUserName] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [readerToken, setReaderToken] = useState('');
  const [dashboardData, setDashboardData] = useState({});
  const [adminLoans, setAdminLoans] = useState([]);
  const [adminBooks, setAdminBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [authSession, setAuthSession] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [currentScreen, setCurrentScreen] = useState(() => {
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get('type');
    return recoveryType === 'recovery' ? 'establecer-password' : 'login';
  });

  const returnToLogin = () => {
    setAdminToken('');
    setReaderToken('');
    setUserName('');
    setAuthSession(null);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    window.history.replaceState(null, '', '/login');
    setCurrentScreen('login');
  };

  useEffect(() => {
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get('type');
    if (recoveryType === 'recovery') {
      setIsRestoringSession(false);
      return undefined;
    }

    let storedSession;
    try {
      storedSession = JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) || 'null');
    } catch (error) {
      console.error('No se pudo leer la sesión guardada:', error);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }

    if (!storedSession?.refreshToken || !storedSession?.role) {
      if (storedSession) sessionStorage.removeItem(AUTH_SESSION_KEY);
      setIsRestoringSession(false);
      return undefined;
    }

    let active = true;
    const restoreSession = async () => {
      try {
        if (!sessionRestoreRequest) {
          sessionRestoreRequest = fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedSession.refreshToken }),
          })
            .then(async (response) => ({
              response,
              payload: await response.json().catch(() => null),
            }))
            .finally(() => {
              sessionRestoreRequest = null;
            });
        }
        const { response, payload } = await sessionRestoreRequest;
        if (!active) return;

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem(AUTH_SESSION_KEY);
            return;
          }
          throw new Error(payload?.error || 'No se pudo restaurar la sesión.');
        }

        const restoredSession = makeAuthSession(payload, storedSession.nombre);
        if (!restoredSession) throw new Error('El servidor no devolvió una sesión válida.');
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(restoredSession));
        setAuthSession(restoredSession);
        setUserName(restoredSession.nombre);
        if (restoredSession.role === 'administrador') {
          setAdminToken(restoredSession.accessToken);
          setReaderToken('');
          setCurrentScreen('dashboard-admin');
        } else {
          setReaderToken(restoredSession.accessToken);
          setAdminToken('');
          setCurrentScreen('catalogo');
        }
      } catch (error) {
        if (active) {
          console.error('Error al restaurar la sesión:', error);
          if (storedSession.accessToken) {
            setAuthSession(storedSession);
            setUserName(storedSession.nombre || '');
            if (storedSession.role === 'administrador') {
              setAdminToken(storedSession.accessToken);
              setCurrentScreen('dashboard-admin');
            } else if (storedSession.role === 'lector') {
              setReaderToken(storedSession.accessToken);
              setCurrentScreen('catalogo');
            }
          }
        }
      } finally {
        if (active) setIsRestoringSession(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authSession?.refreshToken) return undefined;

    let active = true;
    let timer;
    const expiry = Number(authSession.expiresAt) * 1000;
    const delay = Number.isFinite(expiry)
      ? Math.max(1000, expiry - Date.now() - 60_000)
      : 45 * 60 * 1000;

    const refresh = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: authSession.refreshToken }),
        });
        const payload = await response.json().catch(() => null);
        if (!active) return;
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            returnToLogin();
            return;
          }
          throw new Error(payload?.error || 'No se pudo renovar la sesión.');
        }

        const refreshedSession = makeAuthSession(payload, authSession.nombre);
        if (!refreshedSession) throw new Error('El servidor no devolvió una sesión válida.');
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(refreshedSession));
        setAuthSession(refreshedSession);
        setUserName(refreshedSession.nombre);
        if (refreshedSession.role === 'administrador') setAdminToken(refreshedSession.accessToken);
        else setReaderToken(refreshedSession.accessToken);
      } catch (error) {
        console.error('Error al renovar la sesión:', error);
        if (active) timer = window.setTimeout(refresh, 60_000);
      }
    };

    timer = window.setTimeout(refresh, delay);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [authSession]);

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

  useEffect(() => {
    if (!adminToken || currentScreen !== 'dashboard-admin') return undefined;

    const controller = new AbortController();
    const loadLoans = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/prestamos`, {
          headers: { Authorization: `Bearer ${adminToken}` },
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || 'No se pudieron cargar los préstamos.');
        setAdminLoans(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error al cargar los préstamos administrativos:', error);
          setAdminError(error.message || 'No se pudieron cargar los préstamos.');
        }
      }
    };

    loadLoans();
    return () => controller.abort();
  }, [adminToken, currentScreen]);

  const handleLogin = ({ nombre, role, accessToken, refreshToken, expiresAt }) => {
    setUserName(nombre || '');
    setReaderToken('');
    const newSession = {
      role,
      nombre: nombre || '',
      accessToken,
      refreshToken,
      expiresAt,
    };
    if (accessToken && refreshToken) {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newSession));
      setAuthSession(newSession);
    }
    if ((role === 'admin' || role === 'administrador') && accessToken) {
      setAdminToken(accessToken);
      setCurrentScreen('dashboard-admin');
      return;
    }

    setAdminToken('');
    if (role === 'lector' && accessToken) {
      setReaderToken(accessToken);
      setCurrentScreen('catalogo');
      return;
    }

    setCurrentScreen('catalogo');
  };

  const handleAdminLoanAction = async (id, action) => {
    const response = await fetch(`${API_BASE_URL}/admin/prestamos/${encodeURIComponent(id)}/${action}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || 'No se pudo actualizar el préstamo.');

    const loansResponse = await fetch(`${API_BASE_URL}/admin/prestamos`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const loans = await loansResponse.json().catch(() => null);
    if (!loansResponse.ok) throw new Error(loans?.error || 'No se pudo actualizar la lista de préstamos.');
    setAdminLoans(Array.isArray(loans) ? loans : []);
    setDashboardData((current) => ({
      ...current,
      prestamosActivos: loans.filter((loan) => ['activo', 'vencido'].includes(loan.estado)).length,
    }));
    setAdminError('');
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
      {isRestoringSession ? (
        <main className="flex min-h-screen items-center justify-center bg-background text-primary">
          <p role="status">Restaurando sesión...</p>
        </main>
      ) : (
      <>
      {currentScreen === 'dashboard-admin' && (
        <>
          {adminError && <p role="alert" className="p-4 text-error">{adminError}</p>}
          <DashBoardAdmin
            dashboardData={dashboardData}
            prestamosRecientes={adminLoans.map((loan) => ({
              id: loan.id,
              titulo: loan.libros?.titulo,
              autor: loan.libros?.autor,
              edicion: loan.ejemplares?.codigo_inventario,
              lector: loan.perfiles?.nombre_usuario,
              lectorId: loan.usuario_id,
              tipo: loan.tipo_prestamo === 'fisico' ? 'Físico' : 'Digital',
              tipoIcono: loan.tipo_prestamo === 'fisico' ? 'inventory_2' : 'devices',
              fechaLimite: loan.estado === 'pendiente'
                ? loan.fecha_limite_retiro
                : loan.fecha_limite || 'Sin vencimiento',
              detalleLimite: loan.estado === 'pendiente'
                ? 'Límite para recoger'
                : loan.tipo_prestamo === 'digital' ? 'Acceso sin vencimiento' : '',
              estado: ({
                pendiente: 'Pendiente de recogida',
                activo: 'Activo',
                vencido: 'Vencido',
                devuelto: 'Devuelto',
                cancelado: 'Cancelado',
              })[loan.estado] || loan.estado,
              estadoOriginal: loan.estado,
              estadoTipo: loan.estado === 'vencido' ? 'vencido' : loan.estado === 'pendiente' ? 'porVencer' : 'alDia',
            }))}
            onLoanAction={handleAdminLoanAction}
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
          onNavigateToLoans={() => setCurrentScreen('prestamos-lector')}
          onNavigateToLogin={() => {
            if (!userName) setCurrentScreen('login');
          }}
          onNavigateToDetail={(book) => {
            setSelectedBook(book);
            setCurrentScreen('detalle');
          }}
        />
      )}
      {currentScreen === 'prestamos-lector' && (
        <PrestamosLector
          accessToken={readerToken}
          userName={userName}
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToCatalog={() => setCurrentScreen('catalogo')}
        />
      )}
      {currentScreen === 'detalle' && (
        <DetalleLibro
          bookId={selectedBook?.id}
          initialBook={selectedBook}
          accessToken={readerToken}
          userName={userName}
          onNavigateToCatalog={() => setCurrentScreen('catalogo')}
          onNavigateToLoans={() => setCurrentScreen('prestamos-lector')}
          onNavigateToLogin={() => setCurrentScreen('login')}
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
      </>
      )}
    </div>
  );
}
