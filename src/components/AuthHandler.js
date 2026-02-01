import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { config } from '../config/config';

const AuthHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code found');
        }

        // Enviar el código al backend
        const response = await fetch(`${config.API_URL}/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }

        const data = await response.json();
        
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/perfil');
        } else {
          throw new Error('Invalid response data');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?error=auth_failed');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="auth-loading">
      <h2>Procesando autenticación...</h2>
    </div>
  );
};

export default AuthHandler;
