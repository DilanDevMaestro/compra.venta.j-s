import React from 'react';

export const CategoryCard = ({ category, onClick, isMain }) => {
  return (
    <div 
      className={`category-card ${isMain ? 'main' : 'secondary'}`}
      onClick={() => onClick(category.name)}
    >
      <div className="category-icon">{category.icon}</div>
      <div className="category-info">
        <h3>{category.name}</h3>
        <p>{category.count} publicaciones</p>
      </div>
    </div>
  );
};

export default CategoryCard;


