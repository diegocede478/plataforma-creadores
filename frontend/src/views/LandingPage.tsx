/* ========================================
   Creata - Landing Page View
   ======================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Zap, Heart, Shield, ArrowRight, Users, MessageSquare, Wallet, Globe } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { CreatorCard } from '../components/creators/CreatorCard';
import { useSearchUsers, useDebounce } from '../hooks';
import './LandingPage.css';

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: creators, isLoading } = useSearchUsers({
    q: debouncedQuery || undefined,
    role: 'creator',
    limit: 12,
  });

  const categories = [
    { id: 'all', label: 'Todos', icon: <Globe size={16} /> },
    { id: 'art', label: 'Arte', icon: <Zap size={16} /> },
    { id: 'music', label: 'Música', icon: <Heart size={16} /> },
    { id: 'tech', label: 'Tech', icon: <Shield size={16} /> },
    { id: 'lifestyle', label: 'Lifestyle', icon: <Star size={16} /> },
  ];

  const features = [
    {
      icon: <Users size={24} />,
      title: 'Comunidad de Creadores',
      description: 'Descubre y apoya a creadores de contenido exclusivo en una plataforma diseñada para ellos.',
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'Chat Directo',
      description: 'Comunícate directamente con tus creadores favoritos mediante mensajes privados y contenido desbloqueable.',
    },
    {
      icon: <Wallet size={24} />,
      title: 'Monetización Flexible',
      description: 'Suscripciones mensuales, contenido premium por pago único y servicios personalizados (gigs).',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Creadores activos' },
    { value: '500K+', label: 'Suscriptores' },
    { value: '$2M+', label: 'Ganancias pagadas' },
    { value: '99%', label: 'Satisfacción' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="page-container">
          <div className="landing-hero__content">
            <h1 id="hero-title" className="landing-hero__title">
              La plataforma donde los <span className="gradient-text">creadores</span> brillan
            </h1>
            <p className="landing-hero__subtitle">
              Descubre contenido exclusivo, conecta con tus creadores favoritos y apoya su trabajo
              con suscripciones, contenido premium y servicios personalizados.
            </p>

            {/* Search Bar */}
            <div className="landing-hero__search">
              <form className="landing-hero__search-form" onSubmit={(e) => e.preventDefault()}>
                <Search size={22} className="landing-hero__search-icon" aria-hidden="true" />
                <input
                  type="search"
                  className="landing-hero__search-input"
                  placeholder="Buscar creadores por nombre, categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar creadores"
                />
                <Button type="submit" size="lg" className="landing-hero__search-btn">
                  Buscar
                  <ArrowRight size={18} />
                </Button>
              </form>
            </div>

            {/* Categories */}
            <div className="landing-hero__categories" role="group" aria-label="Categorías">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`landing-hero__category ${selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory) ? 'landing-hero__category--active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id === 'all' ? undefined : cat.id)}
                  role="tab"
                  aria-selected={selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory)}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="landing-hero__stats" role="list" aria-label="Estadísticas de la plataforma">
              {stats.map((stat) => (
                <div key={stat.label} className="landing-hero__stat" role="listitem">
                  <span className="landing-hero__stat-value">{stat.value}</span>
                  <span className="landing-hero__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating elements */}
          <div className="landing-hero__float" aria-hidden="true">
            <div className="landing-hero__orb orb-1" />
            <div className="landing-hero__orb orb-2" />
            <div className="landing-hero__orb orb-3" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" aria-labelledby="features-title">
        <div className="page-container">
          <header className="section-header">
            <h2 id="features-title" className="section-title">¿Por qué Creata?</h2>
          </header>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {features.map((feature, index) => (
              <Card key={index} variant="glass" padding="lg" hover className="landing-feature-card">
                <div className="landing-feature-card__icon">
                  {feature.icon}
                </div>
                <h3 className="landing-feature-card__title">{feature.title}</h3>
                <p className="landing-feature-card__description">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="landing-creators" aria-labelledby="creators-title">
        <div className="page-container">
          <header className="section-header">
            <h2 id="creators-title" className="section-title">Creadores Destacados</h2>
            <Link to="/creators" className="section-action">
              Ver todos
              <ArrowRight size={16} />
            </Link>
          </header>

          {isLoading ? (
            <div className="grid grid--auto" role="status" aria-label="Cargando creadores">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="glass" padding="none" className="landing-creator-skeleton">
                  <div className="landing-creator-skeleton__cover" />
                  <div className="landing-creator-skeleton__content">
                    <div className="landing-creator-skeleton__avatar" />
                    <div className="landing-creator-skeleton__name" />
                    <div className="landing-creator-skeleton__bio" />
                    <div className="landing-creator-skeleton__meta" />
                  </div>
                </Card>
              ))}
            </div>
          ) : creators && creators.data.length > 0 ? (
            <div className="grid grid--auto" role="list">
              {creators.data.map((creator) => (
                <CreatorCard key={creator.id} user={creator} />
              ))}
            </div>
          ) : (
            <Card variant="glass" padding="lg" className="landing-creators__empty">
              <Users size={48} className="landing-creators__empty-icon" />
              <h3 className="landing-creators__empty-title">No hay creadores aún</h3>
              <p className="landing-creators__empty-text">Sé el primero en unirte y crear contenido exclusivo</p>
              <Link to="/register">
                <Button size="lg">Registrarse como creador</Button>
              </Link>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" aria-labelledby="cta-title">
        <div className="page-container">
          <Card variant="gradient" padding="lg" className="landing-cta__card">
            <div className="landing-cta__content">
              <h2 id="cta-title" className="landing-cta__title">¿Listo para empezar?</h2>
              <p className="landing-cta__text">
                Únete a miles de creadores que ya están monetizando su pasión en Creata.
                Crea tu perfil en minutos y comienza a ganar hoy mismo.
              </p>
              <div className="landing-cta__actions">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="landing-cta__btn">
                    Crear cuenta gratis
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/creators">
                  <Button variant="outline" size="lg" className="landing-cta__btn">
                    Explorar creadores
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}