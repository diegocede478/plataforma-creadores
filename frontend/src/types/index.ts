/* ========================================
   Creata - Type Definitions
   ======================================== */

export type Role = 'creator' | 'fan';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscribers: number;
    subscriptions: number;
    posts: number;
    services: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  role: Role;
}

export interface UpdateProfileData {
  username?: string;
  avatar?: string;
  bio?: string;
}

export interface Post {
  id: string;
  creatorId: string;
  creator: Pick<User, 'id' | 'username' | 'avatar' | 'role'>;
  content: string;
  mediaUrl?: string | null;
  isPremium: boolean;
  price: number;
  isUnlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  mediaUrl?: string;
  isPremium?: boolean;
  price?: number;
}

export interface UpdatePostData {
  content?: string;
  mediaUrl?: string;
  isPremium?: boolean;
  price?: number;
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Service {
  id: string;
  creatorId: string;
  creator: Pick<User, 'id' | 'username' | 'avatar' | 'role'>;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  status: 'active' | 'inactive' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
}

export interface UpdateServiceData {
  title?: string;
  description?: string;
  price?: number;
  deliveryDays?: number;
  status?: 'active' | 'inactive' | 'paused';
}

export interface Subscription {
  id: string;
  fanId: string;
  creatorId: string;
  fan: Pick<User, 'id' | 'username' | 'avatar'>;
  creator: Pick<User, 'id' | 'username' | 'avatar'>;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: string;
  expiresAt: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscription?: Subscription;
}

export interface Order {
  id: string;
  serviceId: string;
  service: Service;
  fanId: string;
  fan: Pick<User, 'id' | 'username' | 'avatar'>;
  creatorId: string;
  creator: Pick<User, 'id' | 'username' | 'avatar'>;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  price: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  sender: Pick<User, 'id' | 'username' | 'avatar'>;
  receiverId: string;
  receiver: Pick<User, 'id' | 'username' | 'avatar'>;
  content: string;
  isPaid: boolean;
  price: number;
  isUnlocked?: boolean;
  createdAt: string;
}

export interface Conversation {
  user: Pick<User, 'id' | 'username' | 'avatar' | 'role'>;
  lastMessage: Message;
  unreadCount: number;
}

export interface CreateMessageData {
  receiverId: string;
  content: string;
  isPaid?: boolean;
  price?: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'subscription' | 'post_unlock' | 'service_purchase' | 'service_sale' | 'payout';
  amount: number;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
}

export type SearchUsersParams = {
  q?: string;
  role?: Role;
  page?: number;
  limit?: number;
  sort?: 'subscribers' | 'recent';
};

export interface CreatorStats {
  subscribersCount: number;
  postsCount: number;
  servicesCount: number;
  ordersCount: number;
  totalEarnings: number;
  thisMonthEarnings: number;
}

export interface DashboardStats {
  subscribers: number;
  posts: number;
  services: number;
  pendingOrders: number;
  completedOrders: number;
  earnings: number;
  thisMonthEarnings: number;
}