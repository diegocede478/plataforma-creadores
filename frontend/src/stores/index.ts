/* ========================================
   Creata - Zustand Store
   ======================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '../types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      // La rehidratación de persist es síncrona (localStorage): para cuando
      // React renderiza, `isAuthenticated`/`tokens` ya están restaurados.
      // `isLoading` NO se persiste, así que arranca en false para que los
      // route guards no se queden en el spinner de "Verificando sesión...".
      isLoading: false,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, isLoading: false }),

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      logout: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),

      setLoading: (isLoading) =>
        set({ isLoading }),
    }),
    {
      name: 'creata-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      mobileMenuOpen: false,
      theme: 'dark',

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'creata-ui',
    }
  )
);

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  openModal: (content: React.ReactNode, size?: ModalState['size']) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  size: 'md',

  openModal: (content, size = 'md') => set({ isOpen: true, content, size }),
  closeModal: () => set({ isOpen: false, content: null }),
}));