/* ========================================
   Creata - Badge Component
   ======================================== */

import { type ReactNode } from 'react';
import './Badge.css';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  const classNames = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    dot && 'badge--dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      <span className="badge__content">{children}</span>
    </span>
  );
}