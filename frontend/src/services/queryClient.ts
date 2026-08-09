/* ========================================
   Creata - React Query Configuration
   ======================================== */

import { QueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../services/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query settings
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (except 401 which is handled by the API client)
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      // Default error handler
      throwOnError: false,
    },
    mutations: {
      // Global mutation settings
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Default error handler - errors are handled by mutation onError
      throwOnError: false,
    },
  },
});

// Query key factories for consistent cache keys
export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  // Users
  users: {
    profile: (username: string) => ['users', 'profile', username] as const,
    search: (params: { q?: string; role?: string; page?: number; limit?: number }) =>
      ['users', 'search', params] as const,
    stats: () => ['users', 'stats'] as const,
  },
  // Posts
  posts: {
    byCreator: (creatorId: string, params: { page?: number; limit?: number } = {}) =>
      ['posts', 'creator', creatorId, params] as const,
    byId: (id: string) => ['posts', id] as const,
    all: (params?: { page?: number; limit?: number }) =>
      ['posts', 'all', params] as const,
  },
  // Services
  services: {
    byCreator: (creatorId: string) => ['services', 'creator', creatorId] as const,
    myServices: () => ['services', 'me'] as const,
    byId: (id: string) => ['services', id] as const,
  },
  // Subscriptions
  subscriptions: {
    myCreators: () => ['subscriptions', 'my-creators'] as const,
    myFans: () => ['subscriptions', 'my-fans'] as const,
    status: (creatorId: string) => ['subscriptions', 'status', creatorId] as const,
  },
  // Orders
  orders: {
    myOrders: () => ['orders', 'my-orders'] as const,
    mySales: () => ['orders', 'my-sales'] as const,
    byId: (id: string) => ['orders', id] as const,
  },
  // Messages
  messages: {
    conversations: () => ['messages', 'conversations'] as const,
    byUser: (userId: string) => ['messages', 'user', userId] as const,
  },
  // Wallet
  wallet: {
    current: () => ['wallet'] as const,
    transactions: (params: { page?: number; limit?: number } = {}) =>
      ['wallet', 'transactions', params] as const,
  },
} as const;

// Helper functions for common invalidation patterns
export const invalidateQueries = {
  // Invalidate all user-related queries
  user: (username?: string) => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    if (username) {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(username) });
    }
  },

  // Invalidate all posts-related queries
  posts: (creatorId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    if (creatorId) {
      queryClient.invalidateQueries({ queryKey: ['posts', 'creator', creatorId] });
    }
  },

  // Invalidate all services-related queries
  services: (creatorId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
    if (creatorId) {
      queryClient.invalidateQueries({ queryKey: ['services', 'creator', creatorId] });
    }
  },

  // Invalidate subscriptions
  subscriptions: (creatorId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    if (creatorId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.status(creatorId) });
    }
  },

  // Invalidate orders
  orders: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  },

  // Invalidate messages
  messages: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.byUser(userId) });
    }
  },

  // Invalidate wallet
  wallet: () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  },

  // Invalidate everything (use sparingly)
  all: () => {
    queryClient.invalidateQueries();
  },
};

// Prefetch helpers for smoother navigation
export const prefetchQueries = {
  userProfile: async (username: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.users.profile(username),
      queryFn: () => api.getUserProfile(username),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  },

  postsByCreator: async (creatorId: string, params: { page?: number; limit?: number } = {}) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.byCreator(creatorId, params),
      queryFn: () => api.getPostsByCreator(creatorId, params),
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  },

  servicesByCreator: async (creatorId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.services.byCreator(creatorId),
      queryFn: () => api.getServicesByCreator(creatorId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },

  subscriptionStatus: async (creatorId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subscriptions.status(creatorId),
      queryFn: () => api.getSubscriptionStatus(creatorId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },
};

// Error boundary for React Query errors
export const handleApiError = (error: unknown, fallbackMessage = 'Ha ocurrido un error'): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};

// Type-safe wrapper for queryClient methods
export const typedQueryClient = {
  getQueryData: <T>(key: readonly unknown[]) => queryClient.getQueryData<T>(key),
  setQueryData: <T>(key: readonly unknown[], data: T | ((old: T | undefined) => T)) =>
    queryClient.setQueryData(key, data),
  invalidateQueries: (key: readonly unknown[]) => queryClient.invalidateQueries({ queryKey: key }),
  removeQueries: (key: readonly unknown[]) => queryClient.removeQueries({ queryKey: key }),
  prefetchQuery: <T>(key: readonly unknown[], queryFn: () => Promise<T>, options?: { staleTime?: number }) =>
    queryClient.prefetchQuery({ queryKey: key, queryFn, staleTime: options?.staleTime }),
};