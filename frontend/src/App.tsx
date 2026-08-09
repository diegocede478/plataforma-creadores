/* ========================================
   Creata - App Component with Routing
   ======================================== */

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthLayout, DashboardLayout } from './components/layout';
import { useAuthStore } from './stores';
import { useAuth } from './hooks';
import { PageLoader } from './components/ui';

// Code splitting: cada vista se carga bajo demanda (React.lazy)
// Se usa el export con nombre para que funcione con o sin export default.
const LandingPage = lazy(() => import('./views/LandingPage').then((m) => ({ default: m.LandingPage })));
const CreatorsDirectory = lazy(() => import('./views/CreatorsDirectory').then((m) => ({ default: m.CreatorsDirectory })));
const Feed = lazy(() => import('./views/Feed').then((m) => ({ default: m.Feed })));
const Login = lazy(() => import('./views/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./views/Register').then((m) => ({ default: m.Register })));
const CreatorProfile = lazy(() => import('./views/CreatorProfile').then((m) => ({ default: m.CreatorProfile })));
const DashboardOverview = lazy(() => import('./views/DashboardOverview').then((m) => ({ default: m.DashboardOverview })));
const PostsManager = lazy(() => import('./views/PostsManager').then((m) => ({ default: m.PostsManager })));
const ServicesManager = lazy(() => import('./views/ServicesManager').then((m) => ({ default: m.ServicesManager })));
const OrdersManager = lazy(() => import('./views/OrdersManager').then((m) => ({ default: m.OrdersManager })));
const Wallet = lazy(() => import('./views/Wallet').then((m) => ({ default: m.Wallet })));
const Messages = lazy(() => import('./views/Messages').then((m) => ({ default: m.Messages })));
const Settings = lazy(() => import('./views/Settings').then((m) => ({ default: m.Settings })));

/**
 * Valida la sesión persistida al arrancar la app (solo si hay una).
 * No bloquea el renderizado: si el token expiró o es inválido,
 * `refreshUser` lanza 401 y `handleLogout` limpia la sesión caducada.
 */
function SessionValidator() {
  const { isAuthenticated, refreshUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader fullScreen label="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader fullScreen label="Verificando sesión..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <>
      <SessionValidator />
      <Suspense fallback={<PageLoader fullScreen label="Cargando..." />}>
        <Routes>
          {/* Landing — sin sidebar */}
          <Route path="/" element={<LandingPage />} />

          {/* Rutas públicas bajo el sidebar unificado */}
          <Route element={<DashboardLayout />}>
            <Route path="/creators" element={<CreatorsDirectory />} />
            <Route path="/creator/:username" element={<CreatorProfile />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          {/* Private routes — todas con el sidebar del DashboardLayout */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/posts" element={<PostsManager />} />
              <Route path="/dashboard/services" element={<ServicesManager />} />
              <Route path="/dashboard/orders" element={<OrdersManager />} />
              <Route path="/dashboard/wallet" element={<Wallet />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/messages" element={<Messages />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="page-404">Página no encontrada</div>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
