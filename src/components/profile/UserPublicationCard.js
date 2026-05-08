import React from 'react';
import { useRouter } from 'next/router';
import { FaEye, FaHeart } from 'react-icons/fa';

const UserPublicationCard = ({ publication }) => {
  const router = useRouter();

  const handleClick = () => {
    if (publication.userBusinessProfile?.isActive) {
      router.push(`/perfil/${publication.userId}`);
    } else {
      router.push(`/publicacion/${publication._id}`);
    }
  };

  return (
    <div className="publication-card-user" onClick={handleClick}>
      <div className="publication-image-user">
        <img src={publication.imagenes[0]?.url} alt={publication.nombre} />
        {publication.sold && <div className="sold-badge">Vendido</div>}
      </div>
      <div className="publication-info-user">
        <h3>{publication.nombre}</h3>
        <p className="price">${publication.precio.toLocaleString()}</p>
        <div className="publication-stats-user">
          <span><FaEye /> {publication.vistas || 0}</span>
          <span><FaHeart /> {publication.likes || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default UserPublicationCard;
