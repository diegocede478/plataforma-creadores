/* ========================================
   Creata - Notifications Dropdown
   ======================================== */

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CheckCircle2, Package, DollarSign } from 'lucide-react';
import './NotificationsDropdown.css';

// Lista de ejemplo: aún no existe un sistema real de notificaciones (sin API).
const SAMPLE_NOTIFICATIONS = [
  { id: '1', icon: CheckCircle2, title: 'Nuevo suscriptor', description: '@fan_tester se suscribió a tu contenido' },
  { id: '2', icon: Package, title: 'Nuevo pedido', description: 'Tienes un pedido pendiente de revisión' },
  { id: '3', icon: DollarSign, title: 'Pago recibido', description: 'Recibiste un pago de $9.99' },
];

export interface NotificationsDropdownProps {
  collapsed?: boolean;
}

export function NotificationsDropdown({ collapsed = false }: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Cerrar al navegar
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notifications-dropdown" ref={containerRef}>
      <button
        type="button"
        className="dashboard-sidebar__footer-btn notifications-dropdown__btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificaciones"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={16} aria-hidden="true" />
        {!collapsed && <span>Notificaciones</span>}
        <span className="notifications-dropdown__badge" aria-label="3 notificaciones no leídas">3</span>
      </button>

      {open && (
        <div className="notifications-dropdown__panel" role="menu">
          <div className="notifications-dropdown__header">
            <span className="notifications-dropdown__title">Notificaciones</span>
            <span className="notifications-dropdown__count">3 nuevas</span>
          </div>
          <ul className="notifications-dropdown__list">
            {SAMPLE_NOTIFICATIONS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="notifications-dropdown__item" role="menuitem">
                  <span className="notifications-dropdown__item-icon">
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <div className="notifications-dropdown__item-text">
                    <span className="notifications-dropdown__item-title">{item.title}</span>
                    <span className="notifications-dropdown__item-desc">{item.description}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
