import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicationsApi } from '../services/api';
import { FaTags } from 'react-icons/fa';
import { getIconForCategory } from '../utils/categories';

const OfertasPage = () => {
  const router = useRouter();
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesWithOffers, setCategoriesWithOffers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [filteredOfertas, setFilteredOfertas] = useState([]);
  const [bannerData, setBannerData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Solo obtenemos las ofertas y categorías, ignoramos los banners por ahora
        const [offersData, categoriesData] = await Promise.all([
          publicationsApi.getDiscounted(),
          publicationsApi.getCategoryCounts() // Usamos getCategoryCounts en su lugar
        ]);

        setOfertas(offersData);
        
        // Procesamos las categorías para mostrar solo las que tienen ofertas
        const categoriesWithDiscounts = {};
        offersData.forEach(offer => {
          const category = offer.categoria.toLowerCase();
          categoriesWithDiscounts[category] = (categoriesWithDiscounts[category] || 0) + 1;
        });
        
        setCategoriesWithOffers(
          Object.entries(categoriesWithDiscounts).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            offersCount: count
          }))
        );
        
        setFilteredOfertas(offersData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'todas') {
      setFilteredOfertas(ofertas);
    } else {
      const filtered = ofertas.filter(oferta => 
        oferta.categoria.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredOfertas(filtered);
    }
  }, [selectedCategory, ofertas]);

  const handlePublicationClick = (publicationId) => {
    router.push(`/publicacion/${publicationId}`);
  };

  return (
    <div className="ofertas-page">
      <Header />
      
      <main className="ofertas-content">
        <div className="ofertas-layout">
          <aside className="ofertas-sidebar">
            <div className="sidebar-section">
              <h3>Categorías con Ofertas</h3>
              <div className="popular-categories">
                <button
                  className={`popular-category-btn ${selectedCategory === 'todas' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('todas')}
                >
                  <span className="category-icon"><FaTags /></span>
                  <span>Todas las ofertas</span>
                  <span className="category-count">{ofertas.length}</span>
                </button>

                {categoriesWithOffers.map(cat => (
                  <button
                    key={cat.name}
                    className={`popular-category-btn ${selectedCategory === cat.name.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.name.toLowerCase())}
                  >
                    <span className="category-icon">
                      {React.createElement(getIconForCategory(cat.name))}
                    </span>
                    <span>{cat.name}</span>
                    <span className="category-count">{cat.offersCount}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="ofertas-main">
            <h2>{selectedCategory === 'todas' ? 'Todas las Ofertas' : `Ofertas en ${selectedCategory}`}</h2>
            
            {loading ? (
              <div className="loading">Cargando ofertas...</div>
            ) : (
              <div className="ofertas-grid">
                {filteredOfertas.map(oferta => (
                  <div 
                    key={oferta._id} 
                    className="oferta-card"
                    onClick={() => handlePublicationClick(oferta._id)}
                  >
                    {oferta.imagenes?.[0] && (
                      <img src={oferta.imagenes[0].url} alt={oferta.nombre} />
                    )}
                    <div className="oferta-info">
                      <h3>{oferta.nombre}</h3>
                      <div className="price-info">
                        <span className="original-price">
                          ${oferta.precioOriginal?.toLocaleString()}
                        </span>
                        <span className="current-price">
                          ${oferta.precio?.toLocaleString()}
                        </span>
                        <span className="discount-badge">
                          -{oferta.descuento}%
                        </span>
                      </div>
                      <p className="category">{oferta.categoria}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OfertasPage;
