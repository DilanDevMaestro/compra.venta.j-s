import React, { useState, useMemo } from 'react';
import { FaSort, FaFilter, FaFire, FaClock, FaDollarSign, FaChartLine } from 'react-icons/fa';
import PublicationCard from '../PublicationCard'; // Cambiamos temporalmente a usar PublicationCard

const sortOptions = [
  { value: 'recent', label: 'Más recientes', icon: '🕒' },
  { value: 'popular', label: 'Más populares', icon: '🔥' },
  { value: 'price-high', label: 'Mayor precio', icon: '💰' },
  { value: 'price-low', label: 'Menor precio', icon: '💸' }
];

const UserPublications = ({ publications, onSort, onFilter }) => {
  const [sortOption, setSortOption] = useState('recent');
  const [filterActive, setFilterActive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filtrar publicaciones según el filtro seleccionado
  const filteredPublications = useMemo(() => {
    switch (selectedFilter) {
      case 'active':
        return publications.filter(pub => pub.activo === true && !pub.sold);
      case 'recent':
        return [...publications].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 10); // últimas 10 publicaciones
      case 'price':
        return [...publications].sort((a, b) => b.precio - a.precio);
      default: // 'all'
        return publications;
    }
  }, [publications, selectedFilter]);

  const handleSort = (option) => {
    setSortOption(option);
    onSort(option);
  };

  const handleFilter = (filter) => {
    setSelectedFilter(filter);
  };

  const filters = [
    { key: 'all', label: 'Todas', icon: <FaChartLine /> },
    { key: 'active', label: 'Activas', icon: <FaFire /> },
    { key: 'recent', label: 'Recientes', icon: <FaClock /> },
    { key: 'price', label: 'Por precio', icon: <FaDollarSign /> }
  ];

  return (
    <div className="user-publications">
      <div className="publications-header">
        <h2>Publicaciones</h2>
        <div className="publications-controls">
          {/* 
          <div className="sort-control">
            <FaSort />
            <select 
              value={sortOption} 
              onChange={(e) => handleSort(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
          */}

          <button 
            className={`filter-button ${filterActive ? 'active' : ''}`}
            onClick={() => setFilterActive(!filterActive)}
          >
            <FaFilter />
            Filtrar
          </button>
        </div>
      </div>

      {filterActive && (
        <div className="filter-tags">
          {filters.map(({ key, label, icon }) => (
            <button 
              key={key}
              className={`filter-tag ${selectedFilter === key ? 'active' : ''}`}
              onClick={() => handleFilter(key)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="publications-grid-user">
        {filteredPublications.map(publication => (
          <PublicationCard // Usamos PublicationCard mientras arreglamos UserPublicationCard
            key={publication._id} 
            publication={publication}
          />
        ))}
      </div>
    </div>
  );
};

export default UserPublications;
