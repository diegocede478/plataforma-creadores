/* ========================================
   Creata - Button Component
   ======================================== */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const classNames = [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      fullWidth && 'btn--full',
      isLoading && 'btn--loading',
      disabled && 'btn--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="btn__spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        ) : (
          <>
            {leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>}
            <span className="btn__content">{children}</span>
            {rightIcon && <span className="btn__icon btn__icon--right">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';