import { config } from '../config/config';
import axios from 'axios';

// Crear instancia de axios con configuración base
const authenticatedRequest = axios.create({
  baseURL: config.API_URL,
  withCredentials: true
});

// Configuración común para fetch
const fetchConfig = {
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
};

// Función helper para obtener headers con autorización
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Función para renovar el token
const renewToken = async () => {
  try {
    const response = await fetch(`${config.API_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      return data.token;
    }
    throw new Error('No se pudo renovar el token');
  } catch (error) {
    console.error('Error renovando token:', error);
    // Si no se puede renovar el token, redirigir al login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  }
};

// Interceptor para manejar errores de autenticación
authenticatedRequest.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

authenticatedRequest.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Intentar renovar el token
        const response = await fetch(`${config.API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Error renovando token');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        
        return authenticatedRequest(originalRequest);
      } catch (error) {
        // Si falla la renovación, limpiar el almacenamiento y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Función helper mejorada para manejar respuestas
const handleResponse = async (response) => {
  try {
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let error;
      
      if (contentType && contentType.includes('application/json')) {
        error = await response.json();
      } else {
        error = await response.text();
      }
      
      if (response.status === 401 && error.error === 'jwt expired') {
        // Intentar renovar el token
        const newToken = await renewToken();
        // Reintentar la petición original con el nuevo token
        const retryResponse = await fetch(response.url, {
          ...response.clone().options,
          headers: {
            ...response.clone().headers,
            'Authorization': `Bearer ${newToken}`
          }
        });
        return handleResponse(retryResponse);
      }
      
      throw error;
    }
    return await response.json();
  } catch (error) {
    console.error('Error en respuesta:', error);
    throw error;
  }
};

// Modificar las funciones existentes para usar el nuevo helper
export const publicationsApi = {
  getRecent: async () => {
    try {
      const response = await fetch(`${config.API_URL}/publications/recent`);
      if (!response.ok) throw new Error('Error fetching publications');
      
      const data = await response.json();
      console.log('Datos recibidos de publicaciones:', data);

      return {
        recent: data.publications.map(pub => ({
          _id: pub._id,
          nombre: pub.nombre,
          precio: pub.precio,
          categoria: pub.categoria,
          imagenes: pub.imagenes || [],
          vistas: pub.vistas || 0,
          likes: pub.likes || 0,
          createdAt: pub.createdAt
        })),
        featured: data.featured.map(pub => ({
          _id: pub._id,
          nombre: pub.nombre,
          precio: pub.precio,
          categoria: pub.categoria,
          imagenes: pub.imagenes || [],
          vistas: pub.vistas || 0,
          likes: pub.likes || 0
        }))};
    } catch (error) {
      console.error('Error fetching publications:', error);
      return { recent: [], featured: [] };
    }
  },

  // Obtener publicaciones por categoría
  getByCategory: async (category) => {
    console.log('Fetching from:', `${config.API_URL}/publications/category/${category}`); // Agregar log para debug
    const response = await fetch(`${config.API_URL}/publications/category/${category}`, fetchConfig);
    return handleResponse(response);
  },

  // Obtener publicación por ID
  getById: async (id) => {
    const response = await fetch(`${config.API_URL}/publications/${id}`, fetchConfig);
    return handleResponse(response);
  },

  // Crear nueva publicación
  create: async (formData) => {
    try {
      // Log para debug
      console.log('Enviando formData:', {
        nombre: formData.get('nombre'),
        categoria: formData.get('categoria'),
        imagenes: formData.getAll('imagenes')
      });

      const response = await fetch(`${config.API_URL}/publications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // No incluir Content-Type, dejarlo automático para FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Obtener publicaciones del usuario
  getUserPublications: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/publications/mis-publicaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      if (error.error === 'jwt expired') {
        // El interceptor manejará la renovación del token
        return publicationsApi.getUserPublications();
      }
      throw error;
    }
  },

  // Eliminar publicación
  delete: async (id) => {
    const response = await fetch(`${config.API_URL}/publications/${id}`, {
      method: 'DELETE',
      ...fetchConfig,
      headers: {
        ...fetchConfig.headers,
        ...getAuthHeaders()
      }
    });
    return handleResponse(response);
  },

  // Actualizar publicación
  update: async (id, data) => {
    try {
      // Asegurarse de que los campos numéricos sean números válidos
      const formattedData = {
        ...data,
        precio: Number(data.precio) || 0,
        precioOriginal: Number(data.precioOriginal) || Number(data.precio) || 0,
        descuento: Number(data.descuento) || 0
      };

      const response = await fetch(`${config.API_URL}/publications/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Incrementar vistas
  incrementViews: async (id) => {
    const response = await fetch(`${config.API_URL}/publications/${id}/view`, {
      method: 'POST',
      ...fetchConfig,
      headers: {
        ...fetchConfig.headers,
        ...getAuthHeaders()
      }
    });
    return handleResponse(response);
  },

  // Obtener comentarios de una publicación
  getComments: async (publicationId) => {
    const response = await fetch(`${config.API_URL}/publications/${publicationId}/comments`, fetchConfig);
    return handleResponse(response);
  },

  // Agregar comentario a una publicación
  addComment: async (publicationId, commentData) => {
    const response = await fetch(`${config.API_URL}/publications/${publicationId}/comments`, {
      method: 'POST',
      ...fetchConfig,
      headers: {
        ...fetchConfig.headers,
        ...getAuthHeaders()
      },
      body: JSON.stringify(commentData)
    });
    return handleResponse(response);
  },

  // Agregar nuevo método para obtener conteo por categorías
  getCategoryCounts: async () => {
    const response = await fetch(`${config.API_URL}/publications/category-counts`, fetchConfig);
    return handleResponse(response);
  },

  // Obtener publicaciones con descuento
  getDiscounted: async () => {
    try {
      const response = await fetch(`${config.API_URL}/publications/discounted`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching discounted publications:', error);
      return [];
    }
  },

  // Búsqueda de publicaciones
  search: async (query) => {
    try {
      const response = await fetch(`${config.API_URL}/publications/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error en la búsqueda');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  },

  // Like a publication
  likePublication: async (id, isLiked) => {
    try {
      const response = await authenticatedRequest.post(`/publications/${id}/like`, { liked: !isLiked });
      return response.data;
    } catch (error) {
      console.error('Error liking publication:', error);
      throw error;
    }
  },
};

// Servicios de cotizaciones
export const currencyApi = {
  // Obtener cotizaciones
  getQuotes: async () => {
    const response = await fetch(`${config.API_URL}/currency/quotes`, {
      ...fetchConfig,
      headers: {
        ...fetchConfig.headers
      }
    });
    return handleResponse(response);
  }
};

// Nuevo helper para consultas GraphQL
export const graphQLApi = {
  query: async (query, variables = {}) => {
    const response = await fetch(`${config.API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ query, variables })
    });
    return handleResponse(response);
  }
};

// Servicios de usuario
export const userApi = {
  getProfile: async () => {
    try {
      const response = await authenticatedRequest.get('/users/profile');
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateBusinessProfile: async (formData) => {
    try {
      const response = await authenticatedRequest.post('/users/update-business-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        // Actualizar el localStorage con los nuevos datos
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = {
          ...currentUser,
          businessProfile: response.data.businessProfile
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  }
};

// Servicios de búsqueda
export const searchApi = {
  search: async (query) => {
    const response = await fetch(`${config.API_URL}/publications/search?q=${query}`, fetchConfig);
    return handleResponse(response);
  }
};

// Servicios de autenticación
export const authApi = {
  initiateGoogleAuth: () => {
    // En lugar de abrir un popup, redirigir directamente
    window.location.href = `${config.API_URL}/auth/google`;
  },

  verifyAuth: async (token) => {
    const response = await fetch(`${config.API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    return response.json();
  }
};
