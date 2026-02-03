import { config } from '../config/config'
import storage from './storage'

export const loginWithGoogle = (): void => {
  window.location.href = `${config.API_URL}/auth/google`
}

// Handle auth callback: verify token with backend and store only user
export const handleAuthCallback = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${config.API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token })
    })

    if (!response.ok) return false

    const data = await response.json()
    if (data.user) {
      if (data.token) storage.setToken(data.token)
      storage.setUser(data.user)
      return true
    }

    return false
  } catch (e) {
    console.error('handleAuthCallback error', e)
    return false
  }
}

// Fetch user data using cookie-backed auth (no token in header)
export const fetchUserData = async (): Promise<Record<string, unknown> | null> => {
  try {
    const token = storage.getToken()
    const response = await fetch(`${config.API_URL}/auth/user`, { credentials: 'include' })
    if (!response.ok && token) {
      const retry = await fetch(`${config.API_URL}/auth/user`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!retry.ok) return null
      const userData = await retry.json()
      storage.setUser(userData)
      return userData
    }
    if (!response.ok) return null
    const userData = await response.json()
    storage.setUser(userData)
    return userData
  } catch (e) {
    console.error('fetchUserData error', e)
    return null
  }
}

export const checkAuthStatus = async (): Promise<Record<string, unknown> | null> => {
  try {
    const token = storage.getToken()
    const response = await fetch(`${config.API_URL}/auth/user`, { credentials: 'include' })
    if (!response.ok && token) {
      const retry = await fetch(`${config.API_URL}/auth/user`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!retry.ok) return null
      return retry.json()
    }
    if (!response.ok) return null
    return response.json()
  } catch (e) {
    console.error('checkAuthStatus error', e)
    return null
  }
}

export const logout = async (): Promise<void> => {
  try {
    await fetch(`${config.API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
    localStorage.removeItem('user')
    window.location.href = '/'
  } catch (e) {
    console.error('logout error', e)
  }
}
