import React from 'react';

export const CurrencyQuoteCard = ({ quote }) => {
  return (
    <div className="quote-card">
      <h3>{quote.currency}</h3>
      <div className="quote-values">
        <div className="quote-buy">
          <span>Compra</span>
          <strong>{quote.buy}</strong>
        </div>
        <div className="quote-sell">
          <span>Venta</span>
          <strong>{quote.sell}</strong>
        </div>
      </div>
    </div>
  );
};

export default CurrencyQuoteCard;

