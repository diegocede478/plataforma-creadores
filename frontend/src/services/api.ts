/* ========================================
   Creata - API Client Configuration
   ======================================== */

import type { ApiError as ApiErrorType, User, Post, Service, Subscription, Order, Message, Wallet, Transaction, PaginatedResponse, CreatorStats, SearchUsersParams, Conversation } from '../types';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(statusCode: number, data: unknown): ApiError {
    const errorData = data as { error?: string; message?: string; code?: string; details?: unknown };
    return new ApiError(
      errorData.message || errorData.error || 'Error en la petición',
      statusCode,
      errorData.code,
      errorData.details
    );
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

// El backend devuelve los status en UPPERCASE ('PENDING', 'ACTIVE'); el frontend
// los tipa en minúsculas ('pending', 'active'). Normalizamos en la capa de API
// para que toda la UI los consuma de forma consistente y nunca se rompa con un
// acceso a `config[status]` indefinido.
function normalizeStatus<T extends { status: string }>(item: T): T {
  return { ...item, status: item.status.toLowerCase() as T['status'] };
}

function normalizeStatusList<T extends { status: string }>(items: T[]): T[] {
  return items.map(normalizeStatus);
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadTokens();
  }

  private loadTokens(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    // `baseUrl` puede ser relativa ('/api') en producción; el constructor de URL
    // exige una base absoluta, así que resolvemos contra el origen actual.
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, skipAuth = false, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth && this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 - try to refresh token (only once)
    if (response.status === 401 && this.refreshToken && !skipAuth && !endpoint.includes('/auth/')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...fetchOptions, headers });
      } else {
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError('Sesión expirada', 401, 'SESSION_EXPIRED');
      }
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : { error: 'Error del servidor', statusCode: response.status };
      throw ApiError.fromResponse(response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return isJson ? response.json() : response.text() as Promise<T>;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        this.saveTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Auth methods
  async register(data: { email: string; password: string; username: string; role: string }): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    const response = await this.request<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data), skipAuth: true }
    );
    this.saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
    return response;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    const response = await this.request<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }), skipAuth: true }
    );
    this.saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async refresh(): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refreshToken: this.refreshToken }) }
    );
    this.saveTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // User methods
  async getUserProfile(username: string): Promise<User> {
    return this.request<User>(`/users/${username}`);
  }

  async updateProfile(data: { username?: string; avatar?: string; bio?: string }): Promise<User> {
    return this.request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
  }

  async searchUsers(params: SearchUsersParams): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>('/users/search', { params });
  }

  async getMyStats(): Promise<CreatorStats> {
    return this.request<CreatorStats>('/users/me/stats');
  }

  // Post methods
  async getMyPosts(params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Post>> {
    return this.request<PaginatedResponse<Post>>('/posts/me', { params });
  }

  async getPostsByCreator(creatorId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Post>> {
    return this.request<PaginatedResponse<Post>>(`/posts/creator/${creatorId}`, { params });
  }

  async getFeedPosts(params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Post>> {
    return this.request<PaginatedResponse<Post>>('/posts/feed', { params });
  }

  async createPost(data: { content: string; mediaUrl?: string; isPremium?: boolean; price?: number }): Promise<Post> {
    return this.request<Post>('/posts', { method: 'POST', body: JSON.stringify(data) });
  }

  async getPostById(id: string): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  async updatePost(id: string, data: { content?: string; mediaUrl?: string; isPremium?: boolean; price?: number }): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deletePost(id: string): Promise<void> {
    return this.request<void>(`/posts/${id}`, { method: 'DELETE' });
  }

  async unlockPremiumPost(id: string): Promise<Post> {
    return this.request<Post>(`/posts/${id}/unlock`, { method: 'POST' });
  }

  // Service methods
  async getServicesByCreator(creatorId: string): Promise<Service[]> {
    return this.request<Service[]>(`/services/creator/${creatorId}`);
  }

  async getMyServices(): Promise<Service[]> {
    return normalizeStatusList(await this.request<Service[]>('/services/me'));
  }

  async createService(data: { title: string; description: string; price: number; deliveryDays: number }): Promise<Service> {
    return normalizeStatus(await this.request<Service>('/services', { method: 'POST', body: JSON.stringify(data) }));
  }

  async getServiceById(id: string): Promise<Service> {
    return normalizeStatus(await this.request<Service>(`/services/${id}`));
  }

  async updateService(id: string, data: { title?: string; description?: string; price?: number; deliveryDays?: number; status?: string }): Promise<Service> {
    return normalizeStatus(await this.request<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
  }

  async deleteService(id: string): Promise<void> {
    return this.request<void>(`/services/${id}`, { method: 'DELETE' });
  }

  // Subscription methods
  async subscribeToCreator(creatorId: string): Promise<Subscription> {
    return normalizeStatus(await this.request<Subscription>(`/subscriptions/${creatorId}`, { method: 'POST' }));
  }

  async cancelSubscription(creatorId: string): Promise<void> {
    return this.request<void>(`/subscriptions/${creatorId}`, { method: 'DELETE' });
  }

  // Mis suscripciones como fan (a qué creadores sigo)
  async getMySubscriptions(): Promise<Subscription[]> {
    return normalizeStatusList(await this.request<Subscription[]>('/subscriptions/my/subscriptions'));
  }

  // Mis suscriptores (fans que me siguen a mí)
  async getMySubscribers(): Promise<Subscription[]> {
    return normalizeStatusList(await this.request<Subscription[]>('/subscriptions/my/subscribers'));
  }

  async getSubscriptionStatus(creatorId: string): Promise<{ isSubscribed: boolean; subscription?: Subscription }> {
    const result = await this.request<{ isSubscribed: boolean; subscription?: Subscription }>(`/subscriptions/status/${creatorId}`);
    if (result.subscription) {
      result.subscription = normalizeStatus(result.subscription);
    }
    return result;
  }

  // Order methods
  async createOrder(serviceId: string): Promise<Order> {
    return normalizeStatus(await this.request<Order>(`/orders/${serviceId}`, { method: 'POST' }));
  }

  async getMyOrders(): Promise<Order[]> {
    return normalizeStatusList(await this.request<Order[]>('/orders/my-orders'));
  }

  async getMySales(): Promise<Order[]> {
    return normalizeStatusList(await this.request<Order[]>('/orders/my-sales'));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return normalizeStatus(await this.request<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }));
  }

  // Message methods
  async getMessages(userId: string): Promise<Message[]> {
    return this.request<Message[]>(`/messages/${userId}`);
  }

  async sendMessage(data: { receiverId: string; content: string; isPaid?: boolean; price?: number }): Promise<Message> {
    return this.request<Message>('/messages', { method: 'POST', body: JSON.stringify(data) });
  }

  async unlockMessage(id: string): Promise<Message> {
    return this.request<Message>(`/messages/${id}/unlock`, { method: 'POST' });
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/messages/conversations');
  }

  // Wallet methods
  async getWallet(): Promise<Wallet> {
    return this.request<Wallet>('/wallet');
  }

  async deposit(amount: number): Promise<{ wallet: Wallet; transaction: Transaction }> {
    return this.request<{ wallet: Wallet; transaction: Transaction }>('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount }) });
  }

  async withdraw(amount: number): Promise<{ wallet: Wallet; transaction: Transaction }> {
    return this.request<{ wallet: Wallet; transaction: Transaction }>('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount }) });
  }

  async getTransactions(params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Transaction>> {
    return this.request<PaginatedResponse<Transaction>>('/wallet/transactions', { params });
  }

  // Utility
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const api = new ApiClient(API_BASE_URL);
export { ApiClient };
export type { RequestOptions };