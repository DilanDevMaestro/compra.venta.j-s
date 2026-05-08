import React from 'react';
import { useRouter } from 'next/router';

const FeaturedItems = ({ items, isOffer }) => {
  const router = useRouter();

  const handleClick = (item) => {
    router.push(`/publicacion/${item._id}`);
  };

  return (
    <div className="featured-items">
      {items.map(item => (
        <div key={item._id} className="featured-item" onClick={() => handleClick(item)}>
          {item.imagenes?.[0] && (
            <img src={item.imagenes[0].url} alt={item.nombre} />
          )}
          <div className="featured-info">
            <h4>{item.nombre}</h4>
            <div className="price-info">
              {isOffer && (
                <span className="original-price">
                  ${item.precioOriginal?.toLocaleString()}
                </span>
              )}
              <span className="current-price">
                ${item.precio?.toLocaleString()}
              </span>
              {isOffer && (
                <span className="discount-badge">
                  -{item.descuento}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedItems;
