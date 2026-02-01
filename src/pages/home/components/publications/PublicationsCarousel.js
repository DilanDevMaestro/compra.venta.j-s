import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { PublicationCard } from './PublicationCard'; // Agregadas las llaves para importación con nombre

export const PublicationsCarousel = ({ publications, isLoading }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) return <div className="loading">Cargando publicaciones...</div>;

  return (
    <div className="publications-carousel-section">
      <h2>Publicaciones Recientes</h2>
      <div className="carousel-controls">
        <button onClick={() => scroll('left')}>
          <FaChevronLeft />
        </button>
        <div className="publications-carousel" ref={carouselRef}>
          {publications.data.map(pub => (
            <PublicationCard key={pub._id} publication={pub} />
          ))}
        </div>
        <button onClick={() => scroll('right')}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};
