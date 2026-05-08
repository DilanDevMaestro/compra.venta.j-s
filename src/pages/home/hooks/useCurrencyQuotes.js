import { useState, useEffect } from 'react';
import { currencyApi } from '../../../services/api';

export const useCurrencyQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await currencyApi.getQuotes();
        setQuotes(data);
      } catch (error) {
        console.error('Error loading quotes:', error);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  const openQuotesModal = () => setIsModalOpen(true);
  const closeQuotesModal = () => setIsModalOpen(false);

  return {
    quotes,
    isModalOpen,
    openQuotesModal,
    closeQuotesModal
  };
};
