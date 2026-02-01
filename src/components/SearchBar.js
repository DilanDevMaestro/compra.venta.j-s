import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { publicationsApi } from '../services/api';

const SearchBar = ({ isMobile, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await publicationsApi.search(value);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (publication) => {
    setShowResults(false);
    setSearchTerm('');
    router.push(`/publicacion/${publication._id}`);
    if (isMobile && onClose) onClose();
  };

  return (
    <div className={`search-container ${isMobile ? 'mobile' : ''}`} ref={searchRef}>
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <FaTimes 
            className="clear-icon"
            onClick={() => {
              setSearchTerm('');
              setResults([]);
              setShowResults(false);
            }}
          />
        )}
        {isMobile && <FaTimes className="close-icon" onClick={onClose} />}
      </div>

      {showResults && (
        <div className="search-results">
          {isLoading ? (
            <div className="loading">Buscando...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item._id}
                className="result-item"
                onClick={() => handleResultClick(item)}
              >
                {item.imagenes?.[0] && (
                  <img src={item.imagenes[0].url} alt={item.nombre} />
                )}
                <div className="result-info">
                  <h4>{item.nombre}</h4>
                  <p className="price">${item.precio.toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No se encontraron resultados para "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
