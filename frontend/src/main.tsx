/* ========================================
   Creata - Main Entry Point
   ======================================== */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from './components/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './services/queryClient';
import { setupGlobalErrorHandlers } from './components/ErrorBoundary';
import './styles/main.css';
import App from './App';

// Setup global error handlers
setupGlobalErrorHandlers();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ModalProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ModalProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);