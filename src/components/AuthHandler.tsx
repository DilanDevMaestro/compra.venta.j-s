import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { config } from '../config/config'

export function AuthHandler() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search)
        const tokenParam = searchParams.get('t')
        const code = searchParams.get('code')

        if (!tokenParam && !code) {
          throw new Error('No authorization data found')
        }

        const response = await fetch(
          tokenParam ? `${config.API_URL}/auth/verify` : `${config.API_URL}/auth/google/callback`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(tokenParam ? { t: tokenParam } : { code })
          }
        )

        if (!response.ok) {
          throw new Error('Failed to authenticate')
        }

        const data = await response.json()
        if (data.token && data.user) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          navigate('/perfil', { replace: true })
          return
        }

        throw new Error('Invalid response data')
      } catch (err) {
        console.error('Authentication error:', err)
        setError('No se pudo completar la autenticación.')
        navigate('/', { replace: true })
      }
    }

    handleAuth()
  }, [navigate])

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-xs text-muted">
      {error || 'Procesando autenticación...'}
    </div>
  )
}
