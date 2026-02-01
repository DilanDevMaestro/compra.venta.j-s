import React from 'react';
import { CategoryCard } from './CategoryCard';

export const SecondaryCategories = ({ categories, onCategoryClick }) => {
  return (
    <div className="secondary-categories-grid">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={onCategoryClick}
          isMain={false}
        />
      ))}
    </div>
  );
};


