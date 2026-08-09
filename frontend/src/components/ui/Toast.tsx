/* ========================================
   Creata - Toast Component
   ======================================== */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToastStore } from '../../stores';
import './Toast.css';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose(id);
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  if (!isVisible) return null;

  const classNames = [
    'toast',
    `toast--${type}`,
    isExiting && 'toast--exiting',
  ]
    .filter(Boolean)
    .join(' ');

  const icons = {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="16 12 10 16 8 12" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  const toastContent = (
    <div
      className={classNames}
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(true)}
    >
      <div className="toast__icon" style={{ color: getIconColor(type) }}>
        {icons[type]}
      </div>
      <div className="toast__content">
        <h4 className="toast__title">{title}</h4>
        {message && <p className="toast__message">{message}</p>}
        {action && (
          <button
            className="toast__action"
            onClick={() => { action.onClick(); onClose(id); }}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        className="toast__close"
        onClick={() => onClose(id)}
        aria-label="Cerrar notificación"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="toast__progress" style={{ animationDuration: `${duration}ms` }} />
    </div>
  );

  return createPortal(toastContent, document.getElementById('toast-root') || document.body);
}

function getIconColor(type: ToastProps['type']): string {
  switch (type) {
    case 'success': return 'var(--color-success)';
    case 'error': return 'var(--color-error)';
    case 'warning': return 'var(--color-warning)';
    case 'info': return 'var(--color-info)';
  }
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div id="toast-root" className="toast-container" aria-live="polite" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}