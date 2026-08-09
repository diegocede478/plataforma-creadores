/* ========================================
   Creata - Dashboard Layout (Sidebar unificado)
   ======================================== */

import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Package, ShoppingBag,
  Wallet, Settings, LogOut, LogIn, ChevronLeft, ChevronRight,
  Menu, MessageSquare, Rss, Home, Users
} from 'lucide-react';
import { useAuth, useMediaQuery } from '../../hooks';
import { Avatar, NotificationsDropdown } from '../ui';
import './DashboardLayout.css';

/** Items públicos — visibles con o sin sesión */
const publicNavItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/creators', label: 'Creadores', icon: Users },
];

/** Items visibles para todos los usuarios autenticados */
const allNavItems = [
  { path: '/feed', label: 'Feed', icon: Rss },
  { path: '/messages', label: 'Mensajes', icon: MessageSquare },
  { path: '/settings', label: 'Configuración', icon: Settings },
];

/** Items exclusivos del rol creator (dashboard) */
const creatorNavItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/posts', label: 'Publicaciones', icon: FileText },
  { path: '/dashboard/services', label: 'Servicios', icon: Package },
  { path: '/dashboard/orders', label: 'Pedidos', icon: ShoppingBag },
  { path: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
];

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  // Cerrar el menú móvil al navegar a otra ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Cerrar el menú móvil al redimensionar a pantalla grande
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  };

  const navigation = [
    ...publicNavItems,
    ...(user ? allNavItems : []),
    ...(user?.role === 'creator' ? creatorNavItems : []),
  ];

  // Título del header según la ruta activa (ruta más específica primero)
  const headerTitle =
    location.pathname.startsWith('/creator/')
      ? 'Perfil'
      : [...navigation]
          .sort((a, b) => b.path.length - a.path.length)
          .find(
            (item) =>
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`)
          )?.label ?? 'Dashboard';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'dashboard-sidebar--collapsed' : ''} ${sidebarOpen ? 'dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-sidebar__header">
          {!sidebarCollapsed && (
            <div className="dashboard-sidebar__brand">
              <svg viewBox="0 0 48 48" fill="none" className="dashboard-sidebar__logo">
                <rect width="48" height="48" rx="12" className="dashboard-sidebar__logo-bg" />
                <path d="M24 12 L36 24 L24 36 L12 24 Z" className="dashboard-sidebar__logo-shape" />
                <circle cx="24" cy="24" r="6" className="dashboard-sidebar__logo-dot" />
              </svg>
              <span className="dashboard-sidebar__title">Creata</span>
            </div>
          )}
          <button
            className="dashboard-sidebar__toggle"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed || sidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="dashboard-sidebar__nav" role="navigation" aria-label="Navegación principal">
          <ul className="dashboard-sidebar__list">
            {navigation.map((item) => (
              <li key={item.path} className="dashboard-sidebar__item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `dashboard-sidebar__link ${isActive ? 'dashboard-sidebar__link--active' : ''}`
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="dashboard-sidebar__icon" size={20} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="dashboard-sidebar__label">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="dashboard-sidebar__footer">
          {user ? (
            <>
              <NotificationsDropdown collapsed={sidebarCollapsed} />
              <Link
                to="/dashboard"
                className={`dashboard-sidebar__user ${sidebarCollapsed ? 'dashboard-sidebar__user--collapsed' : ''}`}
                title={sidebarCollapsed ? 'Ir al dashboard' : undefined}
                aria-label="Ir al dashboard"
              >
                <Avatar src={user.avatar} alt={user.username} size="sm" />
                {!sidebarCollapsed && (
                  <div className="dashboard-sidebar__user-info">
                    <span className="dashboard-sidebar__user-name">@{user.username}</span>
                    <span className="dashboard-sidebar__user-role">{user.role === 'creator' ? 'Creador' : 'Fan'}</span>
                  </div>
                )}
              </Link>
              {!sidebarCollapsed && (
                <button
                  type="button"
                  className="dashboard-sidebar__footer-btn"
                  onClick={logout}
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={16} aria-hidden="true" />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </>
          ) : sidebarCollapsed ? (
            <Link
              to="/login"
              className="dashboard-sidebar__footer-btn dashboard-sidebar__auth-icon"
              title="Iniciar sesión"
              aria-label="Iniciar sesión"
            >
              <LogIn size={16} aria-hidden="true" />
            </Link>
          ) : (
            <div className="dashboard-sidebar__auth">
              <Link to="/login" className="dashboard-sidebar__auth-btn">Iniciar sesión</Link>
              <Link to="/register" className="dashboard-sidebar__auth-btn dashboard-sidebar__auth-btn--primary">Registrarse</Link>
            </div>
          )}
        </footer>
      </aside>

      {/* Main Content */}
      <main className={`dashboard-main ${sidebarCollapsed ? 'dashboard-main--expanded' : ''}`}>
        <header className="dashboard-header">
          <div className="dashboard-header__left">
            {isMobile && (
              <button
                className="dashboard-header__menu"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="dashboard-header__title">{headerTitle}</h1>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay — solo visible cuando el menú móvil está abierto */}
      {sidebarOpen && (
        <button
          className="dashboard-overlay dashboard-overlay--visible"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
          tabIndex={-1}
        />
      )}
    </div>
  );
}

export default DashboardLayout;
