import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Publicar from './pages/Publicar';
import PublicationDetail from './pages/PublicationDetail';
import CategoryPage from './pages/CategoryPage';
import PerfilUsuario from './pages/PerfilUsuario';
import OfertasPage from './pages/OfertasPage';
import AuthHandler from './components/AuthHandler';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/" replace />;
  }
  return children;
};

// Componente para manejar el callback de autenticación
const AuthCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userDataStr = params.get('userData');

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        window.location.href = '/';
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return null;
};

function App() {
  // Configurar el tema oscuro como predeterminado
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === null) {
      localStorage.setItem('darkMode', 'true');
      document.body.classList.add('dark-mode');
    } else if (savedMode === 'true') {
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/categoria/:categoryName" element={<CategoryPage />} />
          <Route path="/publicacion/:id" element={<PublicationDetail />} />
          <Route path="/buscar" element={<CategoryPage />} /> {/* Añadir esta ruta */}
          <Route path="/auth" element={<AuthHandler />} />
          <Route path="/auth/google/callback" element={<AuthHandler />} />
          <Route 
            path="/publicar" 
            element={
              <ProtectedRoute>
                <Publicar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <PerfilUsuario />
              </ProtectedRoute>
            } 
          />
          <Route path="/ofertas" element={<OfertasPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
