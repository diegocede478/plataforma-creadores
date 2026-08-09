/* ========================================
   Creata - Global Error Boundary & Handler
   ======================================== */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';
import { useToastStore } from '../stores';
import { Button, Card } from '../components/ui';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
  resetOnPropsChange?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.props.onError?.(error, errorInfo);
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasResetKeyChanged) {
        this.reset();
      }
    }

    if (this.state.hasError && this.props.resetOnPropsChange) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private reportError(error: Error, errorInfo: ErrorInfo | null): void {
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack } });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} onReset={this.reset} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  const { addToast } = useToastStore();

  const handleRetry = () => {
    addToast({
      type: 'info',
      title: 'Reintentando...',
      message: 'Recargando la aplicación',
    });
    onReset();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const isNetworkError = error instanceof TypeError && error.message.includes('Network');
  const isChunkLoadError = error?.name === 'ChunkLoadError' || error?.message?.includes('chunk');

  return (
    <div className="error-boundary">
      <div className="error-boundary__container">
        <div className="error-boundary__card glass">
          {isNetworkError ? (
            <>
              <WifiOff className="error-boundary__icon error-boundary__icon--network" />
              <h2 className="error-boundary__title">Sin conexión</h2>
              <p className="error-boundary__message">
                No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.
              </p>
            </>
          ) : isChunkLoadError ? (
            <>
              <RefreshCw className="error-boundary__icon error-boundary__icon--chunk" />
              <h2 className="error-boundary__title">Error de carga</h2>
              <p className="error-boundary__message">
                Hubo un problema al cargar los recursos de la aplicación. Esto suele solucionarse recargando la página.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="error-boundary__icon error-boundary__icon--generic" />
              <h2 className="error-boundary__title">Algo salió mal</h2>
              <p className="error-boundary__message">
                Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
              </p>
            </>
          )}

          <div className="error-boundary__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handleRetry}
              leftIcon={<RefreshCw size={18} />}
            >
              Reintentar
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReload}
              leftIcon={<Home size={18} />}
            >
              Recargar página
            </Button>
          </div>

          {import.meta.env.DEV && error && (
            <details className="error-boundary__details">
              <summary>Detalles técnicos (solo desarrollo)</summary>
              <pre className="error-boundary__stack">{error.stack}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// Higher-order component for wrapping pages
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for programmatically handling errors
export function useErrorHandler() {
  const { addToast } = useToastStore();

  const handleError = (error: unknown, context?: string) => {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const title = context ? `Error en ${context}` : 'Error';

    addToast({
      type: 'error',
      title,
      message,
    });

    if (import.meta.env.DEV) {
      console.error(`[${context || 'Error'}]:`, error);
    }
  };

  const handleAsyncError = <T,>(
    promise: Promise<T>,
    context?: string
  ): Promise<[T | null, Error | null]> => {
    return promise
      .then((result) => [result, null] as [T | null, Error | null])
      .catch((error) => {
        handleError(error, context);
        return [null, error instanceof Error ? error : new Error(String(error))] as [T | null, Error | null];
      });
  };

  return { handleError, handleAsyncError };
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers(): () => void {
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (import.meta.env.DEV) {
      console.error('Unhandled promise rejection:', event.reason);
    }
    event.preventDefault();
  };

  const handleError = (event: ErrorEvent) => {
    if (import.meta.env.DEV) {
      console.error('Global error:', event.error);
    }
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleError);

  return () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleError);
  };
}