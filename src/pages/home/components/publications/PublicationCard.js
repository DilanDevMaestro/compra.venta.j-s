import React from 'react';

export const PublicationCard = ({ publication, onClick }) => {
  return (
    <div className="publication-card" onClick={() => onClick(publication._id)}>
      {publication.imagenes?.[0] ? (
        <img 
          src={publication.imagenes[0].url} 
          alt={publication.nombre}
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
        />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}
      <div className="publication-info">
        <h3>{publication.nombre}</h3>
        <p className="price">${publication.precio?.toLocaleString()}</p>
        <span className="category-tag">{publication.categoria}</span>
      </div>
    </div>
  );
};

