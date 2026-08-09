/* ========================================
   Creata - Input Component
   ======================================== */

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const classNames = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full',
      error && 'input-wrapper--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classNames}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
          </label>
        )}
        <div className="input__container">
          {leftIcon && <span className="input__icon input__icon--left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className="input"
            aria-invalid={!!error}
            aria-describedby={errorId || hintId}
            {...props}
          />
          {rightIcon && <span className="input__icon input__icon--right">{rightIcon}</span>}
        </div>
        {error && (
          <p id={errorId} className="input__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="input__hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const classNames = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full',
      error && 'input-wrapper--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classNames}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
          </label>
        )}
        <div className="input__container input__container--textarea">
          <textarea
            ref={ref}
            id={inputId}
            className="input input--textarea"
            aria-invalid={!!error}
            aria-describedby={errorId || hintId}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="input__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="input__hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    const classNames = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full',
      error && 'input-wrapper--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classNames}>
        {label && (
          <label htmlFor={selectId} className="input__label">
            {label}
          </label>
        )}
        <div className="input__container">
          <select
            ref={ref}
            id={selectId}
            className="input input--select"
            aria-invalid={!!error}
            aria-describedby={errorId || hintId}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="input__chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {error && (
          <p id={errorId} className="input__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="input__hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';