import React, { useRef, useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const CurrencyQuotes = ({ quotes }) => {
  const [showModal, setShowModal] = useState(false);
  const quotesContainerRef = useRef(null);
  const [/*scrollPosition,*/ setScrollPosition] = useState(0);

  const shortenQuoteName = (name) => {
    const nameMap = {
      'Oficial': 'Oficial',
      'Blue': 'Blue',
      'Bolsa': 'MEP',
      'Contado con liquidación': 'CCL',
      'Mayorista': 'Mayor.',
      'Cripto': 'Cripto',
      'Tarjeta': 'Tarj.'
    };
    return nameMap[name] || name;
  };

  useEffect(() => {
    if (!quotesContainerRef.current || !quotes.length) return;

    const container = quotesContainerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    let currentPosition = 0;

    const scroll = () => {
      currentPosition += 1;
      if (currentPosition > scrollWidth - clientWidth) {
        currentPosition = 0;
      }
      container.scrollTo({ left: currentPosition, behavior: 'instant' });
    };

    const intervalId = setInterval(scroll, 50);
    return () => clearInterval(intervalId);
  }, [quotes]);

  return (
    <section className="currency-quotes-section">
      <div className="quotes-container" ref={quotesContainerRef}>
        {[...quotes, ...quotes].map((quote, index) => (
          <div key={`${quote.casa}-${index}`} className="quote-card">
            <h3>{shortenQuoteName(quote.nombre)}</h3>
            <div className="quote-values">
              <div className="quote-buy">
                <span>Compra</span>
                <strong>${quote.compra?.toFixed(0)}</strong>
              </div>
              <div className="quote-sell">
                <span>Venta</span>
                <strong>${quote.venta?.toFixed(0)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="mobile-quotes-button"
        onClick={() => setShowModal(true)}
      >
        Cotizaciones
      </button>

      {showModal && (
        <div className="quotes-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cotizaciones</h3>
              <button onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="quotes-grid">
              {quotes.map((quote) => (
                <div key={quote.casa} className="quote-card">
                  <h3>{quote.nombre}</h3>
                  <div className="quote-values">
                    <div className="quote-buy">
                      <span>Compra</span>
                      <strong>${quote.compra?.toFixed(2)}</strong>
                    </div>
                    <div className="quote-sell">
                      <span>Venta</span>
                      <strong>${quote.venta?.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CurrencyQuotes;
