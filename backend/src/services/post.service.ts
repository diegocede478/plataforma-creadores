import prisma from '../utils/prisma';

interface CreatePostData {
  creatorId: string;
  content: string;
  mediaUrl?: string;
  isPremium?: boolean;
  price?: number;
}

export const createPost = async (data: CreatePostData) => {
  if (data.isPremium && (!data.price || data.price <= 0)) {
    throw new Error('Los posts premium requieren un precio mayor a 0');
  }

  return prisma.post.create({
    data: {
      creatorId: data.creatorId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      isPremium: data.isPremium ?? false,
      price: data.isPremium ? data.price : null
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });
};

export const getPostsByCreator = async (creatorId: string, requesterId?: string, page = 1, limit = 10) => {
  const isSubscribed = await isUserSubscribed(requesterId, creatorId);

  const posts = await prisma.post.findMany({
    where: { creatorId },
    select: {
      id: true,
      content: true,
      mediaUrl: true,
      isPremium: true,
      price: true,
      createdAt: true,
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  });

  // Si el usuario no está suscrito ni es el creador, ocultar contenido premium
  const isOwner = requesterId === creatorId;
  const sanitizedPosts = posts.map(post => {
    if (post.isPremium && !isSubscribed && !isOwner) {
      return {
        ...post,
        content: undefined,
        mediaUrl: undefined,
        locked: true
      };
    }
    return { ...post, locked: false };
  });

  const total = await prisma.post.count({ where: { creatorId } });

  return {
    data: sanitizedPosts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getMyPosts = async (userId: string, page = 1, limit = 10) => {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);

  const where = { creatorId: userId };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        content: true,
        mediaUrl: true,
        isPremium: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit
    }),
    prisma.post.count({ where })
  ]);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
};

export const getFeedPosts = async (fanId: string, page = 1, limit = 10) => {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);

  // Creadores a los que el fan está suscrito (estado activo)
  const subscriptions = await prisma.subscription.findMany({
    where: { fanId, status: 'ACTIVE' },
    select: { creatorId: true }
  });

  const creatorIds = subscriptions.map((s) => s.creatorId);

  if (creatorIds.length === 0) {
    return {
      data: [],
      pagination: { page: safePage, limit: safeLimit, total: 0, totalPages: 0 }
    };
  }

  const where = { creatorId: { in: creatorIds } };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        creatorId: true,
        content: true,
        mediaUrl: true,
        isPremium: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit
    }),
    prisma.post.count({ where })
  ]);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
};

export const getPostById = async (postId: string, requesterId?: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });

  if (!post) {
    throw new Error('Post no encontrado');
  }

  const isOwner = requesterId === post.creatorId;
  const isSubscribed = await isUserSubscribed(requesterId, post.creatorId);

  if (post.isPremium && !isOwner && !isSubscribed) {
    return {
      ...post,
      content: undefined,
      mediaUrl: undefined,
      locked: true
    };
  }

  return { ...post, locked: false };
};

export const updatePost = async (postId: string, userId: string, data: { content?: string; mediaUrl?: string; isPremium?: boolean; price?: number }) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw new Error('Post no encontrado');
  }

  if (post.creatorId !== userId) {
    throw new Error('No tienes permiso para editar este post');
  }

  return prisma.post.update({
    where: { id: postId },
    data,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw new Error('Post no encontrado');
  }

  if (post.creatorId !== userId) {
    throw new Error('No tienes permiso para eliminar este post');
  }

  await prisma.post.delete({ where: { id: postId } });
  return { message: 'Post eliminado exitosamente' };
};

// Unlock premium post - pago individual
export const unlockPremiumPost = async (postId: string, fanId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw new Error('Post no encontrado');
  }

  if (!post.isPremium) {
    throw new Error('Este post no es premium');
  }

  const price = post.price ?? 0;

  // Verificar y descontar del wallet del fan
  const wallet = await prisma.wallet.findUnique({ where: { userId: fanId } });

  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  if (wallet.balance < price) {
    throw new Error('Saldo insuficiente para desbloquear este post');
  }

  // Transacción: descontar del fan, acreditar al creador
  const result = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId: fanId },
      data: { balance: { decrement: price } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'SERVICE_PURCHASE',
        amount: -price,
        referenceId: postId
      }
    });

    const creatorWallet = await tx.wallet.findUnique({ where: { userId: post.creatorId } });
    if (creatorWallet) {
      await tx.wallet.update({
        where: { userId: post.creatorId },
        data: { balance: { increment: price } }
      });

      await tx.transaction.create({
        data: {
          walletId: creatorWallet.id,
          type: 'TIP',
          amount: price,
          referenceId: postId
        }
      });
    }

    return price;
  });

  return {
    message: 'Post desbloqueado exitosamente',
    price: result
  };
};

const isUserSubscribed = async (userId: string | undefined, creatorId: string) => {
  if (!userId) return false;
  if (userId === creatorId) return true;

  const subscription = await prisma.subscription.findFirst({
    where: {
      fanId: userId,
      creatorId,
      status: 'ACTIVE'
    }
  });

  return !!subscription;
};
