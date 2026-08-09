/* ========================================
   Creata - Custom Hooks
   ======================================== */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore, useToastStore } from '../stores';
import type { User, Post, Service, Subscription, Order, Message, Wallet, Transaction, PaginatedResponse, CreatorStats, DashboardStats, SearchUsersParams } from '../types';

// Auth hooks
export function useAuth() {
  const { user, tokens, isAuthenticated, isLoading, setAuth, setUser, logout, setLoading } = useAuthStore();
  const { addToast } = useToastStore();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      setAuth(response.user, response.tokens);
      return response;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  const register = useCallback(async (data: { email: string; password: string; username: string; role: string }) => {
    setLoading(true);
    try {
      const response = await api.register(data);
      setAuth(response.user, response.tokens);
      return response;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getGoogleAuthUrl();
      if (response?.url) {
        window.location.href = response.url;
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Google OAuth no está configurado' });
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const handleOAuthCallback = useCallback(async (accessToken: string, refreshToken: string) => {
    setLoading(true);
    try {
      const response = await api.handleOAuthCallback(accessToken, refreshToken);
      setAuth(response.user, response.tokens);
      return response;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // El backend puede no estar disponible; la sesión se cierra igualmente en el cliente.
    } finally {
      logout();
    }
  }, [logout]);

  const refreshUser = useCallback(async () => {
    if (!api.isAuthenticated()) return;
    try {
      const user = await api.getMe();
      setUser(user);
    } catch {
      handleLogout();
    }
  }, [setUser, handleLogout]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    logout: handleLogout,
    refreshUser,
  };
}

// User hooks
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => api.getUserProfile(username),
    enabled: !!username,
  });
}

export function useSearchUsers(params: SearchUsersParams) {
  return useQuery({
    queryKey: ['users', 'search', params],
    queryFn: () => api.searchUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (data: { username?: string; avatar?: string; bio?: string }) => api.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user', user?.username] });
      addToast({ type: 'success', title: 'Perfil actualizado', message: 'Los cambios se han guardado correctamente' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useChangePassword() {
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Contraseña actualizada', message: 'Tu contraseña se ha cambiado correctamente' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => api.getMyStats(),
    enabled: api.isAuthenticated(),
  });
}

export function useMyPosts(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['posts', 'me', params],
    queryFn: () => api.getMyPosts(params),
    enabled: api.isAuthenticated(),
  });
}

export function useFeedPosts(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['posts', 'feed', params],
    queryFn: () => api.getFeedPosts(params),
    enabled: api.isAuthenticated(),
    placeholderData: (previousData) => previousData,
  });
}

// Post hooks
export function usePostsByCreator(creatorId: string, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['posts', 'creator', creatorId, params],
    queryFn: () => api.getPostsByCreator(creatorId, params),
    enabled: !!creatorId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (data: { content: string; mediaUrl?: string; isPremium?: boolean; price?: number }) => api.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      addToast({ type: 'success', title: 'Publicación creada', message: 'Tu post ha sido publicado' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function usePostById(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => api.getPostById(id),
    enabled: !!id,
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content?: string; mediaUrl?: string; isPremium?: boolean; price?: number } }) =>
      api.updatePost(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      addToast({ type: 'success', title: 'Publicación actualizada' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => api.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      addToast({ type: 'success', title: 'Publicación eliminada' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useUnlockPremiumPost() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => api.unlockPremiumPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      addToast({ type: 'success', title: 'Contenido desbloqueado', message: 'Ahora puedes ver el contenido premium' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

// Service hooks
export function useServicesByCreator(creatorId: string) {
  return useQuery({
    queryKey: ['services', 'creator', creatorId],
    queryFn: () => api.getServicesByCreator(creatorId),
    enabled: !!creatorId,
  });
}

export function useMyServices() {
  return useQuery({
    queryKey: ['services', 'me'],
    queryFn: () => api.getMyServices(),
    enabled: api.isAuthenticated(),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (data: { title: string; description: string; price: number; deliveryDays: number }) => api.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      addToast({ type: 'success', title: 'Servicio creado', message: 'Tu servicio ya está disponible' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useServiceById(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => api.getServiceById(id),
    enabled: !!id,
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string; price?: number; deliveryDays?: number; status?: string } }) =>
      api.updateService(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      addToast({ type: 'success', title: 'Servicio actualizado' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => api.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      addToast({ type: 'success', title: 'Servicio eliminado' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

// Subscription hooks
export function useSubscribeToCreator() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (creatorId: string) => api.subscribeToCreator(creatorId),
    onSuccess: (_, creatorId) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'status', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      addToast({ type: 'success', title: '¡Suscripción exitosa!', message: 'Ahora tienes acceso al contenido premium' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (creatorId: string) => api.cancelSubscription(creatorId),
    onSuccess: (_, creatorId) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'status', creatorId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      addToast({ type: 'success', title: 'Suscripción cancelada', message: 'Tu suscripción ha sido cancelada' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useMySubscriptions() {
  return useQuery({
    queryKey: ['subscriptions', 'my-subscriptions'],
    queryFn: () => api.getMySubscriptions(),
    enabled: api.isAuthenticated(),
  });
}

export function useMySubscribers() {
  return useQuery({
    queryKey: ['subscriptions', 'my-fans'],
    queryFn: () => api.getMySubscribers(),
    enabled: api.isAuthenticated(),
  });
}

export function useSubscriptionStatus(creatorId: string) {
  return useQuery({
    queryKey: ['subscription', 'status', creatorId],
    queryFn: () => api.getSubscriptionStatus(creatorId),
    enabled: !!creatorId && api.isAuthenticated(),
  });
}

// Order hooks
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (serviceId: string) => api.createOrder(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast({ type: 'success', title: 'Orden creada', message: 'El creador ha sido notificado' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'my-orders'],
    queryFn: () => api.getMyOrders(),
    enabled: api.isAuthenticated(),
  });
}

export function useMySales() {
  return useQuery({
    queryKey: ['orders', 'my-sales'],
    queryFn: () => api.getMySales(),
    enabled: api.isAuthenticated(),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast({ type: 'success', title: 'Estado actualizado' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

// Message hooks
export function useMessages(userId: string) {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: () => api.getMessages(userId),
    enabled: !!userId && api.isAuthenticated(),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (data: { receiverId: string; content: string; isPaid?: boolean; price?: number }) => api.sendMessage(data),
    onSuccess: (_, { receiverId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', receiverId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(),
    enabled: api.isAuthenticated(),
  });
}

// Wallet hooks
export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.getWallet(),
    enabled: api.isAuthenticated(),
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (amount: number) => api.deposit(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      addToast({ type: 'success', title: 'Depósito realizado', message: 'El saldo se ha actualizado' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation({
    mutationFn: (amount: number) => api.withdraw(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      addToast({ type: 'success', title: 'Retiro solicitado', message: 'Procesaremos tu solicitud pronto' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });
}

export function useTransactions(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.getTransactions(params),
    enabled: api.isAuthenticated(),
  });
}

// Utility hooks
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}