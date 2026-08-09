/* ========================================
   Creata - Creator Profile Page
   ======================================== */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users, FileText as PostIcon, Package, Calendar,
  MessageSquare, Clock, Star, ShoppingBag, AlertCircle,
  Heart, Share2
} from 'lucide-react';
import {
  useUserProfile, usePostsByCreator, useServicesByCreator,
  useSubscriptionStatus, useSubscribeToCreator, useCancelSubscription,
  useAuth, useCreateOrder
} from '../hooks';
import { Button, Avatar, Badge, Spinner, SkeletonFeed, Card } from '../components/ui';
import { PostCard } from '../components/posts/PostCard';
import type { Post, Service } from '../types';
import './CreatorProfile.css';

type TabType = 'feed' | 'services';

export function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [page, setPage] = useState(1);

  // Queries
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(username || '');
  const { data: postsData, isLoading: postsLoading } = usePostsByCreator(profile?.id || '', { page, limit: 10 });
  const { data: services, isLoading: servicesLoading } = useServicesByCreator(profile?.id || '');
  const { data: subscriptionStatus } = useSubscriptionStatus(profile?.id || '');

  // Mutations
  const subscribeMutation = useSubscribeToCreator();
  const cancelSubscriptionMutation = useCancelSubscription();
  const createOrderMutation = useCreateOrder();

  const isOwnProfile = currentUser?.username === username;
  const isSubscribed = subscriptionStatus?.isSubscribed;

  // Handlers
  const handleSubscribe = () => {
    if (!profile) return;
    subscribeMutation.mutate(profile.id);
  };

  const handleCancelSubscription = () => {
    if (!profile) return;
    cancelSubscriptionMutation.mutate(profile.id);
  };

  const handleOrderService = (serviceId: string) => {
    createOrderMutation.mutate(serviceId);
  };

  const handleMessage = () => {
    if (profile) {
      navigate('/messages', { state: { userId: profile.id, username: profile.username } });
    }
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="creator-profile">
        <div className="creator-profile__loading">
          <Spinner size="lg" color="primary" label="Cargando perfil..." />
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="creator-profile">
        <div className="creator-profile__error">
          <AlertCircle className="creator-profile__error-icon" />
          <h2>No se encontró el perfil</h2>
          <p>El creador @{username} no existe o no está disponible.</p>
          <Link to="/" className="btn btn--primary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const posts = postsData?.data || [];
  const subscribersCount = profile._count?.subscribers || 0;
  const postsCount = profile._count?.posts || 0;
  const servicesCount = profile._count?.services || 0;

  return (
    <div className="creator-profile">
      {/* Hero Section */}
      <div className="creator-profile__hero">
        <div className="creator-profile__hero-bg" />
        <div className="creator-profile__hero-content">
          <div className="creator-profile__avatar-section">
            <Avatar
              src={profile.avatar}
              alt={profile.username}
              size="xl"
              className="creator-profile__avatar"
            />
            <div className="creator-profile__info">
              <h1 className="creator-profile__username">@{profile.username}</h1>
              {profile.bio && (
                <p className="creator-profile__bio">{profile.bio}</p>
              )}
              <div className="creator-profile__meta">
                <Badge variant="primary" size="md">
                  <PostIcon size={14} />
                  <span>{postsCount} posts</span>
                </Badge>
                <Badge variant="secondary" size="md">
                  <Users size={14} />
                  <span>{subscribersCount} suscriptores</span>
                </Badge>
                <Badge variant="secondary" size="md">
                  <Package size={14} />
                  <span>{servicesCount} servicios</span>
                </Badge>
                <Badge variant="default" size="md">
                  <Calendar size={14} />
                  <span>Desde {new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="creator-profile__actions">
              {isSubscribed ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancelSubscription}
                  isLoading={cancelSubscriptionMutation.isPending}
                  className="creator-profile__subscribe-btn"
                >
                  <Heart size={20} />
                  <span>Suscrito</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubscribe}
                  isLoading={subscribeMutation.isPending}
                  className="creator-profile__subscribe-btn"
                >
                  <Heart size={20} />
                  <span>Suscribirse</span>
                </Button>
              )}
              <Button
                variant="secondary"
                size="lg"
                onClick={handleMessage}
                className="creator-profile__message-btn"
              >
                <MessageSquare size={20} />
                <span>Mensaje</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="creator-profile__share-btn"
                aria-label="Compartir perfil"
              >
                <Share2 size={20} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="creator-profile__tabs-container">
        <div className="creator-profile__tabs">
          <button
            className={`creator-profile__tab ${activeTab === 'feed' ? 'creator-profile__tab--active' : ''}`}
            onClick={() => setActiveTab('feed')}
            aria-selected={activeTab === 'feed'}
          >
            <PostIcon size={18} />
            <span>Feed</span>
          </button>
          <button
            className={`creator-profile__tab ${activeTab === 'services' ? 'creator-profile__tab--active' : ''}`}
            onClick={() => setActiveTab('services')}
            aria-selected={activeTab === 'services'}
          >
            <Package size={18} />
            <span>Servicios</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="creator-profile__content">
        {activeTab === 'feed' ? (
          <FeedSection
            posts={posts}
            isLoading={postsLoading}
            isSubscribed={!!isSubscribed}
            isOwnProfile={isOwnProfile}
            page={page}
            totalPages={postsData?.pagination?.totalPages || 1}
            onPageChange={setPage}
          />
        ) : (
          <ServicesSection
            services={services || []}
            isLoading={servicesLoading}
            isSubscribed={!!isSubscribed}
            isOwnProfile={isOwnProfile}
            onOrder={handleOrderService}
          />
        )}
      </div>
    </div>
  );
}

// Feed Section Component
interface FeedSectionProps {
  posts: Post[];
  isLoading: boolean;
  isSubscribed: boolean;
  isOwnProfile: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function FeedSection({
  posts,
  isLoading,
  isSubscribed,
  isOwnProfile,
  page,
  totalPages,
  onPageChange,
}: FeedSectionProps) {
  if (isLoading) {
    return <SkeletonFeed count={3} />;
  }

  if (posts.length === 0) {
    return (
      <div className="creator-profile__empty">
        <PostIcon className="creator-profile__empty-icon" />
        <h3>Sin publicaciones aún</h3>
        <p>Este creador no tiene publicaciones en su feed.</p>
      </div>
    );
  }

  return (
    <div className="creator-profile__feed">
      <div className="creator-profile__posts">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isSubscribed={isSubscribed}
            isOwnProfile={isOwnProfile}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="creator-profile__pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <span className="creator-profile__page-info">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

// Services Section Component
interface ServicesSectionProps {
  services: Service[];
  isLoading: boolean;
  isSubscribed: boolean;
  isOwnProfile: boolean;
  onOrder: (serviceId: string) => void;
}

function ServicesSection({
  services,
  isLoading,
  isSubscribed,
  isOwnProfile,
  onOrder,
}: ServicesSectionProps) {
  if (isLoading) {
    return (
      <div className="creator-profile__loading">
        <Spinner size="lg" color="primary" label="Cargando servicios..." />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="creator-profile__empty">
        <Package className="creator-profile__empty-icon" />
        <h3>Sin servicios disponibles</h3>
        <p>Este creador no tiene servicios publicados aún.</p>
      </div>
    );
  }

  return (
    <div className="creator-profile__services">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          isSubscribed={isSubscribed}
          isOwnProfile={isOwnProfile}
          onOrder={onOrder}
        />
      ))}
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: Service;
  isSubscribed: boolean;
  isOwnProfile: boolean;
  onOrder: (serviceId: string) => void;
}

function ServiceCard({ service, isSubscribed, isOwnProfile, onOrder }: ServiceCardProps) {
  const createOrderMutation = useCreateOrder();

  const handleOrder = () => {
    createOrderMutation.mutate(service.id, {
      onSuccess: () => {
        onOrder(service.id);
      },
    });
  };

  return (
    <Card variant="glass" padding="lg" className="service-card">
      <div className="service-card__header">
        <div className="service-card__icon">
          <Star size={24} />
        </div>
        <div className="service-card__info">
          <h3 className="service-card__title">{service.title}</h3>
          <div className="service-card__meta">
            <Badge variant="primary" size="sm">
              <Clock size={12} />
              {service.deliveryDays} días de entrega
            </Badge>
            <Badge variant={service.status === 'active' ? 'success' : 'warning'} size="sm">
              {service.status === 'active' ? 'Activo' : service.status === 'paused' ? 'Pausado' : 'Inactivo'}
            </Badge>
          </div>
        </div>
        <div className="service-card__price">
          <span className="service-card__price-label">Desde</span>
          <span className="service-card__price-value">${service.price}</span>
        </div>
      </div>

      <p className="service-card__description">{service.description}</p>

      {!isOwnProfile && service.status === 'active' && (
        <div className="service-card__actions">
          <Button
            variant="primary"
            size="md"
            onClick={handleOrder}
            isLoading={createOrderMutation.isPending}
            disabled={isOwnProfile}
          >
            <ShoppingBag size={18} />
            <span>Contratar Servicio</span>
          </Button>
        </div>
      )}

      {isOwnProfile && (
        <div className="service-card__owner-actions">
          <Button variant="outline" size="sm">
            Editar
          </Button>
          <Button variant="ghost" size="sm" color="danger">
            Eliminar
          </Button>
        </div>
      )}
    </Card>
  );
}
