/* ========================================
   Creata - Creator Card (reutilizable)
   Tarjeta de creador usada en la landing,
   el directorio y donde se listen creadores.
   ======================================== */

import { Link } from 'react-router-dom';
import { Users, MessageSquare, ArrowRight } from 'lucide-react';
import { Avatar, Badge } from '../ui';
import type { User } from '../../types';
import './CreatorCard.css';

interface CreatorCardProps {
  user: User;
  className?: string;
}

export function CreatorCard({ user, className }: CreatorCardProps) {
  return (
    <Link
      to={`/creator/${user.username}`}
      className={`creator-card-link ${className ?? ''}`}
      aria-label={`Ver perfil de ${user.username}`}
    >
      <article className="creator-card">
        <div
          className="creator-card__cover"
          style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : undefined}
        >
          {user.role === 'creator' && (
            <Badge variant="premium" size="sm" className="creator-card__badge">
              Creador
            </Badge>
          )}
        </div>

        <div className="creator-card__content">
          <Avatar
            src={user.avatar}
            name={user.username}
            size="lg"
            className="creator-card__avatar"
            border
          />
          <div className="creator-card__info">
            <h3 className="creator-card__name">{user.username}</h3>
            <p className="creator-card__bio">{user.bio || 'Sin descripción'}</p>
            <div className="creator-card__stats">
              <span className="creator-card__stat">
                <Users size={14} aria-hidden="true" />
                {user._count?.subscribers || 0} suscriptores
              </span>
              <span className="creator-card__stat">
                <MessageSquare size={14} aria-hidden="true" />
                {user._count?.posts || 0} posts
              </span>
            </div>
          </div>
        </div>

        <div className="creator-card__action">
          <span className="creator-card__action-btn">
            Ver perfil
            <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default CreatorCard;
