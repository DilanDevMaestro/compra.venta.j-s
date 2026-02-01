import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FaChevronLeft, FaChevronRight, FaWhatsapp, FaHeart, FaRegHeart, FaLink } from 'react-icons/fa';
import { publicationsApi, userApi } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicationDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [publication, setPublication] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false); // Track if the publication is liked
  const [likes, setLikes] = useState(0);

  const fetchPublication = useCallback(async () => {
    try {
      const data = await publicationsApi.getById(id);
      setPublication(data);
      setIsLiked(data.isLiked);
      setLikes(data.likes);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPublication();
    }
  }, [id, fetchPublication]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === publication.imagenes.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? publication.imagenes.length - 1 : prev - 1
    );
  };

  const handleLike = async () => {
    try {
      // Call the API to update the like status on the server
      const response = await publicationsApi.likePublication(id, isLiked);
      setLikes(response.likes)
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking publication:', error);
      // If there's an error, revert the local like status
      setIsLiked(isLiked);
    }
  };

  const copyToClipboard = () => {
    const publicationUrl = `https://compra-venta-j-s.vercel.app/publicacion/${id}`;
    navigator.clipboard.writeText(publicationUrl)
      .then(() => {
        alert('Link copiado al portapapeles!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link to clipboard.');
      });
  };

  if (loading) return <div className="loading-spinner">Cargando...</div>;
  if (!publication) return <div>Publicación no encontrada</div>;

  return (
    <div className="publication-detail-page">
      <Header />
      <main className="publication-detail-container">
        <div className="publication-content">
          <div className="image-gallery-section">
            <div className="image-container">
              {publication.imagenes.length > 1 && (
                <button className="nav-button prev" onClick={handlePrevImage}>
                  <FaChevronLeft />
                </button>
              )}
              <img 
                src={publication.imagenes[currentImageIndex].url} 
                alt={publication.nombre}
              />
              {publication.imagenes.length > 1 && (
                <button className="nav-button next" onClick={handleNextImage}>
                  <FaChevronRight />
                </button>
              )}
            </div>
            {publication.imagenes.length > 1 && (
              <div className="thumbnail-container">
                {publication.imagenes.map((img, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={img.url} alt={`Miniatura ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="publication-info-section">
            <div className="main-info">
              <h1>{publication.nombre}</h1>
              <p className="price">${publication.precio.toLocaleString()}</p>
              <div className="product-status">
                <span className="status-tag">{publication.estado}</span>
                <span className="date">{publication.tiempoTranscurrido}</span>
              </div>
            </div>

            <div className="seller-info">
              <img src={publication.userPicture} alt={publication.userName} />
              <div>
                <h3>{publication.userName}</h3>
                <p>{publication.userEmail}</p>
              </div>
            </div>

            <div className="description-section">
              <h2>Descripción</h2>
              <p>{publication.descripcion}</p>
            </div>

            <div className="actions">
              <button
                className="like-button"
                onClick={handleLike}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                {likes || 0}
              </button>

              <button
                className="copy-link-button"
                onClick={copyToClipboard}
              >
                <FaLink />
                Copiar Link
              </button>
            </div>

            <a 
              href={`https://wa.me/${publication.whatsapp}?text=Hola, me interesa tu publicación de ${publication.nombre}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button"
            >
              <FaWhatsapp />
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicationDetail;
