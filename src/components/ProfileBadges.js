import React from 'react';
import { FaTrophy, FaStar, FaMedal } from 'react-icons/fa';

const ProfileBadges = ({ stats }) => {
  const getBadges = () => {
    const badges = [];
    
    if (stats.totalSales >= 10) 
      badges.push({ icon: <FaTrophy />, name: 'Vendedor Experto', color: '#FFD700' });
    
    if (stats.totalViews >= 1000) 
      badges.push({ icon: <FaStar />, name: 'Popular', color: '#C0C0C0' });
    
    // Cambiar la lógica para la insignia de calificación
    // Solo mostrar si hay al menos 5 ventas y la calificación es alta
    if (stats.totalSales >= 5 && stats.averageRating >= 4.5) 
      badges.push({ icon: <FaMedal />, name: 'Alta Calificación', color: '#CD7F32' });

    return badges;
  };

  return (
    <div className="profile-badges">
      {getBadges().map((badge, index) => (
        <div 
          key={index} 
          className="badge"
          style={{ backgroundColor: badge.color + '20', color: badge.color }}
        >
          {badge.icon}
          <span>{badge.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ProfileBadges;
