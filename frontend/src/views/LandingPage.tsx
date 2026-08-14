/* ========================================
   Creata - Landing Page View (Premium v2 Simplified)
   DESIGN_VARIANCE:8 | MOTION_INTENSITY:6 | VISUAL_DENSITY:4
   ======================================== */

'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, MessageSquare, Zap, Heart, Shield, ArrowRight, Globe, Sparkles, TrendingUp, Target, BarChart2, Crown, ChevronDown } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { CreatorCard } from '../components/creators/CreatorCard';
import { useSearchUsers, useDebounce } from '../hooks';
import './LandingPage.css';

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: creators, isLoading } = useSearchUsers({
    q: debouncedQuery || undefined,
    role: 'creator',
    limit: 12,
  });

  // Premium concrete copy - no AI slop
  const categories = [
    { id: 'all', label: 'Todos los creadores', icon: <Globe size={16} /> },
    { id: 'art-design', label: 'Arte y diseño', icon: <Zap size={16} /> },
    { id: 'music-audio', label: 'Música y audio', icon: <Heart size={16} /> },
    { id: 'tech-code', label: 'Tecnología y código', icon: <Shield size={16} /> },
    { id: 'lifestyle', label: 'Estilo de vida', icon: <Sparkles size={16} /> },
    { id: 'fitness-wellness', label: 'Fitness y bienestar', icon: <Target size={16} /> },
    { id: 'gaming-streaming', label: 'Gaming y streaming', icon: <TrendingUp size={16} /> },
    { id: 'education-tutorials', label: 'Educación y tutoriales', icon: <BarChart2 size={16} /> },
    { id: 'cooking-recipes', label: 'Cocina y recetas', icon: <Sparkles size={16} /> },
    { id: 'business-finance', label: 'Negocios y finanzas', icon: <Crown size={16} /> },
  ];

  const features = [
    {
      icon: <Zap size={48} />,
      title: 'Contenido exclusivo',
      description: 'Posts premium, videos, imágenes y recursos descargables directamente de tus creadores favoritos.'
    },
    {
      icon: <Users size={48} />,
      title: 'Suscripciones mensuales',
      description: 'Apoya a los creadores con planes de suscripción y accede a beneficios exclusivos cada mes.'
    },
    {
      icon: <MessageSquare size={48} />,
      title: 'Mensajes directos',
      description: 'Comunícate de forma privada y segura con los creadores que admiras.'
    },
    {
      icon: <Shield size={48} />,
      title: 'Pagos 100% seguros',
      description: 'Transacciones cifradas con Stripe, tarjetas y criptomonedas. Sin preocupaciones.'
    },
  ];

  const founderBenefits = [
    {
      title: 'Monetiza tu pasión',
      description: 'Vende posts premium, servicios personalizados y recibe pagos de fans de cualquier parte del mundo.'
    },
    {
      title: 'Conecta con tu audiencia',
      description: 'Mensajes directos, comunidades privadas y notificaciones inteligentes para mantener a tus seguidores informados.'
    },
    {
      title: 'Herramientas profesionales',
      description: 'Panel de control con estadísticas en tiempo real, analytics detallados y gestión completa de suscripciones.'
    },
    {
      title: 'Pagos instantáneos',
      description: 'Retiros a tu cuenta bancaria, PayPal o criptomonedas en minutos. Sin esperas innecesarias.'
    },
  ];

  const trustSignals = [
    { label: 'Stripe', icon: '🔒' },
    { label: 'Tarjetas de crédito', icon: '💳' },
    { label: 'SEPA', icon: '🏛️' },
    { label: 'Criptomonedas', icon: '₿' },
    { label: 'Protección de datos', icon: '✓' },
    { label: 'Pagos cifrados', icon: '🛡️' }
  ];

  const howItWorks = [
    {
      number: '01',
      title: 'Explora creadores',
      description: 'Busca por categorías o usa el buscador avanzado para encontrar creadores que se alineen con tus intereses.'
    },
    {
      number: '02',
      title: 'Elige tu plan',
      description: 'Selecciona un plan mensual o contrata un servicio específico según lo que necesites.'
    },
    {
      number: '03',
      title: 'Disfruta del contenido',
      description: 'Accede a posts exclusivos, mensajes privados y beneficios especiales de tu creador favorito.'
    },
    {
      number: '04',
      title: 'Apoya directamente',
      description: 'Tu apoyo ayuda a los creadores a seguir produciendo contenido de calidad y a crecer en la plataforma.'
    },
  ];

  const faqs = [
    {
      question: '¿Cómo funciona Creata exactamente?',
      answer: 'Creata es una plataforma donde los creadores pueden compartir contenido exclusivo y ofrecer servicios profesionales, y los fans pueden descubrir, apoyar y contratar su trabajo de forma directa y segura. Es como Patreon pero con herramientas más profesionales y pagos instantáneos.'
    },
    {
      question: '¿Los pagos en Creata son realmente seguros?',
      answer: 'Sí, trabajamos con Stripe y otros procesadores de pago líderes en el mercado con cifrado de extremo a extremo. Todos los pagos están protegidos por los mismos estándares que usan bancos y grandes empresas.'
    },
    {
      question: '¿Puedo retirar mis ganancias rápidamente?',
      answer: '¡Totalmente! Los creadores pueden retirar sus ganancias a su cuenta bancaria, PayPal o criptomonedas en minutos, sin esperas ni burocracia innecesaria.'
    },
    {
      question: '¿Cuánto cobra Creata por cada transacción?',
      answer: 'Las comisiones son competitivas: solo un pequeño porcentaje por transacción que permite a los creadores maximizar sus ingresos. No hay costos ocultos ni sorpresas.'
    },
    {
      question: '¿Puedo ser creador y fan al mismo tiempo?',
      answer: '¡Por supuesto! Muchos usuarios en Creata son tanto creadores como fans de otros creadores. Puedes apoyar a otros mientras monetizas tu propio contenido.'
    },
    {
      question: '¿Cómo protegen mis datos personales?',
      answer: 'Cumplimos con todas las regulaciones de protección de datos (GDPR, LGPD, etc.) y usamos cifrado avanzado para proteger tu información personal. Tu privacidad es nuestra prioridad.'
    },
  ];

  return (
    <motion.div
      className="landing-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section - Asymmetric layout (DESIGN_VARIANCE:8) */}
      <section className="landing-hero">
        <div className="landing-hero__container">
          {/* Left-aligned content with generous spacing */}
          <motion.div
            className="landing-hero__content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
          >
            <motion.h1
              className="landing-hero__title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Creata — Plataforma de creadores y fans
            </motion.h1>

            <motion.p
              className="landing-hero__subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Descubre contenido exclusivo, apoya a tus creadores favoritos y contrata sus servicios profesionales de forma directa y segura. Sin intermediarios, sin sorpresas.
            </motion.p>

            {/* Search form with micro-interaction */}
            <motion.div
              className="landing-hero__search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.form
                className="landing-hero__search-form"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.span
                  className="landing-hero__search-icon"
                  whileTap={{ scale: 0.9 }}
                >
                  <Search size={20} />
                </motion.span>

                <input
                  type="text"
                  placeholder="Busca creadores, categorías o servicios..."
                  className="landing-hero__search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <motion.button
                  type="submit"
                  className="landing-hero__search-button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Buscar
                </motion.button>
              </motion.form>
            </motion.div>

            {/* Categories with staggered animation */}
            <motion.div
              className="landing-hero__categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="landing-hero__categories-grid"
              >
                {categories.map((category, index) => {
                  const isActive = selectedCategory === category.id;
                  return (
                    <motion.button
                      key={category.id}
                      className={`landing-hero__category-button ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.7 }}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar - Concrete payment methods */}
      <section className="landing-trust">
        <div className="landing-trust-bar">
          {trustSignals.map((signal, index) => (
            <motion.div
              key={index}
              className="landing-trust-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span>{signal.icon}</span>
              <span>{signal.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features - Asymmetric Bento Grid (DESIGN_VARIANCE:8) */}
      <section className="landing-features">
        <div className="landing-features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="landing-feature-wrapper"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.8, type: 'spring', stiffness: 100, damping: 20 }}
              whileHover={{ y: -8 }}
            >
              <Card className="landing-feature-card">
                <motion.div
                  className="landing-feature-card__icon"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                >
                  {feature.icon}
                </motion.div>
                <motion.h3
                  className="landing-feature-card__title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  className="landing-feature-card__description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {feature.description}
                </motion.p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founders Section - Asymmetric layout */}
      <section className="landing-founders">
        <div className="landing-founders-grid">
          {founderBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="landing-founder-wrapper"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 1.0, type: 'spring', stiffness: 100, damping: 20 }}
              whileHover={{ y: -8 }}
            >
              <Card className="landing-founder-card">
                <motion.div
                  className="landing-founder-card__content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.h3
                    className="landing-founder-card__name"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {benefit.title}
                  </motion.h3>
                  <motion.p
                    className="landing-founder-card__bio"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {benefit.description}
                  </motion.p>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section - Premium gradient card */}
      <section className="landing-cta">
        <motion.div
          className="landing-cta__card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.2 }}
        >
          <motion.h2
            className="landing-cta__title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Únete hoy y empieza a apoyar a tus creadores favoritos
          </motion.h2>

          <motion.p
            className="landing-cta__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Crea tu cuenta gratis en menos de 2 minutos y descubre contenido exclusivo en minutos.
          </motion.p>

          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="primary"
              size="lg"
              className="landing-cta__button"
            >
              <Link to="/register" className="btn-link">
                Registrarse gratis <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works - Asymmetric grid with giant numbers */}
      <section className="landing-how">
        <div className="landing-how__container">
          <motion.div
            className="landing-how__steps"
          >
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                className="landing-how__step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 1.4, type: 'spring', stiffness: 100, damping: 20 }}
              >
                <motion.div
                  className="landing-how__number"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                >
                  {step.number}
                </motion.div>
                <motion.div
                  className="landing-how__content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.h3
                    className="landing-how__step-title"
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p
                    className="landing-how__step-description"
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ - Interactive with spring physics */}
      <section className="landing-faq">
        <div className="landing-faq__container">
          <motion.div
            className="landing-faq__grid"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="landing-faq__item-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 1.6, type: 'spring', stiffness: 100, damping: 20 }}
                whileHover={{ y: -4 }}
              >
                <Card className="landing-faq__item">
                  <motion.div
                    className="landing-faq__question"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span>{faq.question}</span>
                    <motion.span
                      animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      <ChevronDown size={20} />
                    </motion.span>
                  </motion.div>

                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        className="landing-faq__answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA - Premium with spring physics */}
      <section className="landing-final-cta">
        <motion.div
          className="landing-final-cta__card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.8 }}
        >
          <motion.h2
            className="landing-final-cta__title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            ¿Listo para descubrir contenido exclusivo?
          </motion.h2>

          <motion.p
            className="landing-final-cta__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Únete a miles de creadores y fans que ya están usando Creata para conectar, monetizar y crecer.
          </motion.p>

          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="primary"
              size="lg"
              className="landing-final-cta__button"
            >
              <Link to="/start" className="btn-link">
                Empezar ahora <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}

export default LandingPage;