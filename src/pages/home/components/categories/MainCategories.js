import React from 'react';
import { CategoryCard } from './CategoryCard';

export const MainCategories = ({ categories, onCategoryClick }) => {
  return (
    <div className="main-categories-section">
      <h2>Categorías Principales</h2>
      <div className="main-categories-grid">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={onCategoryClick}
            isMain={true}
          />
        ))}
      </div>
    </div>
  );
};
