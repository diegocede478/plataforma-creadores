/* ========================================
   Creata - OAuth Callback Page
   Maneja el callback de Google OAuth
   ======================================== */

import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks';
import { Card } from '../components/ui';
import './AuthCallback.css';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(error === 'oauth_failed' ? 'Error en la autenticación con Google' : error);
        return;
      }

      if (!accessToken || !refreshToken) {
        setStatus('error');
        setErrorMessage('No se recibieron tokens de autenticación');
        return;
      }

      try {
        await handleOAuthCallback(accessToken, refreshToken);
        setStatus('success');
        // Redirigir al feed después de un breve delay para mostrar éxito
        setTimeout(() => navigate('/feed', { replace: true }), 1500);
      } catch (error: unknown) {
        setStatus('error');
        const message = error instanceof Error ? error.message : 'Error al procesar la autenticación';
        setErrorMessage(message);
      }
    };

    handleCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  if (status === 'loading') {
    return (
      <div className="auth-callback">
        <div className="auth-callback__background">
          <div className="auth-callback__orb auth-callback__orb--1" aria-hidden="true" />
          <div className="auth-callback__orb auth-callback__orb--2" aria-hidden="true" />
          <div className="auth-callback__orb auth-callback__orb--3" aria-hidden="true" />
        </div>

        <main className="auth-callback__main">
          <div className="auth-callback__container">
            <Card variant="glass" padding="xl" className="auth-callback__card">
              <div className="auth-callback__content">
                <div className="auth-callback__spinner">
                  <Loader2 className="auth-callback__loader" aria-hidden="true" />
                </div>
                <h1 className="auth-callback__title">Conectando con Google...</h1>
                <p className="auth-callback__subtitle">Por favor espera mientras completamos tu inicio de sesión</p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth-callback">
        <div className="auth-callback__background">
          <div className="auth-callback__orb auth-callback__orb--1" aria-hidden="true" />
          <div className="auth-callback__orb auth-callback__orb--2" aria-hidden="true" />
          <div className="auth-callback__orb auth-callback__orb--3" aria-hidden="true" />
        </div>

        <main className="auth-callback__main">
          <div className="auth-callback__container">
            <Card variant="glass" padding="xl" className="auth-callback__card">
              <div className="auth-callback__content">
                <div className="auth-callback__success-icon">
                  <CheckCircle className="auth-callback__success-check" aria-hidden="true" />
                </div>
                <h1 className="auth-callback__title">¡Bienvenido!</h1>
                <p className="auth-callback__subtitle">Has iniciado sesión correctamente. Redirigiendo...</p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-callback">
      <div className="auth-callback__background">
        <div className="auth-callback__orb auth-callback__orb--1" aria-hidden="true" />
        <div className="auth-callback__orb auth-callback__orb--2" aria-hidden="true" />
        <div className="auth-callback__orb auth-callback__orb--3" aria-hidden="true" />
      </div>

      <main className="auth-callback__main">
        <div className="auth-callback__container">
          <Card variant="glass" padding="xl" className="auth-callback__card">
            <div className="auth-callback__content">
              <div className="auth-callback__error-icon">
                <AlertCircle className="auth-callback__error-alert" aria-hidden="true" />
              </div>
              <h1 className="auth-callback__title">Error de autenticación</h1>
              <p className="auth-callback__subtitle auth-callback__error-message">{errorMessage}</p>
              <p className="auth-callback__subtitle">Por favor, intenta de nuevo o usa el inicio de sesión tradicional.</p>
              <a href="/login" className="auth-callback__retry-link">Volver al inicio de sesión</a>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';