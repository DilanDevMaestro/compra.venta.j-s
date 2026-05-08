import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicationsApi } from '../services/api';
import { getIconForCategory } from '../utils/categories';
import { FaTags } from 'react-icons/fa';

const CategoryPage = () => {
  const router = useRouter();
  const { categoryName } = router.query;
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesWithOffers, setCategoriesWithOffers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryName);

  useEffect(() => {
    if (categoryName) {
      setSelectedCategory(categoryName);
    }
  }, [categoryName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both publications and category counts
        const [publicationsData, categoriesData] = await Promise.all([
          publicationsApi.getByCategory(categoryName),
          publicationsApi.getCategoryCounts()
        ]);

        setPublications(publicationsData);
        setCategoriesWithOffers(
          Object.entries(categoriesData)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([name, count]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              offersCount: count
            }))
        );
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar las publicaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName]);

  return (
    <div className="category-page">
      <Header />
      <main className="category-content">
        <div className="ofertas-layout"> {/* Use the layout from OfertasPage */}
          <aside className="ofertas-sidebar"> {/* Use the sidebar from OfertasPage */}
            <div className="sidebar-section">
              <h3>Categorías con Publicaciones</h3>
              <div className="popular-categories">
                {categoriesWithOffers.map(cat => (
                  <button
                    key={cat.name}
                    className={`popular-category-btn ${selectedCategory === cat.name.toLowerCase() ? 'active' : ''}`}
                    onClick={() => router.push(`/categoria/${cat.name.toLowerCase()}`)}
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

          <section className="ofertas-main"> {/* Use the main section from OfertasPage */}
            <h2>{categoryName}</h2>
            {loading ? (
              <div className="loading">Cargando publicaciones...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <div className="ofertas-grid"> {/* Use the grid from OfertasPage */}
                {publications.map(pub => (
                  <div
                    key={pub._id}
                    className="oferta-card" // Use the card style from OfertasPage
                    onClick={() => navigate(`/publicacion/${pub._id}`)}
                  >
                    {pub.imagenes?.[0] && (
                      <img src={pub.imagenes[0].url} alt={pub.nombre} />
                    )}
                    <div className="oferta-info">
                      <h3>{pub.nombre}</h3>
                      <div className="price-info">
                        <span className="current-price">
                          ${pub.precio?.toLocaleString()}
                        </span>
                      </div>
                      <p className="category">{pub.categoria}</p>
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

export default CategoryPage;
