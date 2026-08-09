/* ========================================
   Creata - Avatar Component
   ======================================== */

import { forwardRef, type ReactNode, type ReactElement, type CSSProperties, Children, isValidElement, cloneElement } from 'react';
import './Avatar.css';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  border?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      status,
      border = false,
      className = '',
      style,
    },
    ref
  ) => {
    const classNames = [
      'avatar',
      `avatar--${size}`,
      `avatar--${shape}`,
      border && 'avatar--border',
      status && `avatar--status-${status}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    const bgColor = name
      ? `hsl(${(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137) % 360}, 70%, 50%)`
      : 'var(--bg-active)';

    return (
      <div ref={ref} className={classNames} style={style}>
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="avatar__image"
            draggable="false"
          />
        ) : (
          <span className="avatar__fallback" style={{ background: bgColor }}>
            {initials}
          </span>
        )}
        {status && <span className="avatar__status" aria-label={status} />}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export function AvatarGroup({ children, max = 5, size = 'md', className = '' }: AvatarGroupProps) {
  const childArray = Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className={`avatar-group ${className}`} style={{ '--avatar-size': getSizeValue(size) } as CSSProperties}>
      <div className="avatar-group__stack">
        {visibleChildren.map((child, index) =>
          isValidElement(child) ? (
            cloneElement(child as ReactElement<AvatarProps>, {
              key: index,
              size,
              className: `avatar-group__item ${(child.props as AvatarProps).className || ''}`,
              style: {
                ...(child.props as AvatarProps).style,
                zIndex: max - index,
              } as CSSProperties,
            })
          ) : (
            <span key={index}>{child}</span>
          )
        )}
        {remainingCount > 0 && (
          <div
            className="avatar-group__more"
            style={{ fontSize: getFontSize(size) } as CSSProperties}
            aria-label={`${remainingCount} more people`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}

function getSizeValue(size: AvatarProps['size'] = 'md'): string {
  const sizes = {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '56px',
    xl: '72px',
    '2xl': '96px',
  };
  return sizes[size];
}

function getFontSize(size: AvatarProps['size'] = 'md'): string {
  const sizes = {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
  };
  return sizes[size];
}