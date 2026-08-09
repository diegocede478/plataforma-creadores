/* ========================================
   Creata - Orders Manager View
   ======================================== */

import { useState } from 'react';
import {
  ShoppingBag, DollarSign, Clock, Package, CheckCircle2,
  XCircle, AlertCircle, MessageSquare, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMySales, useMySubscribers, useUpdateOrderStatus } from '../hooks';
import { Button, Card, Badge, Avatar, SkeletonCard } from '../components/ui';
import type { Order, Subscription } from '../types';
import './OrdersManager.css';

// Order status config
const ORDER_STATUS: Record<Order['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'secondary'; next?: Order['status'] }> = {
  pending: { label: 'Pendiente', variant: 'warning', next: 'in_progress' },
  in_progress: { label: 'En progreso', variant: 'secondary', next: 'delivered' },
  delivered: { label: 'Entregado', variant: 'secondary', next: 'completed' },
  completed: { label: 'Completado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'error' },
  disputed: { label: 'En disputa', variant: 'error' },
};

const NEXT_ACTION_LABEL: Record<Order['status'], string> = {
  pending: 'Aceptar pedido',
  in_progress: 'Marcar entregado',
  delivered: '—',
  completed: '—',
  cancelled: '—',
  disputed: '—',
};

export function OrdersManager() {
  const [tab, setTab] = useState<'sales' | 'subscribers'>('sales');
  const { data: sales, isLoading: salesLoading } = useMySales();
  const { data: subscribers, isLoading: subsLoading } = useMySubscribers();
  const updateOrder = useUpdateOrderStatus();

  const isLoading = tab === 'sales' ? salesLoading : subsLoading;
  const salesList = sales || [];
  const subsList = subscribers || [];

  const handleAdvance = (order: Order) => {
    const next = ORDER_STATUS[order.status]?.next;
    if (next) {
      updateOrder.mutate({ id: order.id, status: next });
    }
  };

  return (
    <div className="orders-manager">
      <div className="orders-manager__header">
        <div>
          <h2 className="orders-manager__title">Pedidos y ventas</h2>
          <p className="orders-manager__subtitle">
            Gestiona los pedidos de tus servicios y a tus suscriptores
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="orders-manager__tabs" role="tablist" aria-label="Vista de pedidos">
        <button
          role="tab"
          aria-selected={tab === 'sales'}
          className={`orders-manager__tab ${tab === 'sales' ? 'orders-manager__tab--active' : ''}`}
          onClick={() => setTab('sales')}
        >
          <ShoppingBag size={16} />
          Ventas
          {salesList.length > 0 && <span className="orders-manager__tab-count">{salesList.length}</span>}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'subscribers'}
          className={`orders-manager__tab ${tab === 'subscribers' ? 'orders-manager__tab--active' : ''}`}
          onClick={() => setTab('subscribers')}
        >
          <Package size={16} />
          Suscriptores
          {subsList.length > 0 && <span className="orders-manager__tab-count">{subsList.length}</span>}
        </button>
      </div>

      {isLoading ? (
        <div className="orders-manager__list">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tab === 'sales' ? (
        salesList.length === 0 ? (
          <Card variant="glass" className="orders-manager__empty">
            <div className="orders-manager__empty-icon">
              <ShoppingBag size={48} />
            </div>
            <h3>Sin pedidos todavía</h3>
            <p>Cuando un fan compre uno de tus servicios, el pedido aparecerá aquí.</p>
            <Link to="/dashboard/services">
              <Button variant="primary" leftIcon={<Package size={16} />}>
                Ver mis servicios
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="orders-manager__list">
            {salesList.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onAdvance={() => handleAdvance(order)}
                updating={updateOrder.isPending}
              />
            ))}
          </div>
        )
      ) : (
        subsList.length === 0 ? (
          <Card variant="glass" className="orders-manager__empty">
            <div className="orders-manager__empty-icon">
              <Package size={48} />
            </div>
            <h3>Sin suscriptores</h3>
            <p>Los fans que se suscriban a tu contenido aparecerán aquí.</p>
          </Card>
        ) : (
          <div className="orders-manager__list">
            {subsList.map((sub) => (
              <SubscriberRow key={sub.id} sub={sub} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// Order Row Component
interface OrderRowProps {
  order: Order;
  onAdvance: () => void;
  updating: boolean;
}

function OrderRow({ order, onAdvance, updating }: OrderRowProps) {
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card variant="glass" className="order-row">
      <div className="order-row__main">
        <Avatar src={order.fan.avatar || null} alt={order.fan.username} size="md" />
        <div className="order-row__content">
          <div className="order-row__top">
            <h3 className="order-row__title">{order.service.title}</h3>
            <Badge variant={status.variant} size="sm">{status.label}</Badge>
          </div>
          <p className="order-row__meta">
            <span>@@{order.fan.username}</span>
            <span className="order-row__dot">•</span>
            <span className="order-row__delivery"><Clock size={12} /> {order.service.deliveryDays} días</span>
            <span className="order-row__dot">•</span>
            <span className="order-row__date">{formattedDate}</span>
          </p>
        </div>
      </div>

      <div className="order-row__side">
        <span className="order-row__price">
          <DollarSign size={16} /> {order.price.toFixed(2)}
        </span>
        {status.next && (
          <Button
            variant={order.status === 'delivered' ? 'outline' : 'primary'}
            size="sm"
            onClick={onAdvance}
            disabled={updating}
            leftIcon={<ArrowRight size={14} />}
          >
            {NEXT_ACTION_LABEL[order.status]}
          </Button>
        )}
        <Link to={`/messages?user=${order.fan.id}`} aria-label="Enviar mensaje al comprador">
          <Button variant="ghost" size="sm" aria-label="Contactar comprador">
            <MessageSquare size={16} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

// Subscriber Row Component
interface SubscriberRowProps {
  sub: Subscription;
}

function SubscriberRow({ sub }: SubscriberRowProps) {
  const formattedDate = new Date(sub.startedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statusConfig = {
    active: { label: 'Activo', variant: 'success' as const, icon: <CheckCircle2 size={12} /> },
    cancelled: { label: 'Cancelado', variant: 'warning' as const, icon: <AlertCircle size={12} /> },
    expired: { label: 'Expirado', variant: 'default' as const, icon: <XCircle size={12} /> },
  }[sub.status] ?? { label: 'Activo', variant: 'default' as const, icon: <CheckCircle2 size={12} /> };

  return (
    <Card variant="glass" className="subscriber-row">
      <div className="subscriber-row__main">
        <Avatar src={sub.fan.avatar || null} alt={sub.fan.username} size="md" />
        <div className="subscriber-row__content">
          <div className="subscriber-row__top">
            <h3 className="subscriber-row__name">@{sub.fan.username}</h3>
            <Badge variant={statusConfig.variant} size="sm" className="subscriber-row__status">
              {statusConfig.icon} {statusConfig.label}
            </Badge>
          </div>
          <p className="subscriber-row__meta">
            <span>Suscrito desde {formattedDate}</span>
            <span className="subscriber-row__dot">•</span>
            <span>Expira {new Date(sub.expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>
      </div>

      <div className="subscriber-row__side">
        <Link to={`/messages?user=${sub.fan.id}`} aria-label="Enviar mensaje al suscriptor">
          <Button variant="ghost" size="sm" aria-label="Contactar suscriptor">
            <MessageSquare size={16} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default OrdersManager;
