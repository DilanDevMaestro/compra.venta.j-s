import { useState, useEffect } from 'react';
import { publicationsApi } from '../../../services/api';
import { mainCategories, secondaryCategories } from '../constants/categoriesList';

export const useCategories = () => {
  const [categories, setCategories] = useState({ main: mainCategories, secondary: secondaryCategories });
  const [popularCategories, setPopularCategories] = useState([]);

  const updateCategoriesWithCounts = (counts) => {
    // Actualizar categorías principales con conteos
    const updatedMain = mainCategories.map(cat => ({
      ...cat,
      count: counts[cat.id] || 0
    }));

    // Actualizar categorías secundarias con conteos
    const updatedSecondary = secondaryCategories.map(cat => ({
      ...cat,
      count: counts[cat.id] || 0
    }));

    // Actualizar el estado de las categorías
    setCategories({
      main: updatedMain,
      secondary: updatedSecondary
    });

    // Actualizar categorías populares
    const allCategories = [...updatedMain, ...updatedSecondary];
    const sorted = allCategories.sort((a, b) => (b.count || 0) - (a.count || 0));
    setPopularCategories(sorted.slice(0, 5));
  };

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const counts = await publicationsApi.getCategoryCounts();
        updateCategoriesWithCounts(counts);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    fetchCategoryCounts();
  }, []);

  return { categories, popularCategories };
};
