import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaHome, 
  FaSearch, 
  FaPlus, 
  FaSun,
  FaMoon,
  FaGoogle,
  FaUser,
  FaUserCircle,
  FaStar, // Importar FaStar
  FaSignOutAlt // Opcional: ícono para cerrar sesión
} from 'react-icons/fa';
import { loginWithGoogle } from '../services/auth';
import logo from '../image/j&s-compra22.png';
import SearchBar from './SearchBar';
import { config } from '../config/config';

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();
  const currentPath = router.asPath || router.pathname;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === null) {
      localStorage.setItem('darkMode', 'true');
      document.body.classList.add('dark-mode');
      setDarkMode(true);
      return;
    }

    const isDark = savedMode === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Optimizar el useEffect para evitar re-renders innecesarios
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  useEffect(() => {
    console.log('User state updated:', user);
  }, [user]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    document.body.classList.toggle('dark-mode');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Iniciando login con Google...');
    try {
      // Usar directamente la URL completa
      window.location.href = 'https://backend-compraventa-ofic-production.up.railway.app/auth/google';
    } catch (error) {
      console.error('Error en redirección:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePublicarClick = async (e) => {
    e.preventDefault();
    if (!user) {
      try {
        await loginWithGoogle();
        router.push('/publicar');
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
      }
    } else {
      router.push('/publicar');
    }
  };

  // Añadir el dropdown del usuario
  const renderUserDropdown = () => (
    <div className="user-dropdown">
      <div className="dropdown-header">
        <img src={user.picture} alt={user.name} />
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-email">{user.email}</span>
        </div>
      </div>
      <div className="dropdown-buttons">
        <Link href="/publicar" className="dropdown-button">
          <FaPlus />
          <span>Publicar</span>
        </Link>
        <Link href="/perfil" className="dropdown-button">
          <FaUserCircle />
          <span>Perfil Usuario</span>
        </Link>
        <Link href="/puntaje" className="dropdown-button">
          <FaStar />
          <span>Puntaje</span>
        </Link>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  // Modificar renderUserProfile para incluir el dropdown
  const renderUserProfile = () => {
    if (!user) return null;

    return (
      <div className="user-profile" onClick={toggleMenu}>
        <img 
          src={user.picture} 
          alt={user.name} 
          className="profile-pic"
          onError={(e) => {
            e.target.src = 'default-avatar.png';
          }}
        />
        {isMenuOpen && renderUserDropdown()}
      </div>
    );
  };

  return (
    <>
      <header className="mobile-header">
        {showMobileSearch ? (
          <SearchBar 
            isMobile={true} 
            onClose={() => setShowMobileSearch(false)} 
          />
        ) : (
          <div className="mobile-header-content">
            <div className="mobile-logo-container">
              <Link href="/">
                <img src={logo?.src || logo} alt="Logo" className="mobile-logo" />
              </Link>
            </div>
            
            <div className="mobile-auth">
              {user ? (
                renderUserProfile()
              ) : (
                <button onClick={handleLogin} className="mobile-login-button">
                  <FaUser />
                  <span>Iniciar sesión</span>
                </button>
              )}
            </div>
            <button 
              className="search-toggle" 
              onClick={() => setShowMobileSearch(true)}
            >
              <FaSearch />
            </button>
          </div>
        )}
      </header>

      <header className="desktop-header">
        <div className="logo-container">
          <Link href="/">
            <img src={logo?.src || logo} alt="Logo" className="logo" />
          </Link>
        </div>
        
        <div className="center-container">
          <SearchBar isMobile={false} />
        </div>

        <div className="right-controls">
          {!user && (
            <button 
              onClick={handlePublicarClick} 
              className="publish-button-desktop"
            >
              Publicar
            </button>
          )}
          <Link href="/" className="home-link">Inicio</Link>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <FaMoon /> : <FaSun />}
          </button>
          
          {user ? (
            renderUserProfile()
          ) : (
            <button onClick={handleLogin} className="login-button">
              <FaGoogle className="google-icon" />
              <span>Iniciar con Google</span>
            </button>
          )}
        </div>
      </header>

      <nav className="mobile-nav">
        <Link href="/" className={currentPath === '/' ? 'active' : ''}>
          <FaHome />
          <span>Inicio</span>
        </Link>
        <Link href="/buscar" className={currentPath === '/buscar' ? 'active' : ''}>
          <FaSearch />
          <span>Buscar</span>
        </Link>
        <button 
          onClick={handlePublicarClick} 
          className={`nav-button ${currentPath === '/publicar' ? 'active' : ''}`}
        >
          <FaPlus />
          <span>Publicar</span>
        </button>
      </nav>
    </>
  );
};

export default Header;
