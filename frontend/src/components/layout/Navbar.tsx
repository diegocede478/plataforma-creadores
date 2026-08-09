/* ========================================
   Creata - Navbar Component
   ======================================== */

import { useState, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Menu, X, Search, Bell, User, LogOut, Settings, Plus, Wallet, MessageSquare, ChevronDown } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../hooks';
import './Navbar.css';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: <Search size={18} /> },
    { path: '/creators', label: 'Creadores', icon: <User size={18} /> },
  ];

  return (
    <header className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="Creata - Inicio">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#9333ea"/>
                <stop offset="100%" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logoGradient)"/>
            <path d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16Z" stroke="white" strokeWidth="2.5" fill="none"/>
            <path d="M16 10V22M10 16H22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="navbar__logo-text">Creata</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar__nav navbar__nav--desktop" aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Search */}
          <div className="navbar__search-wrapper">
            <button
              className="navbar__search-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
              aria-expanded={searchOpen}
            >
              <Search size={20} />
            </button>

            {searchOpen && (
              <div className="navbar__search-dropdown">
                <form className="navbar__search-form" onSubmit={(e) => e.preventDefault()}>
                  <Search size={18} className="navbar__search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    className="navbar__search-input"
                    placeholder="Buscar creadores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    aria-label="Buscar creadores"
                  />
                </form>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="navbar__icon-btn" aria-label="Notificaciones">
                <Bell size={20} />
                <span className="navbar__badge" aria-label="3 notificaciones no leídas">3</span>
              </button>

              {/* Messages */}
              <Link to="/messages" className="navbar__icon-btn" aria-label="Mensajes">
                <MessageSquare size={20} />
              </Link>

              {/* User Menu */}
              <div className="navbar__user-menu">
                <div className="navbar__user-btn">
                  <Link to="/dashboard" className="navbar__user-link" aria-label="Ir al dashboard">
                    <Avatar
                      src={user?.avatar}
                      name={user?.username}
                      size="sm"
                      status="online"
                    />
                    <span className="navbar__username">{user?.username}</span>
                  </Link>
                  <button
                    className="navbar__dropdown-toggle"
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label="Menú de usuario"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {userMenuOpen && (
                  <div className="navbar__user-dropdown glass-strong" role="menu">
                    <div className="navbar__user-info">
                      <Avatar
                        src={user?.avatar}
                        name={user?.username}
                        size="md"
                        status="online"
                      />
                      <div>
                        <p className="navbar__user-name">{user?.username}</p>
                        <p className="navbar__user-role">
                          {user?.role === 'creator' ? 'Creador' : 'Fan'}
                          {user?.role === 'creator' && <Badge variant="premium" size="sm">Premium</Badge>}
                        </p>
                      </div>
                    </div>

                    <div className="navbar__dropdown-divider" aria-hidden="true" />

                    {user?.role === 'creator' && (
                      <>
                        <NavLink to="/dashboard" className="navbar__dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                          <Settings size={18} />
                          <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/dashboard/posts" className="navbar__dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                          <Plus size={18} />
                          <span>Crear publicación</span>
                        </NavLink>
                        <NavLink to="/dashboard/wallet" className="navbar__dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                          <Wallet size={18} />
                          <span>Wallet</span>
                        </NavLink>
                        <div className="navbar__dropdown-divider" aria-hidden="true" />
                      </>
                    )}

                    <NavLink to="/settings" className="navbar__dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <Settings size={18} />
                      <span>Configuración</span>
                    </NavLink>

                    <div className="navbar__dropdown-divider" aria-hidden="true" />

                    <button
                      className="navbar__dropdown-item navbar__dropdown-item--danger"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar__auth-buttons">
              <Link to="/login" className="btn btn--ghost btn--sm">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar__mobile-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="navbar__mobile-menu glass-strong" role="navigation" aria-label="Menú móvil">
          <nav className="navbar__nav navbar__nav--mobile">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}

            {!isAuthenticated && (
              <>
                <div className="navbar__divider" aria-hidden="true" />
                <div className="navbar__mobile-auth">
                  <Link to="/login" className="btn btn--ghost btn--lg btn--full" onClick={() => setMobileMenuOpen(false)}>
                    Iniciar sesión
                  </Link>
                  <Link to="/register" className="btn btn--primary btn--lg btn--full" onClick={() => setMobileMenuOpen(false)}>
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Search Overlay on Mobile */}
      {searchOpen && (
        <div className="navbar__search-overlay" onClick={() => setSearchOpen(false)} aria-hidden="true" />
      )}
    </header>
  );
}