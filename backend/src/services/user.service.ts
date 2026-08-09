import prisma from '../utils/prisma';
import { env } from '../utils/env';
import type { Role } from '../types';

export const getUserByUsername = async (username: string, requesterId?: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          services: true,
          subscribers: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  let isSubscribed = false;
  if (requesterId && requesterId !== user.id) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        fanId: requesterId,
        creatorId: user.id,
        status: 'ACTIVE'
      }
    });
    isSubscribed = !!subscription;
  }

  return { ...user, isSubscribed };
};

export const searchUsers = async (params: {
  query?: string;
  role?: string;
  page?: number;
  limit?: number;
  sort?: 'subscribers' | 'recent';
}) => {
  const { query, role, page = 1, limit = 20, sort = 'subscribers' } = params;

  // `mode: 'insensitive'` solo lo soporta PostgreSQL/MySQL; SQLite (dev) no.
  const isPostgres = env.DATABASE_URL.startsWith('postgres');

  const where: {
    OR?: Array<{ username: { contains: string; mode?: 'insensitive' } } | { bio: { contains: string; mode?: 'insensitive' } }>;
    role?: Role;
  } = {};

  if (query) {
    const insensitive = isPostgres ? { mode: 'insensitive' as const } : {};
    where.OR = [
      { username: { contains: query, ...insensitive } },
      { bio: { contains: query, ...insensitive } }
    ];
  }

  if (role) {
    where.role = role.toUpperCase() as Role;
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: { subscribers: true, posts: true }
        }
      },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy:
        sort === 'recent'
          ? { createdAt: 'desc' }
          : { subscribers: { _count: 'desc' } }
    }),
    prisma.user.count({ where })
  ]);

  return {
    data: users,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
};

export const updateProfile = async (
  userId: string,
  data: { username?: string; avatar?: string; bio?: string }
) => {
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: data.username,
        NOT: { id: userId }
      }
    });

    if (existing) {
      throw new Error('El nombre de usuario ya está en uso');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      role: true,
      email: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return user;
};

export const getCreatorStats = async (creatorId: string) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [postsCount, servicesCount, subscribersCount, ordersCount, totalEarnings, thisMonthEarnings] = await Promise.all([
    prisma.post.count({ where: { creatorId } }),
    prisma.service.count({ where: { creatorId, status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { creatorId, status: 'ACTIVE' } }),
    prisma.order.count({ where: { creatorId, status: 'COMPLETED' } }),
    prisma.transaction.aggregate({
      where: {
        wallet: { userId: creatorId },
        type: { in: ['SUBSCRIPTION', 'SERVICE_PAYMENT', 'TIP'] }
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        wallet: { userId: creatorId },
        type: { in: ['SUBSCRIPTION', 'SERVICE_PAYMENT', 'TIP'] },
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    })
  ]);

  return {
    postsCount,
    servicesCount,
    subscribersCount,
    ordersCount,
    totalEarnings: totalEarnings._sum.amount || 0,
    thisMonthEarnings: thisMonthEarnings._sum.amount || 0
  };
};
