import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CurrencyQuotes from '../components/home/CurrencyQuotes';
import { 
  FaCar, FaBuilding, FaBriefcase, FaTools, 
  FaTv, FaMobile, FaLaptop, FaCouch, FaTshirt,
  FaBaby, FaFootballBall, FaWrench, FaHammer,
  FaGuitar, FaDice, FaDog, FaBook, FaWineBottle,
  FaShip, FaTractor, FaHandshake, FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import cacheService from '../services/cacheService';
import { publicationsApi, currencyApi } from '../services/api';

// Importar todas las imágenes del directorio
function importAll(r) {
  return r.keys().map((key) => {
    const mod = r(key);
    return mod?.default || mod;
  });
}

// Importar todas las imágenes de la carpeta home-image-banner
const bannerImages = importAll(require.context('../image/home-image-banner', false, /\.(png|jpe?g|svg|webp)$/));

const mainCategories = [
  { id: 1, name: 'Automotores', icon: <FaCar />, count: 0 },
  { id: 2, name: 'Inmuebles', icon: <FaBuilding />, count: 0 },
  { id: 3, name: 'Empleos', icon: <FaBriefcase />, count: 0 },
  { id: 4, name: 'Servicios', icon: <FaTools />, count: 0 },
];

const secondaryCategories = [
  { id: 5, name: 'Electrodomésticos', icon: <FaTv />, count: 0 },
  { id: 6, name: 'Celulares y Telefonía', icon: <FaMobile />, count: 0 },
  { id: 7, name: 'Informática y Computación', icon: <FaLaptop /> },
  { id: 8, name: 'Muebles y Hogar', icon: <FaCouch /> },
  { id: 9, name: 'Indumentaria y Accesorios', icon: <FaTshirt /> },
  { id: 10, name: 'Bebés y Niños', icon: <FaBaby /> },
  { id: 11, name: 'Deportes y Recreación', icon: <FaFootballBall /> },
  { id: 12, name: 'Máquinas y Equipamiento', icon: <FaWrench /> },
  { id: 13, name: 'Ferretería y Construcción', icon: <FaHammer /> },
  { id: 14, name: 'Instrumentos musicales', icon: <FaGuitar /> },
  { id: 15, name: 'Hobbies y Coleccionables', icon: <FaDice /> },
  { id: 16, name: 'Animales y Mascotas', icon: <FaDog /> },
  { id: 17, name: 'Librería y Artículos escolares', icon: <FaBook /> },
  { id: 18, name: 'Alimentos, Bebidas y Afines', icon: <FaWineBottle /> },
  { id: 19, name: 'Náutica', icon: <FaShip /> },
  { id: 20, name: 'Agropecuarios', icon: <FaTractor /> },
  { id: 21, name: 'Negocios y Oportunidades', icon: <FaHandshake /> },
];

const Home = () => {
  // 1. Move updatePopularCategories to the top, before any useEffect
  const updatePopularCategories = React.useCallback((counts = {}) => {
    if (!counts || typeof counts !== 'object') return;

    const allCategories = [...mainCategories, ...secondaryCategories];
    const categoriesWithCounts = allCategories
      .map(category => ({
        ...category,
        count: counts[category.name.toLowerCase()?.trim()] || 0
      }))
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setPopularCategories(categoriesWithCounts);
  }, []);

  // 2. Clean up unused state variables
  const [loading, setLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recentPublications, setRecentPublications] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [popularCategories, setPopularCategories] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const publicationsScrollRef = useRef(null);
  const router = useRouter();
  const quotesContainerRef = useRef(null);
  const [discountedPublications, setDiscountedPublications] = useState([]);
  const isMounted = useRef(true);
  const [featuredPublications, setFeaturedPublications] = useState([]);

  // Añade esta línea cerca del inicio del componente, después de las declaraciones de estado
  const safeDiscounted = discountedPublications || [];

  // Agregar una bandera para controlar el montaje
  useEffect(() => {
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === null) {
      localStorage.setItem('darkMode', 'true');
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
      return;
    }

    const isDark = savedMode === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Modificar el efecto de carga de publicaciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await publicationsApi.getRecent();
        console.log('Datos obtenidos de la API:', data);
        
        if (data.recent && Array.isArray(data.recent)) {
          console.log('Estableciendo publicaciones recientes:', data.recent.length);
          setRecentPublications(data.recent);
        }
        
        if (data.featured && Array.isArray(data.featured)) {
          console.log('Estableciendo publicaciones destacadas:', data.featured.length);
          setFeaturedPublications(data.featured);
        }
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Optimizar fetchCategoryCounts
  useEffect(() => {
    const loadCategoryData = () => {
      const cachedCounts = cacheService.get('categoryCounts');
      if (cachedCounts) {
        setCategoryCounts(cachedCounts);
        updatePopularCategories(cachedCounts);
      }
    };

    const fetchCategoryCounts = async () => {
      if (!isMounted.current) return;
      try {
        const counts = await publicationsApi.getCategoryCounts();
        if (counts && typeof counts === 'object' && isMounted.current) {
          setCategoryCounts(counts);
          updatePopularCategories(counts);
          cacheService.set('categoryCounts', counts, 300000);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadCategoryData();
    const interval = setInterval(fetchCategoryCounts, 300000);
    return () => clearInterval(interval);
  }, [updatePopularCategories]);

  // Añadir efecto para cargar cotizaciones
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await currencyApi.getQuotes();
        setQuotes(data);
      } catch (error) {
        console.error('Error loading quotes:', error);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 1800000); // 30 minutos
    return () => clearInterval(interval);
  }, []);

  // Efecto para el scroll automático de cotizaciones
  useEffect(() => {
    if (!quotesContainerRef.current || !quotes.length) return;

    const container = quotesContainerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    const scroll = () => {
      setScrollPosition(prev => {
        const newPosition = prev + 1;
        if (newPosition > scrollWidth - clientWidth) {
          container.scrollTo({ left: 0, behavior: 'instant' });
          return 0;
        }
        container.scrollTo({ left: newPosition, behavior: 'instant' });
        return newPosition;
      });
    };

    const intervalId = setInterval(scroll, 50); // Velocidad del scroll

    return () => clearInterval(intervalId);
  }, [quotes]);

  // Modificar el useEffect para categoryCounts
  useEffect(() => {
    const loadCategoryData = () => {
      const cachedCounts = cacheService.get('categoryCounts');
      if (cachedCounts && typeof cachedCounts === 'object') {
        setCategoryCounts(cachedCounts);
        updatePopularCategories(cachedCounts);
      }
    };

    const fetchCategoryCounts = async () => {
      try {
        const counts = await publicationsApi.getCategoryCounts();
        if (counts && typeof counts === 'object') {
          const normalizedCounts = Object.entries(counts).reduce((acc, [key, value]) => {
            acc[key.toLowerCase().trim()] = value;
            return acc;
          }, {});
          
          setCategoryCounts(normalizedCounts);
          updatePopularCategories(normalizedCounts);
          cacheService.set('categoryCounts', normalizedCounts, 300);
        }
      } catch (error) {
        console.error('Error en conteo:', error);
      }
    };

    loadCategoryData();
    fetchCategoryCounts();

    const interval = setInterval(fetchCategoryCounts, 300000);
    return () => clearInterval(interval);
  }, [updatePopularCategories]);

  const handleCategoryClick = (categoryName) => {
    router.push(`/categoria/${categoryName.toLowerCase()}`);
  };

  const handlePublicationClick = (publicationId, isOffer = false) => {
    if (isOffer) {
      router.push('/ofertas');
    } else {
      router.push(`/publicacion/${publicationId}`);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleThemeChange = () => {
      const isDark = document.body.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };

    handleThemeChange();

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Efecto para sincronizar el tema con otros componentes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = () => {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(darkMode);
      if (darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función helper para formatear el conteo
  const formatCount = (categoryName) => {
    const count = categoryCounts[categoryName?.toLowerCase()];
    if (count === undefined) return '';
    if (count === 0) return 'Sin publicaciones';
    return count === 1 ? '1' : `${count}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === bannerImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollPublications = (direction) => {
    if (publicationsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      publicationsScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleImageClick = () => {
    setCurrentImageIndex((prev) => 
      prev === bannerImages.length - 1 ? 0 : prev + 1
    );
  };

  // Añadir efecto para cargar publicaciones con descuento
  useEffect(() => {
    const loadDiscountedPublications = () => {
      const cachedData = cacheService.get('discountedPublications');
      if (cachedData) {
        setDiscountedPublications(cachedData);
      }
    };

    const fetchDiscountedPublications = async () => {
      try {
        const data = await publicationsApi.getDiscounted(); // Necesitarás implementar este método
        if (Array.isArray(data)) {
          setDiscountedPublications(data);
          cacheService.set('discountedPublications', data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadDiscountedPublications();
    fetchDiscountedPublications();
  }, []);

  return (
    <div className="home custom-scroll">
      <Header />
      {/* Hero Section - Updated */}
      <section className="hero-carousel full-width">
        <div 
          className="carousel-images"
          onClick={handleImageClick}
        >
          {bannerImages.map((img, index) => {
            const src = typeof img === 'string' ? img : img?.src;
            if (!src) return null;
            return (
              <img
                key={index}
                src={src}
                alt={`Banner ${index + 1}`}
                className={index === currentImageIndex ? 'active' : ''}
                loading="lazy"
              />
            );
          })}
          <div className="carousel-indicators">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Replace old quotes section with new component */}
      <CurrencyQuotes quotes={quotes} />

      <main className="main-content full-width">
        <div className="content-layout">
          {/* Sidebar */}
          <aside className="content-sidebar">
            {safeDiscounted.length > 0 && (
              <div className="sidebar-section">
                <h3>Ofertas</h3>
                <div className="featured-items">
                  {safeDiscounted.slice(0, 4).map(pub => (
                    <div 
                      key={pub._id}
                      className="featured-item"
                      onClick={() => handlePublicationClick(pub._id, true)}  // Modificado aquí
                    >
                      {pub.imagenes?.[0] && (
                        <img src={pub.imagenes[0].url} alt={pub.nombre} />
                      )}
                      <div className="featured-info">
                        <h4>{pub.nombre}</h4>
                        <div className="price-info">
                          <span className="original-price">${pub.precioOriginal?.toLocaleString()}</span>
                          <span className="current-price">${pub.precio?.toLocaleString()}</span>
                          <span className="discount-badge">-{pub.descuento}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {discountedPublications.length > 4 && (
                  <button 
                    className="view-more-button"
                    onClick={() => router.push('/ofertas')}
                  >
                    Ver más ofertas
                  </button>
                )}
              </div>
            )}

            <div className="sidebar-section">
              <h3>Destacados</h3>
              <div className="featured-items">
                {Array.isArray(featuredPublications) && featuredPublications.map(pub => (
                  <div 
                    key={pub._id}
                    className="featured-item"
                    onClick={() => handlePublicationClick(pub._id)}
                  >
                    {pub.imagenes?.[0] && (
                      <img 
                        src={pub.imagenes[0].url} 
                        alt={pub.nombre}
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg'; // Proporciona una imagen por defecto
                        }}
                      />
                    )}
                    <div className="featured-info">
                      <h4>{pub.nombre}</h4>
                      <p className="featured-price">${pub.precio?.toLocaleString()}</p>
                      <span className="views-count">{pub.vistas} vistas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Categorías Populares</h3>
              <div className="popular-categories">
                {popularCategories.map(category => (
                  <button
                    key={category.id}
                    className="popular-category-btn"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="category-count">{formatCount(category.name)}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="main-area">
            <div className="main-categories-section">
              <h2>Categorías Principales</h2>
              <div className="main-categories-grid">
                {mainCategories.map(category => (
                  <div 
                    key={category.id} 
                    className="main-category-card"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <div className="category-icon">{category.icon}</div>
                    <div className="category-info">
                      <h3>{category.name}</h3>
                      <p>{formatCount(category.name)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="subcategories-button"
                onClick={() => setShowSubcategories(true)}
              >
                Ver todas las categorías
              </button>
            </div>

            {/* Modal de Subcategorías - Updated */}
            {showSubcategories && (
              <div 
                className="subcategories-modal"
                onClick={(e) => {
                  if (e.target.className === 'subcategories-modal') {
                    setShowSubcategories(false);
                  }
                }}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Todas las Categorías</h3>
                    <button 
                      className="close-button"
                      onClick={() => setShowSubcategories(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="subcategories-grid">
                    {secondaryCategories.map(category => (
                      <button
                        key={category.id}
                        className="subcategory-item"
                        onClick={() => {
                          handleCategoryClick(category.name);
                          setShowSubcategories(false);
                        }}
                      >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{formatCount(category.name)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ...rest of the component (publications carousel)... */}
            <div className="publications-carousel-section">
              <h2>Publicaciones Recientes</h2>
              <div className="carousel-controls">
                <button onClick={() => scrollPublications('left')}>
                  <FaChevronLeft />
                </button>
                <div className="publications-carousel" ref={publicationsScrollRef}>
                  {loading ? (
                    <div className="loading">Cargando publicaciones...</div>
                  ) : recentPublications.length > 0 ? (
                    recentPublications.map(pub => (
                      <div 
                        key={pub._id} 
                        className="publication-card"
                        onClick={() => handlePublicationClick(pub._id)}
                      >
                        {pub.imagenes?.[0] ? (
                          <img 
                            src={pub.imagenes[0].url} 
                            alt={pub.nombre}
                            onError={(e) => {
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                        ) : (
                          <div className="no-image">Sin imagen</div>
                        )}
                        <div className="publication-info">
                          <h3>{pub.nombre}</h3>
                          <p className="price">${pub.precio?.toLocaleString()}</p>
                          <span className="category-tag">{pub.categoria}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-publications">No hay publicaciones recientes</div>
                  )}
                </div>
                <button onClick={() => scrollPublications('right')}>
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer darkMode={isDarkMode} toggleTheme={() => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', String(newDarkMode));
        document.body.classList.toggle('dark-mode');
      }} />
    </div>
  );
};

export default Home;
