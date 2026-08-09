/* ========================================
   Creata - Card Component
   ======================================== */

import { type ReactNode, type ElementType } from 'react';
import './Card.css';

export interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'strong' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  as?: React.ElementType;
}

export function Card({
  children,
  variant = 'glass',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
  as: Component = 'div',
}: CardProps) {
  const classNames = [
    'card',
    `card--${variant}`,
    `card--p-${padding}`,
    hover && 'card--hover',
    onClick && 'card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={classNames}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </Component>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <header className={`card__header ${className}`}>
      <div className="card__header-content">{children}</div>
      {action && <div className="card__header-action">{action}</div>}
    </header>
  );
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`card__body ${className}`}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  divided?: boolean;
}

export function CardFooter({ children, className = '', divided = false }: CardFooterProps) {
  return (
    <footer className={`card__footer ${divided ? 'card__footer--divided' : ''} ${className}`}>
      {children}
    </footer>
  );
}