import React from 'react';
import { FaEdit } from 'react-icons/fa';

const RightSidebar = ({ user, onEditProfile }) => {
  return (
    <div className="sidebar right-sidebar">
      <div className="edit-profile-section">
        <button className="edit-profile-btn" onClick={onEditProfile}>
          <FaEdit />
          {user?.businessProfile?.isActive 
            ? 'Editar Perfil Empresa' 
            : 'Actualizar a Perfil Empresa'
          }
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
