import React from 'react';
import FeaturedItems from './FeaturedItems';
import PopularCategories from './PopularCategories';

export const ContentSidebar = ({ featured, discounted, popularCategories }) => {
  return (
    <aside className="content-sidebar">
      {discounted.length > 0 && (
        <div className="sidebar-section">
          <h3>Ofertas</h3>
          <FeaturedItems items={discounted} isOffer={true} />
        </div>
      )}
      
      <div className="sidebar-section">
        <h3>Destacados</h3>
        <FeaturedItems items={featured} />
      </div>

      <div className="sidebar-section">
        <h3>Categorías Populares</h3>
        <PopularCategories categories={popularCategories} />
      </div>
    </aside>
  );
};
