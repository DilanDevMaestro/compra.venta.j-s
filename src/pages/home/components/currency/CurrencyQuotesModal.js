import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { CurrencyQuoteCard } from './CurrencyQuoteCard';

export const CurrencyQuotesModal = ({ isOpen, onClose, quotes }) => {
  if (!isOpen) return null;

  return (
    <div className="quotes-modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cotizaciones</h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="quotes-grid">
          {quotes.map(quote => (
            <CurrencyQuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      </div>
    </div>
  );
};

