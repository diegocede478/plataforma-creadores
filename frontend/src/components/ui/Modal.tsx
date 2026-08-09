/* ========================================
   Creata - Modal Component
   ======================================== */

import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useModalStore } from '../../stores';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    const handleOverlayClick = (e: MouseEvent) => {
      if (closeOnOverlayClick && e.target === overlayRef.current) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    overlayRef.current?.addEventListener('click', handleOverlayClick);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      overlayRef.current?.removeEventListener('click', handleOverlayClick);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnOverlayClick, closeOnEscape]);

  if (!isOpen) return null;

  const classNames = [
    'modal',
    `modal--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const modalContent = (
    <div
      ref={overlayRef}
      className="modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={contentRef}
        className={classNames}
        role="document"
      >
        {(title || showCloseButton) && (
          <header className="modal__header">
            {title && <h2 id="modal-title" className="modal__title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </header>
        )}
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const { isOpen, content, size, closeModal } = useModalStore();

  return (
    <>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        size={size}
      >
        {content}
      </Modal>
    </>
  );
}