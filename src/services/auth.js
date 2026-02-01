import { config } from '../config/config';

export const loginWithGoogle = () => {
  window.location.href = `${config.API_URL}/auth/google`;
};

export const handleAuthCallback = async (token) => {
  try {
    const response = await fetch(`${config.API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      throw new Error('Error en la verificación');
    }
    
    const data = await response.json();
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error en handleAuthCallback:', error);
    return false;
  }
};

export const fetchUserData = async (token) => {
  try {
    console.log('Obteniendo datos del usuario...');
    const response = await fetch(`${config.API_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const userData = await response.json();
    console.log('Datos de usuario recibidos:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await fetch(`${config.API_URL}/auth/user`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('No autenticado');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
