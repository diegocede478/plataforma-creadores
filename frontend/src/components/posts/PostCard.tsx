/* ========================================
   Creata - Post Card Component (reutilizable)
   ======================================== */

import { useState } from 'react';
import { Clock, Lock, Unlock, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { useUnlockPremiumPost } from '../../hooks';
import { Avatar, Button, Badge } from '../ui';
import type { Post } from '../../types';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  isSubscribed?: boolean;
  isOwnProfile?: boolean;
}

export function PostCard({ post, isSubscribed = false, isOwnProfile = false }: PostCardProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const isLocked = post.isPremium && !isSubscribed && !isOwnProfile;
  const formattedDate = new Date(post.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="post-card glass">
      <div className="post-card__header">
        <Avatar src={post.creator.avatar} alt={post.creator.username} size="sm" />
        <div className="post-card__meta">
          <span className="post-card__username">@{post.creator.username}</span>
          <span className="post-card__date">
            <Clock size={14} />
            {formattedDate}
          </span>
        </div>
        {post.isPremium && (
          <Badge variant="premium" size="sm">
            <Lock size={12} />
            Premium
          </Badge>
        )}
      </div>

      <div className={`post-card__content ${isLocked ? 'post-card__content--locked' : ''}`}>
        {isLocked ? (
          <div className="post-card__blur">
            <p className="post-card__preview">
              {post.content ? post.content.substring(0, 150) : ''}...
            </p>
            <div className="post-card__lock-overlay">
              <Lock className="post-card__lock-icon" />
              <p>Contenido premium - Suscríbete para ver</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUnlockModal(true)}
              >
                <Unlock size={16} />
                <span>Desbloquear por ${post.price}</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="post-card__text">{post.content}</p>
            {post.mediaUrl && (
              <div className="post-card__media">
                <img src={post.mediaUrl} alt="Post media" loading="lazy" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="post-card__actions">
        <button className="post-card__action" aria-label="Me gusta">
          <Heart size={20} />
        </button>
        <button className="post-card__action" aria-label="Compartir">
          <Share2 size={20} />
        </button>
        <button className="post-card__action" aria-label="Más opciones">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && (
        <UnlockPostModal
          postId={post.id}
          price={post.price}
          onClose={() => setShowUnlockModal(false)}
        />
      )}
    </article>
  );
}

// Unlock Post Modal
interface UnlockPostModalProps {
  postId: string;
  price: number;
  onClose: () => void;
}

function UnlockPostModal({ postId, price, onClose }: UnlockPostModalProps) {
  const unlockMutation = useUnlockPremiumPost();

  const handleUnlock = () => {
    unlockMutation.mutate(postId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="unlock-modal">
      <div className="unlock-modal__overlay" onClick={onClose} />
      <div className="unlock-modal__content glass">
        <Lock className="unlock-modal__icon" />
        <h3>Contenido Premium</h3>
        <p>Desbloquea este contenido premium por solo <strong>${price}</strong></p>
        <div className="unlock-modal__actions">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={unlockMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleUnlock}
            isLoading={unlockMutation.isPending}
          >
            <Unlock size={18} />
            <span>Desbloquear</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
