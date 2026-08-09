/* ========================================
   Creata - Loading Components (Spinner & Skeleton)
   ======================================== */

import './Loading.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';
  label?: string;
}

export function Spinner({
  size = 'md',
  color = 'primary',
  label,
}: SpinnerProps) {
  const classNames = [
    'spinner',
    `spinner--${size}`,
    `spinner--${color}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="spinner-wrapper" role="status">
      <div className={classNames} aria-hidden="true">
        <div className="spinner__bar" />
        <div className="spinner__bar" />
        <div className="spinner__bar" />
        <div className="spinner__bar" />
      </div>
      {label && <span className="spinner__label">{label}</span>}
    </div>
  );
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
}

export function Skeleton({
  width,
  height,
  radius,
  variant = 'rect',
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: variant === 'circle' ? '50%' : radius,
  };

  return (
    <div className={`skeleton skeleton--${variant} ${className}`} style={style} />
  );
}

export interface PageLoaderProps {
  fullScreen?: boolean;
  label?: string;
}

export function PageLoader({ fullScreen = false, label = 'Cargando...' }: PageLoaderProps) {
  const classNames = [
    'page-loader',
    fullScreen && 'page-loader--full',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <Spinner size="lg" color="primary" label={label} />
    </div>
  );
}

export interface SkeletonFeedProps {
  count?: number;
}

export function SkeletonFeed({ count = 3 }: SkeletonFeedProps) {
  return (
    <div className="skeleton-feed">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card glass">
          <div className="skeleton-card__header">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="skeleton-card__header-text">
              <Skeleton width={120} height={12} />
              <Skeleton width={80} height={10} />
            </div>
          </div>
          <Skeleton width="100%" height={12} />
          <Skeleton width="90%" height={12} />
          <Skeleton width="95%" height={200} radius="var(--radius-md)" />
        </div>
      ))}
    </div>
  );
}

export interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 4 }: SkeletonCardProps) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card glass">
          <div className="skeleton-card__header">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="skeleton-card__header-text">
              <Skeleton width={120} height={12} />
              <Skeleton width={80} height={10} />
            </div>
          </div>
          <Skeleton width="100%" height={14} />
          <Skeleton width="70%" height={14} />
          <div className="skeleton-card__footer">
            <Skeleton width={80} height={32} radius="var(--radius-md)" />
            <Skeleton width={60} height={32} radius="var(--radius-md)" />
          </div>
        </div>
      ))}
    </div>
  );
}