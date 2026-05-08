import React from 'react';
import { loginWithGoogle } from '../services/auth';

const LoginButton = ({ user, onLogout }) => {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
    }
  };

  if (user) {
    return (
      <div className="user-info">
        <img 
          src={user.picture} 
          alt={user.name} 
          className="profile-pic"
        />
        <button onClick={onLogout} className="login-button">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="login-button">
      Iniciar con Google
    </button>
  );
};

export default LoginButton;
