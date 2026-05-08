import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaHome,
  FaBox, 
  FaShoppingBag, 
  FaChartLine, 
  FaHeart,
  FaQuestionCircle,
  FaCog
} from 'react-icons/fa';

const menuItems = [
  { path: '/perfil', icon: <FaHome />, text: 'Inicio' },
  { path: '/publicar', icon: <FaBox />, text: 'Publicar' },
  { path: '/ventas', icon: <FaShoppingBag />, text: 'Mis Ventas' },
  { path: '/estadisticas', icon: <FaChartLine />, text: 'Estadísticas' },
  { path: '/favoritos', icon: <FaHeart />, text: 'Favoritos' },
  { path: '/ayuda', icon: <FaQuestionCircle />, text: 'Ayuda' },
  { path: '/configuracion', icon: <FaCog />, text: 'Configuración' }
];

const LeftSidebar = () => {
  const router = useRouter();
  const currentPath = router.asPath || router.pathname;

  return (
    <div className="sidebar left-sidebar">
      <nav className="sidebar-menu">
        <h3>Menú</h3>
        <ul className="menu-list">
          {menuItems.map(({ path, icon, text }) => (
            <li key={path} className="menu-item">
              <Link 
                href={path} 
                className={`menu-link ${currentPath === path ? 'active' : ''}`}
              >
                <span className="menu-icon">{icon}</span>
                <span className="menu-text">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default LeftSidebar;
