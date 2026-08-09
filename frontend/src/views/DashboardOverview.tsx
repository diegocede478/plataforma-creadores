/* ========================================
   Creata - Dashboard Overview View
   ======================================== */

import { Link } from 'react-router-dom';
import {
  Users, FileText, Package, ShoppingBag,
  DollarSign, Clock, ArrowUpRight,
  ArrowDownRight, Minus, Plus
} from 'lucide-react';
import { useMyStats, useMyPosts, useMyServices, useMySales, useMySubscribers } from '../hooks';
import { Button, Card, Badge, SkeletonCard } from '../components/ui';
import type { Post, Service, Order, Subscription } from '../types';
import './DashboardOverview.css';

export function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useMyStats();
  const { data: posts, isLoading: postsLoading } = useMyPosts({ page: 1, limit: 5 });
  const { data: services, isLoading: servicesLoading } = useMyServices();
  const { data: sales, isLoading: salesLoading } = useMySales();
  const { data: subscriptions, isLoading: subsLoading } = useMySubscribers();

  const isLoading = statsLoading || postsLoading || servicesLoading || salesLoading || subsLoading;

  const statsCards = [
    {
      title: 'Suscriptores',
      value: stats?.subscribersCount || 0,
      icon: Users,
      color: 'primary' as const,
      trend: (stats?.thisMonthEarnings ?? 0) > 0 ? '+12%' : '0%',
      trendType: 'positive' as const,
    },
    {
      title: 'Publicaciones',
      value: stats?.postsCount || 0,
      icon: FileText,
      color: 'secondary' as const,
      trend: '+5',
      trendType: 'positive' as const,
    },
    {
      title: 'Servicios',
      value: stats?.servicesCount || 0,
      icon: Package,
      color: 'accent' as const,
      trend: (stats?.servicesCount ?? 0) > 0 ? '+2' : '0',
      trendType: 'positive' as const,
    },
    {
      title: 'Ganancias totales',
      value: `$${(stats?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'success' as const,
      trend: `$${(stats?.thisMonthEarnings || 0).toLocaleString()} este mes`,
      trendType: 'positive' as const,
    },
  ];

  const recentPosts = posts?.data || [];
  const recentServices = services?.slice(0, 5) || [];
  const recentSales = sales?.slice(0, 5) || [];
  const recentSubs = subscriptions?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="dashboard-overview">
        <div className="dashboard-overview__skeleton">
          <div className="dashboard-overview__stats-skeleton">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="dashboard-overview__sections-skeleton">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Stats Grid */}
      <section className="dashboard-overview__stats" aria-label="Estadísticas principales">
        <div className="dashboard-overview__stats-grid">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Content Sections */}
      <section className="dashboard-overview__sections">
        <div className="dashboard-overview__grid">
          {/* Recent Posts */}
          <div className="dashboard-overview__card">
            <div className="dashboard-overview__card-header">
              <h2 className="dashboard-overview__card-title">
                <FileText size={20} />
                Publicaciones recientes
              </h2>
              <Link to="/dashboard/posts" className="dashboard-overview__card-link">
                Ver todas
              </Link>
            </div>
            <div className="dashboard-overview__card-content">
              {recentPosts.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Sin publicaciones"
                  description="Crea tu primera publicación para empezar a compartir contenido"
                  action={<Link to="/dashboard/posts"><Button size="sm" variant="primary">Crear publicación</Button></Link>}
                />
              ) : (
                <div className="dashboard-overview__list">
                  {recentPosts.map((post: Post) => (
                    <PostRow key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Services */}
          <div className="dashboard-overview__card">
            <div className="dashboard-overview__card-header">
              <h2 className="dashboard-overview__card-title">
                <Package size={20} />
                Servicios
              </h2>
              <Link to="/dashboard/services" className="dashboard-overview__card-link">
                Ver todas
              </Link>
            </div>
            <div className="dashboard-overview__card-content">
              {recentServices.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Sin servicios"
                  description="Ofrece tus servicios para empezar a ganar dinero"
                  action={<Link to="/dashboard/services"><Button size="sm" variant="primary">Crear servicio</Button></Link>}
                />
              ) : (
                <div className="dashboard-overview__list">
                  {recentServices.map((service: Service) => (
                    <ServiceRow key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity - Sales & Subscriptions */}
          <div className="dashboard-overview__card dashboard-overview__card--wide">
            <div className="dashboard-overview__card-header">
              <h2 className="dashboard-overview__card-title">
                <ShoppingBag size={20} />
                Actividad reciente
              </h2>
              <Link to="/dashboard/orders" className="dashboard-overview__card-link">
                Ver todas
              </Link>
            </div>
            <div className="dashboard-overview__card-content">
              {(recentSales.length === 0 && recentSubs.length === 0) ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Sin actividad reciente"
                  description="Las ventas y nuevas suscripciones aparecerán aquí"
                />
              ) : (
                <div className="dashboard-overview__activity-list">
                  {recentSales.map((sale: Order) => (
                    <ActivityRow
                      key={sale.id}
                      type="sale"
                      title={`Nuevo pedido: ${sale.service.title}`}
                      subtitle={`@${sale.fan.username} • $${sale.price}`}
                      time={sale.createdAt}
                      status={sale.status}
                    />
                  ))}
                  {recentSubs.map((sub: Subscription) => (
                    <ActivityRow
                      key={sub.id}
                      type="subscription"
                      title={`Nuevo suscriptor`}
                      subtitle={`@${sub.fan?.username ?? '—'}`}
                      time={sub.startedAt}
                      status={sub.status}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-overview__quick-actions" aria-label="Acciones rápidas">
        <h2 className="dashboard-overview__section-title">Acciones rápidas</h2>
        <div className="dashboard-overview__actions-grid">
          <QuickAction
            icon={Plus}
            title="Nueva publicación"
            description="Comparte contenido con tus suscriptores"
            href="/dashboard/posts"
          />
          <QuickAction
            icon={Package}
            title="Crear servicio"
            description="Ofrece un nuevo gig a tus fans"
            href="/dashboard/services"
          />
          <QuickAction
            icon={DollarSign}
            title="Ver ganancias"
            description="Revisa tu wallet y transacciones"
            href="/dashboard/wallet"
          />
          <QuickAction
            icon={Users}
            title="Gestionar suscriptores"
            description="Ve quién te apoya"
            href="/dashboard/orders"
          />
        </div>
      </section>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
}

function StatCard({ title, value, icon: Icon, color, trend, trendType }: StatCardProps) {
  return (
    <Card variant="glass" padding="lg" className="stat-card">
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          <Icon size={24} />
        </div>
        <span className={`stat-card__trend stat-card__trend--${trendType}`}>
          {trendType === 'positive' && <ArrowUpRight size={14} />}
          {trendType === 'negative' && <ArrowDownRight size={14} />}
          {trendType === 'neutral' && <Minus size={14} />}
          {trend}
        </span>
      </div>
      <div className="stat-card__content">
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__title">{title}</p>
      </div>
    </Card>
  );
}

// Post Row Component
interface PostRowProps {
  post: Post;
}

function PostRow({ post }: PostRowProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="dashboard-overview__row">
      <div className="dashboard-overview__row-content">
        <p className="dashboard-overview__row-title">{post.content.substring(0, 60)}...</p>
        <span className="dashboard-overview__row-meta">
          <Clock size={12} /> {formattedDate}
        </span>
      </div>
      <div className="dashboard-overview__row-actions">
        {post.isPremium && (
          <Badge variant="premium" size="sm">
            <span>Premium</span>
          </Badge>
        )}
      </div>
    </div>
  );
}

// Service Row Component
interface ServiceRowProps {
  service: Service;
}

function ServiceRow({ service }: ServiceRowProps) {
  return (
    <div className="dashboard-overview__row">
      <div className="dashboard-overview__row-content">
        <p className="dashboard-overview__row-title">{service.title}</p>
        <span className="dashboard-overview__row-meta">
          ${service.price} • {service.deliveryDays} días
        </span>
      </div>
      <div className="dashboard-overview__row-actions">
        <Badge
          variant={service.status === 'active' ? 'success' : service.status === 'paused' ? 'warning' : 'default'}
          size="sm"
        >
          {service.status === 'active' ? 'Activo' : service.status === 'paused' ? 'Pausado' : 'Inactivo'}
        </Badge>
      </div>
    </div>
  );
}

// Activity Row Component
interface ActivityRowProps {
  type: 'sale' | 'subscription';
  title: string;
  subtitle: string;
  time: string;
  status: string;
}

function ActivityRow({ type, title, subtitle, time, status }: ActivityRowProps) {
  const formattedTime = new Date(time).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="dashboard-overview__activity-row">
      <div className="dashboard-overview__activity-icon">
        {type === 'sale' ? (
          <ShoppingBag size={20} />
        ) : (
          <Users size={20} />
        )}
      </div>
      <div className="dashboard-overview__activity-content">
        <p className="dashboard-overview__activity-title">{title}</p>
        <p className="dashboard-overview__activity-subtitle">{subtitle}</p>
      </div>
      <div className="dashboard-overview__activity-meta">
        <span className="dashboard-overview__activity-time">{formattedTime}</span>
        <Badge
          variant={status === 'completed' || status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'default'}
          size="sm"
        >
          {status === 'completed' ? 'Completado' : status === 'active' ? 'Activo' : status === 'pending' ? 'Pendiente' : status}
        </Badge>
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="dashboard-overview__empty">
      <div className="dashboard-overview__empty-icon">
        <Icon size={48} />
      </div>
      <h3 className="dashboard-overview__empty-title">{title}</h3>
      <p className="dashboard-overview__empty-description">{description}</p>
      {action && <div className="dashboard-overview__empty-action">{action}</div>}
    </div>
  );
}

// Quick Action Component
interface QuickActionProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  href: string;
}

function QuickAction({ icon: Icon, title, description, href }: QuickActionProps) {
  return (
    <Link to={href} className="dashboard-overview__quick-action glass">
      <div className="dashboard-overview__quick-action-icon">
        <Icon size={24} />
      </div>
      <div className="dashboard-overview__quick-action-content">
        <h3 className="dashboard-overview__quick-action-title">{title}</h3>
        <p className="dashboard-overview__quick-action-description">{description}</p>
      </div>
    </Link>
  );
}