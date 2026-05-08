import React, { useState, useEffect } from 'react';
import LeftSidebar from '../components/sidebars/LeftSidebar';
import RightSidebar from '../components/sidebars/RightSidebar';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaGlobe,
  FaBars, 
  FaUserCog, 
  FaTimes
} from 'react-icons/fa';
import { publicationsApi, userApi } from '../services/api';
import ProfileBadges from '../components/ProfileBadges';
import BusinessProfileForm from '../components/BusinessProfileForm';
import UserPublications from '../components/profile/UserPublications';
import defaultProfileImg from '../image/perfil-defecto.png';

const PerfilUsuario = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState({
    totalPublications: 0,
    activePublications: 0,
    totalViews: 0,
    totalLikes: 0,
    averageRating: 0,
    totalSales: 0
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false); // ADDED
  const SWIPE_THRESHOLD = 50; // minimum distance for swipe

  const fetchUserProfile = async () => {
    try {
      const updatedProfile = await userApi.getProfile();
      console.log('Profile data received:', updatedProfile);
      
      if (updatedProfile) {
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(updatedProfile));
        setUser(updatedProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) setUser(userData);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userPublications = await publicationsApi.getUserPublications();
      console.log('Fetched user publications:', userPublications); // Debug publications
      setPublications(userPublications);
      
      // Cálculo correcto de estadísticas basado en los datos reales
      const statsData = {
        totalPublications: userPublications.length,
        // Contar publicaciones activas (donde activo es true)
        activePublications: userPublications.filter(p => p.activo === true).length,
        // Sumar todas las vistas de todas las publicaciones
        totalViews: userPublications.reduce((sum, p) => sum + (p.vistas || 0), 0),
        // Sumar todos los likes si existen
        totalLikes: userPublications.reduce((sum, p) => sum + (p.likes || 0), 0),
        // Calcular ventas basado en las publicaciones vendidas
        totalSales: userPublications.filter(p => p.paymentAt !== null).length,
        // Si tienes un sistema de rating, calcúlalo aquí
        averageRating: 4.5 // Por ahora dejamos un valor fijo
      };
      setStats(statsData);
      console.log('Estadísticas calculadas:', statsData); // Para debugging
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleBusinessProfileUpdate = async (formDataToSend) => {
    try {
      const response = await userApi.updateBusinessProfile(formDataToSend);
      
      if (response.success) {
        setUpdateSuccess(true);
        // Recargar el perfil del usuario
        await fetchUserProfile();
        
        setTimeout(() => {
          setIsBusinessModalOpen(false);
          setUpdateSuccess(false);
          window.location.reload(); // Asegurarse de que los cambios se reflejen
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768) { // mobile devices
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
          const rect = el.getBoundingClientRect();
          if(rect.top < window.innerHeight - 100){
            el.classList.add('in-view');
          }
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSortPublications = (sortOption) => {
    let sortedPublications = [...publications];
    switch (sortOption) {
      case 'popular':
        sortedPublications.sort((a, b) => (b.vistas || 0) - (a.vistas || 0));
        break;
      case 'price-high':
        sortedPublications.sort((a, b) => b.precio - a.precio);
        break;
      case 'price-low':
        sortedPublications.sort((a, b) => a.precio - b.precio);
        break;
      default: // recent
        sortedPublications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setPublications(sortedPublications);
  };

  const handleFilterPublications = (filter) => {
    // Implement filtering logic here
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchEnd - touchStart;

    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      if (distance > 0) { // swipe right
        setRightSidebarOpen(true);
      } else { // swipe left
        setLeftSidebarOpen(true);
      }
    }
  };

  const truncateText = (text, limit = 150) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  if (!user) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <>
      <Header />
      <div className="app-container">
        <div className={`left-sidebar ${leftSidebarOpen ? 'active' : ''}`}>
          <button 
            className="mobile-sidebar-close" 
            onClick={() => setLeftSidebarOpen(false)}
          >
            <FaTimes />
          </button>
          <LeftSidebar />
        </div>
        
        <main 
          className="main-content"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-banner">
                {user?.businessProfile?.banner ? (
                  <img src={user.businessProfile.banner} alt="Banner" className="header-img" />
                ) : (
                  <div className="default-banner"></div>
                )}
              </div>
              
              <div className="profile-info">
                <div className="avatar">
                  <img 
                    src={
                      user?.businessProfile?.profilePicture || // 1. Primero intenta usar la foto de perfil empresarial
                      user?.picture || // 2. Si no existe, usa la foto de Google
                      defaultProfileImg // 3. Si ninguna está disponible, usa la imagen por defecto
                    } 
                    alt={user?.businessProfile?.name || user?.name}
                    className="avatar-img"
                    onError={(e) => {
                      console.log('Error loading image, falling back to default');
                      e.target.src = defaultProfileImg; // Si hay error al cargar, usa la imagen por defecto
                    }}
                  />
                </div>
                
                <div className="profile-details">
                  <h1 className="profile-name">{user?.businessProfile?.name || user?.name}</h1>
                  <p className="profile-email">{user?.email}</p>
                  {user?.businessProfile?.location && (
                    <p className="location">
                      <FaMapMarkerAlt /> {user.businessProfile.location}
                    </p>
                  )}
                </div>
              </div>

              {user?.businessProfile?.description && (
                <div className="business-description">
                  <p>
                    {isDescriptionExpanded 
                      ? user.businessProfile.description 
                      : truncateText(user.businessProfile.description)}
                  </p>
                  {user.businessProfile.description.length > 150 && (
                    <button 
                      className="expand-description-btn"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                      {isDescriptionExpanded ? 'Ver menos' : 'Ver más...'}
                    </button>
                  )}
                </div>
              )}

              {/* Agregar sección de enlaces sociales */}
              {user?.businessProfile && (
                <div className="social-links-container">
                  <div className="social-links">
                    {user.businessProfile.socialLinks?.facebook && (
                      <a 
                        href={user.businessProfile.socialLinks.facebook} 
                        className="social-link facebook"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFacebook />
                      </a>
                    )}
                    {user.businessProfile.socialLinks?.twitter && (
                      <a 
                        href={user.businessProfile.socialLinks.twitter}
                        className="social-link twitter"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaTwitter />
                      </a>
                    )}
                    {user.businessProfile.socialLinks?.instagram && (
                      <a 
                        href={user.businessProfile.socialLinks.instagram}
                        className="social-link instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaInstagram />
                      </a>
                    )}
                    {user.businessProfile.socialLinks?.tiktok && (
                      <a 
                        href={user.businessProfile.socialLinks.tiktok}
                        className="social-link tiktok"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaTiktok />
                      </a>
                    )}
                    {user.businessProfile.socialLinks?.website && (
                      <a 
                        href={user.businessProfile.socialLinks.website}
                        className="social-link website"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGlobe />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Rest of the profile card content... */}
            </div>

            {/* Rest of the profile content */}
            <ProfileBadges stats={stats} />
            
            {/* Analytics Section */}
            <div className="analytics-section">
              {/* ...existing analytics code... */}
            </div>

            {/* Publications Grid */}
            <div className="profile-tabs">
              {/* ...existing tabs code... */}
            </div>

            <div className="profile-tab-content">
              {/* ...existing tab content code... */}
            </div>

            <div className="mobile-floating-buttons">
              <div className="floating-button left-button">
                <FaBars />
              </div>
              <div className="floating-button right-button">
                <FaUserCog />
              </div>
            </div>
          </div>
          <UserPublications 
            publications={publications}
            onSort={handleSortPublications}
            onFilter={handleFilterPublications}
          />
        </main>

        <div className={`right-sidebar ${rightSidebarOpen ? 'active' : ''}`}>
          <button 
            className="mobile-sidebar-close" 
            onClick={() => setRightSidebarOpen(false)}
          >
            <FaTimes />
          </button>
          <RightSidebar 
            user={user}
            onEditProfile={() => setIsBusinessModalOpen(true)}
          />
        </div>
        
        <div 
          className={`mobile-sidebar-overlay ${leftSidebarOpen || rightSidebarOpen ? 'active' : ''}`}
          onClick={() => {
            setLeftSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        />
      </div>
      <Footer />
      <BusinessProfileForm 
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        user={user}
        onSubmit={handleBusinessProfileUpdate}
        updateSuccess={updateSuccess}
      />
    </>
  );
};

export default PerfilUsuario;
