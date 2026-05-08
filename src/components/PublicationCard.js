import React from 'react';
import { useRouter } from 'next/router';
import { FaEye, FaHeart } from 'react-icons/fa';

const PublicationCard = ({ publication }) => {
  const router = useRouter();

  const handleClick = () => {
    // If the publication is from a business profile, redirect to their profile
    if (publication.userBusinessProfile?.isActive) {
      router.push(`/perfil/${publication.userId}?highlightedPublication=${publication._id}`);
    } else {
      // For regular users, go to publication detail
      router.push(`/publicacion/${publication._id}`);
    }
  };

  return (
    <div className="publication-card" onClick={handleClick}>
      <div className="publication-image">
        <img src={publication.imagenes[0]?.url} alt={publication.nombre} />
        {publication.sold && <div className="sold-badge">Vendido</div>}
      </div>
      <div className="publication-info">
        <h3>{publication.nombre}</h3>
        <p className="price">${publication.precio.toLocaleString()}</p>
        <div className="publication-stats">
          <span><FaEye /> {publication.vistas || 0}</span>
          <span><FaHeart /> {publication.likes || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;
