import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { config } from '../config/config'
import storage from '../services/storage'

export function AuthHandler() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const tokenParam =
          hashParams.get('t') || searchParams.get('t') || searchParams.get('token')
        const code = searchParams.get('code')

        if (!tokenParam && !code) {
          throw new Error('No authorization data found')
        }

        const referralRaw =
          typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('referralCode') : null
        const referralCode =
          referralRaw && referralRaw.trim() ? referralRaw.trim().slice(0, 64) : undefined

        const response = await fetch(
          tokenParam ? `${config.API_URL}/auth/verify` : `${config.API_URL}/auth/google/callback`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
              tokenParam
                ? { t: tokenParam, token: tokenParam }
                : { code, ...(referralCode ? { referralCode } : {}) }
            )
          }
        )

        if (!response.ok) {
          throw new Error('Failed to authenticate')
        }

        const data = await response.json()
        if (data.user) {
          storage.removeToken()
          storage.setUser(data.user)
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }
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
