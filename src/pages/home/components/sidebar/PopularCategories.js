import React from 'react';
import { useRouter } from 'next/router';

const PopularCategories = ({ categories }) => {
  const router = useRouter();

  const handleCategoryClick = (categoryName) => {
    router.push(`/categoria/${categoryName.toLowerCase()}`);
  };

  return (
    <div className="popular-categories">
      {categories.map(category => (
        <button
          key={category.id}
          className="popular-category-btn"
          onClick={() => handleCategoryClick(category.name)}
        >
          <span className="category-icon">{category.icon}</span>
          <span>{category.name}</span>
          <span className="category-count">{category.count}</span>
        </button>
      ))}
    </div>
  );
};

export default PopularCategories;
