/* ========================================
   Creata - Login Page
   ======================================== */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Input, Card } from '../components/ui';
import { useToastStore } from '../stores';
import './Login.css';

const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Formato de email inválido'),
  password: z.string().min(1, 'La contraseña es requerida').min(8, 'Mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading: authLoading } = useAuth();
  const { addToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      addToast({
        type: 'success',
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
      });
      navigate('/feed', { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      addToast({
        type: 'error',
        title: 'Error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting || isFormSubmitting;

  return (
    <div className="auth-page">
      <div className="auth-page__background">
        <div className="auth-page__orb auth-page__orb--1" aria-hidden="true" />
        <div className="auth-page__orb auth-page__orb--2" aria-hidden="true" />
        <div className="auth-page__orb auth-page__orb--3" aria-hidden="true" />
      </div>

      <main className="auth-page__main">
        <div className="auth-page__container">
          <div className="auth-page__header">
            <div className="auth-page__logo" aria-label="Creata">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect width="48" height="48" rx="12" className="auth-page__logo-bg" />
                <path
                  d="M24 12 L36 24 L24 36 L12 24 Z"
                  className="auth-page__logo-shape"
                />
                <circle cx="24" cy="24" r="6" className="auth-page__logo-dot" />
              </svg>
              <span className="auth-page__logo-text">Creata</span>
            </div>
            <h1 className="auth-page__title">Iniciar Sesión</h1>
            <p className="auth-page__subtitle">Bienvenido de nuevo a tu plataforma de creadores</p>
          </div>

          <Card variant="glass" padding="lg" className="auth-page__card">
            <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
              <div className="auth-page__field">
                <label htmlFor="email" className="auth-page__label">
                  Email
                </label>
                <div className="auth-page__input-wrapper">
                  <Mail className="auth-page__icon" aria-hidden="true" />
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    fullWidth
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="auth-page__field">
                <div className="auth-page__field-header">
                  <label htmlFor="password" className="auth-page__label">
                    Contraseña
                  </label>
                  <Link to="/forgot-password" className="auth-page__forgot-link">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="auth-page__input-wrapper">
                  <Lock className="auth-page__icon" aria-hidden="true" />
                  <Input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    fullWidth
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="auth-page__toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="auth-page__toggle-icon" /> : <Eye className="auth-page__toggle-icon" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="auth-page__submit-btn"
              >
                Iniciar Sesión
              </Button>
            </form>

            <div className="auth-page__divider">
              <span>o continúa con</span>
            </div>

            <div className="auth-page__social-buttons">
              <button
                type="button"
                className="auth-page__social-btn"
                disabled={isLoading}
                aria-label="Continuar con Google"
                onClick={loginWithGoogle}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="auth-page__social-btn"
                disabled={isLoading}
                aria-label="Continuar con GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
            </div>

            <p className="auth-page__footer">
              ¿No tienes cuenta? <Link to="/register" className="auth-page__link">Regístrate</Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}