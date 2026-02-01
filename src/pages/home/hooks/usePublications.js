import { useState, useEffect } from 'react';
import { publicationsApi } from '../../../services/api';
import { useCallback } from 'react';

export const usePublications = () => {
  const [publications, setPublications] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [discounted, setDiscounted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPublications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [publicationsData, featuredData, discountedData] = await Promise.all([
        publicationsApi.getRecent(),
        publicationsApi.getFeatured(),
        publicationsApi.getDiscounted()
      ]);

      setPublications(publicationsData);
      setFeatured(featuredData);
      setDiscounted(discountedData);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  return {
    publications: { data: publications, isLoading },
    featured,
    discounted,
    refetch: fetchPublications
  };
};
