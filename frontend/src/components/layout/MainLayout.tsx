/* ========================================
   Creata - Main Layout Component
   ======================================== */

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ToastContainer } from '../ui/Toast';
import './MainLayout.css';

export function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-layout__content" role="main">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <Navbar />
      <main className="auth-layout__content" role="main">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}