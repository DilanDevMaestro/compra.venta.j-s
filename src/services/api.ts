import axios from 'axios'
import { config } from '../config/config'

type PublicationImage = {
  url: string
}

type PublicationDto = {
  _id: string
  nombre: string
  precio: number
  categoria: string
  subcategoria?: string
  imagenes?: PublicationImage[]
  vistas?: number
  likes?: number
  createdAt?: string
}

type RecentResponse = {
  publications: PublicationDto[]
  featured: PublicationDto[]
}

type UpdatePublicationInput = {
  precio?: number | string
  precioOriginal?: number | string
  descuento?: number | string
  subcategoria?: string
  [key: string]: unknown
}

type CommentInput = Record<string, unknown>

const authenticatedRequest = axios.create({
  baseURL: config.API_URL,
  withCredentials: true
})

const fetchConfig: RequestInit = {
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

const renewToken = async () => {
  const response = await fetch(`${config.API_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json()
  if (data.token) {
    localStorage.setItem('token', data.token)
    return data.token
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
  throw new Error('No se pudo renovar el token')
}

authenticatedRequest.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('token')
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`
    }
    return cfg
  },
  (error) => Promise.reject(error)
)

authenticatedRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const response = await fetch(`${config.API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) throw new Error('Error renovando token')

        const data = await response.json()
        localStorage.setItem('token', data.token)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return authenticatedRequest(originalRequest)
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/'
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    let error: unknown

    if (contentType && contentType.includes('application/json')) {
      error = await response.json()
    } else {
      error = await response.text()
    }

    if (response.status === 401 && (error as { error?: string })?.error === 'jwt expired') {
      const newToken = await renewToken()
      const retryResponse = await fetch(response.url, {
        headers: {
          Authorization: `Bearer ${newToken}`
        }
      })
      return handleResponse(retryResponse)
    }

    throw error
  }

  return response.json()
}

export const publicationsApi = {
  getRecent: async () => {
    try {
      const response = await fetch(`${config.API_URL}/publications/recent`)
      if (!response.ok) throw new Error('Error fetching publications')
      const data = (await response.json()) as RecentResponse

      return {
        recent: data.publications.map((pub: PublicationDto) => ({
          _id: pub._id,
          nombre: pub.nombre,
          precio: pub.precio,
          categoria: pub.categoria,
          subcategoria: pub.subcategoria,
          imagenes: pub.imagenes || [],
          vistas: pub.vistas || 0,
          likes: pub.likes || 0,
          createdAt: pub.createdAt
        })),
        featured: data.featured.map((pub: PublicationDto) => ({
          _id: pub._id,
          nombre: pub.nombre,
          precio: pub.precio,
          categoria: pub.categoria,
          subcategoria: pub.subcategoria,
          imagenes: pub.imagenes || [],
          vistas: pub.vistas || 0,
          likes: pub.likes || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching publications:', error)
      return { recent: [], featured: [] }
    }
  },

  getByCategory: async (category: string, subcategory?: string) => {
    const params = new URLSearchParams()
    if (subcategory) {
      params.set('subcategoria', subcategory)
    }
    const suffix = params.toString() ? `?${params.toString()}` : ''
    const response = await fetch(`${config.API_URL}/publications/category/${category}${suffix}`, fetchConfig)
    return handleResponse(response)
  },

  getById: async (id: string) => {
    const response = await fetch(`${config.API_URL}/publications/${id}`, fetchConfig)
    return handleResponse(response)
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${config.API_URL}/publications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(errorData)
    }

    return response.json()
  },

  getUserPublications: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${config.API_URL}/publications/mis-publicaciones`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    return handleResponse(response)
  },

  delete: async (id: string) => {
    const response = await fetch(`${config.API_URL}/publications/${id}`, {
      method: 'DELETE',
      ...fetchConfig,
      headers: {
        ...(fetchConfig.headers as Record<string, string>),
        ...getAuthHeaders()
      }
    })
    return handleResponse(response)
  },

  update: async (id: string, data: UpdatePublicationInput) => {
    const formattedData = {
      ...data,
      precio: Number(data.precio) || 0,
      precioOriginal: Number(data.precioOriginal) || Number(data.precio) || 0,
      descuento: Number(data.descuento) || 0
    }

    const response = await fetch(`${config.API_URL}/publications/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData)
    })
    return handleResponse(response)
  },

  incrementViews: async (id: string) => {
    const response = await fetch(`${config.API_URL}/publications/${id}/view`, {
      method: 'POST',
      ...fetchConfig,
      headers: {
        ...(fetchConfig.headers as Record<string, string>),
        ...getAuthHeaders()
      }
    })
    return handleResponse(response)
  },

  getComments: async (publicationId: string) => {
    const response = await fetch(`${config.API_URL}/publications/${publicationId}/comments`, fetchConfig)
    return handleResponse(response)
  },

  addComment: async (publicationId: string, commentData: CommentInput) => {
    const response = await fetch(`${config.API_URL}/publications/${publicationId}/comments`, {
      method: 'POST',
      ...fetchConfig,
      headers: {
        ...(fetchConfig.headers as Record<string, string>),
        ...getAuthHeaders()
      },
      body: JSON.stringify(commentData)
    })
    return handleResponse(response)
  },

  getCategoryCounts: async () => {
    const response = await fetch(`${config.API_URL}/publications/category-counts`, fetchConfig)
    return handleResponse(response)
  },

  getDiscounted: async () => {
    try {
      const response = await fetch(`${config.API_URL}/publications/discounted`)
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    } catch (error) {
      console.error('Error fetching discounted publications:', error)
      return []
    }
  },

  search: async (query: string) => {
    try {
      const response = await fetch(`${config.API_URL}/publications/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Error en la búsqueda')
      return response.json()
    } catch (error) {
      console.error('Error en búsqueda:', error)
      return []
    }
  },

  likePublication: async (id: string, isLiked: boolean) => {
    const response = await fetch(`${config.API_URL}/publications/${id}/like`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ liked: !isLiked })
    })

    if (response.status === 401) {
      return { unauthorized: true }
    }

    const data = await response.json()
    return data
  }
}

export const currencyApi = {
  getQuotes: async () => {
    const response = await fetch(`${config.API_URL}/currency/quotes`, {
      ...fetchConfig,
      headers: {
        ...(fetchConfig.headers as Record<string, string>)
      }
    })
    return handleResponse(response)
  }
}

export const graphQLApi = {
  query: async (query: string, variables: Record<string, unknown> = {}) => {
    const response = await fetch(`${config.API_URL}/graphql`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: JSON.stringify({ query, variables })
    })
    return handleResponse(response)
  }
}

export const userApi = {
  getProfile: async () => {
    const response = await authenticatedRequest.get('/users/profile')
    return response.data
  },

  updateBusinessProfile: async (formData: FormData) => {
    const response = await authenticatedRequest.post('/users/update-business-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data?.success) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = {
        ...currentUser,
        businessProfile: response.data.businessProfile
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    return response.data
  }
}

export const searchApi = {
  search: async (query: string) => {
    const response = await fetch(`${config.API_URL}/publications/search?q=${query}`, fetchConfig)
    return handleResponse(response)
  }
}

export const authApi = {
  initiateGoogleAuth: () => {
    window.location.href = `${config.API_URL}/auth/google`
  },

  verifyAuth: async (token: string) => {
    const response = await fetch(`${config.API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ t: token, token })
    })
    return response.json()
  }
}
