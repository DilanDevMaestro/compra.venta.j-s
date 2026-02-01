import React, { useState } from 'react';
import CurrencyQuoteCard from './CurrencyQuoteCard';
import { CurrencyQuotesModal } from './CurrencyQuotesModal';

export const CurrencyQuotes = ({ quotes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="currency-quotes-section">
      <div className="quotes-container">
        {quotes.map(quote => (
          <CurrencyQuoteCard key={quote.id} quote={quote} />
        ))}
      </div>
      <button 
        className="mobile-quotes-button" 
        onClick={() => setIsModalOpen(true)}
      >
        Ver cotizaciones
      </button>
      <CurrencyQuotesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quotes={quotes}
      />
    </section>
  );
};
