/* ========================================
   Creata - Landing Page View
   ======================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Zap, Heart, Shield, ArrowRight, Globe, Sparkles, TrendingUp, Target, BarChart2, Crown, Crown as CrownIcon } from 'lucide-react';
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
    { id: 'art', label: 'Arte & Diseño', icon: <Zap size={16} /> },
    { id: 'music', label: 'Música & Audio', icon: <Heart size={16} /> },
    { id: 'tech', label: 'Tech & Código', icon: <Shield size={16} /> },
    { id: 'lifestyle', label: 'Lifestyle', icon: <Star size={16} /> },
    { id: 'fitness', label: 'Fitness & Bienestar', icon: <Target size={16} /> },
    { id: 'gaming', label: 'Gaming & Streaming', icon: <TrendingUp size={16} /> },
    { id: 'education', label: 'Educación & Tutoriales', icon: <BarChart2 size={16} /> },
    { id: 'cooking', label: 'Cocina & Recetas', icon: <Sparkles size={16} /> },
    { id: 'business', label: 'Negocios & Finanzas', icon: <Crown size={16} /> },
  ];

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Comunidad de Creadores',
      description: 'Descubre y apoya a creadores de contenido exclusivo en una plataforma diseñada para ellos.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: 'Chat Directo',
      description: 'Comunícate directamente con tus creadores favoritos mediante mensajes privados y contenido desbloqueable.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: 'Monetización Flexible',
      description: 'Suscripciones mensuales, contenido premium por pago único y servicios personalizados (gigs).',
    },
  ];

  // Demo creators for when the platform is empty (shown as placeholders)
  const demoCreators = [
    {
      id: 'demo-1',
      username: 'ana_artista',
      bio: 'Ilustradora digital creando arte exclusivo para ti 🎨',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      role: 'creator' as const,
      email: 'ana@demo.creata.app',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { subscribers: 1247, subscriptions: 0, posts: 89, services: 3 },
    },
    {
      id: 'demo-2',
      username: 'carlos_codigo',
      bio: 'Desarrollador fullstack compartiendo tutoriales y snippets 💻',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      role: 'creator' as const,
      email: 'carlos@demo.creata.app',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { subscribers: 3421, subscriptions: 0, posts: 156, services: 5 },
    },
    {
      id: 'demo-3',
      username: 'maria_musica',
      bio: 'Cantautora indie. Acceso anticipado a mis nuevas canciones 🎵',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      role: 'creator' as const,
      email: 'maria@demo.creata.app',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { subscribers: 892, subscriptions: 0, posts: 43, services: 2 },
    },
    {
      id: 'demo-4',
      username: 'fitness_pro',
      bio: 'Entrenador personal. Rutinas exclusivas y coaching 1-on-1 💪',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitness',
      role: 'creator' as const,
      email: 'fitness@demo.creata.app',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { subscribers: 567, subscriptions: 0, posts: 201, services: 8 },
    },
  ];

  // Founder benefits for empty state - conversion-focused
  const founderBenefits = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      badge: 'Creador Fundador',
      title: 'Badge exclusivo de por vida',
      desc: 'Identifica tu perfil como pionero. Visible para todos los fans y creadores.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      badge: '0% Comisión',
      title: 'Sin comisión el primer mes',
      desc: 'Te quedas el 100% de tus ganancias durante 30 días. Luego solo 10%.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1 0-4h13a2 2 0 0 1 0 4H5a2 2 0 0 1 0-4h13a2 2 0 0 1 0 4H5a2 2 0 0 1 0-4h13a2 2 0 0 1 0 4" />
          <path d="M16 8V5a2 2 0 0 0-2-2h-2a2 2 0 0 0 0 4h2" />
        </svg>
      ),
      badge: 'Posición Destacada',
      title: 'Prioridad en búsquedas y recomendaciones',
      desc: 'Tus contenidos aparecen primero mientras la plataforma crece.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      badge: 'Acceso Temprano',
      title: 'Nuevas features antes que nadie',
      desc: 'Beta tester de herramientas: analytics avanzados, IA, merch, etc.',
    },
  ];

  const trustSignals = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: 'Pagos Seguros con Stripe',
      desc: 'Procesamos pagos con Stripe (PCI Level 1). Tu dinero está protegido.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: 'Sin Comisiones Ocultas',
      desc: 'Solo cobramos el 10% + fee de Stripe. Transparente, sin costes ocultos.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c1.26-1.5 2-5 2-5" />
          <path d="M9 12c1.5 1.26 2 5 2 5s-3.74.5-5 2c-1.26-1.5-2-5-2-5" />
          <path d="M15 30c1.5-1.26 2-5 2-5s-3.74-.5-5-2c-1.26 1.5-2 5-2 5" />
          <path d="M21 24c-1.5-1.26-2-5-2-5s3.74.5 5 2c1.26 1.5 2 5 2 5" />
          <path d="M18 12c0 4.42-3.58 8-8 8" />
          <path d="M12 12c0 4.42 3.58 8 8 8" />
          <path d="M12 18a6 6 0 0 0-6-6" />
          <path d="M18 6a6 6 0 0 1 6 6" />
        </svg>
      ),
      title: 'Setup en Minutos',
      desc: 'Crea tu perfil, sube contenido y empieza a ganar hoy.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Soporte Real',
      desc: 'Equipo humano respondiendo en <24h. No bots.',
    },
  ];

  // Payment methods for visual trust
  const paymentMethods = [
    { name: 'Stripe', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="16">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    )},
    { name: 'Tarjeta', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="16">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )},
    { name: 'SEPA', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="16">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { name: 'Crypto', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="16">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v12M6 12h12"/>
      </svg>
    )},
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
              <strong>Lanzamiento: sé de los primeros creadores en Creata.</strong>
              Sin comisiones el primer mes, badge de "Creador Fundador" y posición destacada.
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

            {/* Trust Signals */}
            <div className="landing-hero__trust" role="list" aria-label="Garantías de la plataforma">
              {trustSignals.map((signal, index) => (
                <div key={index} className="landing-hero__trust-item" role="listitem">
                  <div className="landing-hero__trust-icon">
                    {signal.icon}
                  </div>
                  <div className="landing-hero__trust-content">
                    <span className="landing-hero__trust-title">{signal.title}</span>
                    <span className="landing-hero__trust-desc">{signal.desc}</span>
                  </div>
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
            <h2 id="creators-title" className="section-title">Creadores Fundadores</h2>
            <p className="section-subtitle">Únete ahora y consigue beneficios exclusivos de por vida</p>
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
            <div className="landing-founders-grid">
              {founderBenefits.map((benefit, index) => (
                <Card key={index} variant="glass" padding="lg" hover className="landing-founder-card">
                  <div className="landing-founder-card__icon">
                    {benefit.icon}
                  </div>
                  <div className="landing-founder-card__badge">{benefit.badge}</div>
                  <h3 className="landing-founder-card__title">{benefit.title}</h3>
                  <p className="landing-founder-card__desc">{benefit.desc}</p>
                </Card>
              ))}
              <Card variant="gradient" padding="lg" className="landing-founders__cta">
                <div className="landing-founders__cta-content">
                  <h3 className="landing-founders__cta-title">¿Listo para ser fundador?</h3>
                  <p className="landing-founders__cta-text">Las plazas de creador fundador son limitadas. Asegura tu lugar hoy.</p>
                  <Link to="/register">
                    <Button variant="secondary" size="lg" className="landing-founders__cta-btn">
                      Quiero ser creador fundador
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
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
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Section - enhanced with payment methods */}
      <section className="landing-trust" aria-labelledby="trust-title">
        <div className="page-container">
          <header className="section-header">
            <h2 id="trust-title" className="section-title">Confianza y Transparencia</h2>
            <p className="section-subtitle">Todo lo que necesitas saber para empezar con seguridad</p>
          </header>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {trustSignals.map((signal, index) => (
              <Card key={index} variant="glass" padding="lg" hover className="landing-trust-card">
                <div className="landing-trust-card__icon">
                  {signal.icon}
                </div>
                <h3 className="landing-trust-card__title">{signal.title}</h3>
                <p className="landing-trust-card__desc">{signal.desc}</p>
              </Card>
            ))}
          </div>

          {/* Payment Methods Visual */}
          <div className="landing-trust__payments" role="img" aria-label="Métodos de pago aceptados">
            <span className="landing-trust__payments-label">Métodos de pago:</span>
            <div className="landing-trust__payments-icons">
              {paymentMethods.map((method, index) => (
                <span key={index} className="landing-trust__payment-icon" title={method.name}>
                  {method.icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - moved higher for prominence */}
      <section className="landing-how" aria-labelledby="how-title">
        <div className="page-container">
          <header className="section-header">
            <h2 id="how-title" className="section-title">¿Cómo funciona?</h2>
            <p className="section-subtitle">De cero a ingresos en 4 pasos simples</p>
          </header>
          <div className="landing-how__steps">
            <div className="landing-how__step">
              <div className="landing-how__number">1</div>
              <h3 className="landing-how__step-title">Crea tu perfil</h3>
              <p className="landing-how__step-desc">Regístrate gratis, personaliza tu página y define qué contenido ofrecerás.</p>
            </div>
            <div className="landing-how__step">
              <div className="landing-how__number">2</div>
              <h3 className="landing-how__step-title">Publica contenido</h3>
              <p className="landing-how__step-desc">Sube posts, videos, audios o crea servicios personalizados (gigs).</p>
            </div>
            <div className="landing-how__step">
              <div className="landing-how__number">3</div>
              <h3 className="landing-how__step-title">Monetiza</h3>
              <p className="landing-how__step-desc">Tus fans se suscriben, compran contenido premium o contratan tus servicios.</p>
            </div>
            <div className="landing-how__step">
              <div className="landing-how__number">4</div>
              <h3 className="landing-how__step-title">Retira ganancias</h3>
              <p className="landing-how__step-desc">Retira a tu banco o crypto. Pagos automáticos cada semana.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - refined for creators-first messaging */}
      <section className="landing-cta" aria-labelledby="cta-title">
        <div className="page-container">
          <Card variant="gradient" padding="lg" className="landing-cta__card">
            <div className="landing-cta__content">
              <h2 id="cta-title" className="landing-cta__title">¿Listo para monetizar tu contenido?</h2>
              <p className="landing-cta__text">
                Creadores: registraos gratis, obtened 0% comisión el primer mes y empezad a ganar hoy.
                Fans: descubrid contenido exclusivo y apoyad directamente a vuestros creadores favoritos.
              </p>
              <div className="landing-cta__actions">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="landing-cta__btn">
                    Crear cuenta gratis
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/creators" className="landing-cta__secondary-link">
                  Ver cómo funciona para fans
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Creators Grid - after CTA */}
      <section className="landing-creators" aria-labelledby="creators-title">
        <div className="page-container">
          <header className="section-header">
            <h2 id="creators-title" className="section-title">Creadores Fundadores</h2>
            <p className="section-subtitle">Únete ahora y consigue beneficios exclusivos de por vida</p>
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
            <div className="landing-founders-grid">
              {founderBenefits.map((benefit, index) => (
                <Card key={index} variant="glass" padding="lg" hover className="landing-founder-card">
                  <div className="landing-founder-card__icon">
                    {benefit.icon}
                  </div>
                  <div className="landing-founder-card__badge">{benefit.badge}</div>
                  <h3 className="landing-founder-card__title">{benefit.title}</h3>
                  <p className="landing-founder-card__desc">{benefit.desc}</p>
                </Card>
              ))}
              <Card variant="gradient" padding="lg" className="landing-founders__cta">
                <div className="landing-founders__cta-content">
                  <h3 className="landing-founders__cta-title">¿Listo para ser fundador?</h3>
                  <p className="landing-founders__cta-text">Las plazas de creador fundador son limitadas. Asegura tu lugar hoy.</p>
                  <Link to="/register">
                    <Button variant="secondary" size="lg" className="landing-founders__cta-btn">
                      Quiero ser creador fundador
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-faq" aria-labelledby="faq-title">
        <div className="page-container">
          <header className="section-header">
            <h2 id="faq-title" className="section-title">Preguntas Frecuentes</h2>
          </header>
          <div className="landing-faq__grid">
            <details className="landing-faq__item">
              <summary className="landing-faq__question">¿Cuánto cobra Creata por comisión?</summary>
              <p className="landing-faq__answer">Solo el 10% de tus ganancias + la comisión del procesador de pagos (Stripe). No hay cuotas mensuales ni costes ocultos.</p>
            </details>
            <details className="landing-faq__item">
              <summary className="landing-faq__question">¿Puedo ofrecer contenido gratis y de pago?</summary>
              <p className="landing-faq__answer">Sí. Publica posts gratuitos para atraer audiencia y contenido premium solo para suscriptores o por pago único.</p>
            </details>
            <details className="landing-faq__item">
              <summary className="landing-faq__question">¿Cómo retiro mis ganancias?</summary>
              <p className="landing-faq__answer">Desde tu wallet en el dashboard. Retiros a cuenta bancaria (SEPA) o crypto. Procesamos pagos cada semana.</p>
            </details>
            <details className="landing-faq__item">
              <summary className="landing-faq__question">¿Tengo exclusividad con Creata?</summary>
              <p className="landing-faq__answer">No. Eres dueño de tu contenido y puedes publicarlo donde quieras. Creata es solo tu canal de monetización directo.</p>
            </details>
            <details className="landing-faq__item">
              <summary className="landing-faq__question">¿Qué tipo de contenido está permitido?</summary>
              <p className="landing-faq__answer">Cualquier contenido legal: arte, código, música, fitness, tutoriales, coaching, etc. Revisamos contenido adulto caso por caso.</p>
            </details>
            <details className="landing-faq__item">
              <summary className="landing-faq__question">¿Hay soporte si tengo problemas?</summary>
              <p className="landing-faq__answer">Sí. Email y chat en la app. Equipo humano respondiendo en menos de 24h laborables. No usamos bots genéricos.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final-cta" aria-labelledby="final-cta-title">
        <div className="page-container">
          <Card variant="gradient" padding="lg" className="landing-final-cta__card">
            <div className="landing-final-cta__content">
              <h2 id="final-cta-title" className="landing-final-cta__title">Empieza tu viaje como creador hoy</h2>
              <p className="landing-final-cta__text">Sin riesgo, sin compromiso. Cancela cuando quieras.</p>
              <Link to="/register">
                <Button variant="secondary" size="lg" className="landing-final-cta__btn">
                  Crear mi cuenta gratis
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}