import prisma from '../utils/prisma';

const SUBSCRIPTION_PRICE = 9.99; // Precio mensual simulado
const SUBSCRIPTION_DURATION_DAYS = 30;

export const subscribeToCreator = async (fanId: string, creatorId: string) => {
  if (fanId === creatorId) {
    throw new Error('No puedes suscribirte a ti mismo');
  }

  const creator = await prisma.user.findUnique({ where: { id: creatorId } });
  if (!creator) {
    throw new Error('Creador no encontrado');
  }

  // Verificar suscripción existente activa
  const existing = await prisma.subscription.findUnique({
    where: {
      fanId_creatorId: { fanId, creatorId }
    }
  });

  if (existing && existing.status === 'ACTIVE') {
    throw new Error('Ya estás suscrito a este creador');
  }

  // Verificar saldo del fan
  const wallet = await prisma.wallet.findUnique({ where: { userId: fanId } });
  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  if (wallet.balance < SUBSCRIPTION_PRICE) {
    throw new Error(`Saldo insuficiente. Necesitas $${SUBSCRIPTION_PRICE} para suscribirte`);
  }

  // Calcular fecha de expiración
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + SUBSCRIPTION_DURATION_DAYS);

  // Transacción: crear suscripción y mover dinero
  const subscription = await prisma.$transaction(async (tx) => {
    // Descontar del fan
    await tx.wallet.update({
      where: { userId: fanId },
      data: { balance: { decrement: SUBSCRIPTION_PRICE } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'SUBSCRIPTION',
        amount: -SUBSCRIPTION_PRICE,
        referenceId: creatorId
      }
    });

    // Acreditar al creador
    const creatorWallet = await tx.wallet.findUnique({ where: { userId: creatorId } });
    if (creatorWallet) {
      await tx.wallet.update({
        where: { userId: creatorId },
        data: { balance: { increment: SUBSCRIPTION_PRICE } }
      });

      await tx.transaction.create({
        data: {
          walletId: creatorWallet.id,
          type: 'SUBSCRIPTION',
          amount: SUBSCRIPTION_PRICE,
          referenceId: fanId
        }
      });
    }

    // Crear o actualizar suscripción
    if (existing) {
      return tx.subscription.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          startedAt: now,
          expiresAt
        }
      });
    }

    return tx.subscription.create({
      data: {
        fanId,
        creatorId,
        status: 'ACTIVE',
        startedAt: now,
        expiresAt
      }
    });
  });

  return {
    message: 'Suscripción exitosa',
    subscription,
    price: SUBSCRIPTION_PRICE,
    expiresAt
  };
};

export const cancelSubscription = async (fanId: string, creatorId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      fanId_creatorId: { fanId, creatorId }
    }
  });

  if (!subscription) {
    throw new Error('No estás suscrito a este creador');
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'CANCELLED' }
  });

  return { message: 'Suscripción cancelada', subscription: updated };
};

export const getMySubscriptions = async (fanId: string) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      fanId,
      status: 'ACTIVE'
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true
        }
      },
      fan: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true
        }
      }
    },
    orderBy: { startedAt: 'desc' }
  });

  return subscriptions;
};

export const getMySubscribers = async (creatorId: string) => {
  const subscribers = await prisma.subscription.findMany({
    where: {
      creatorId,
      status: 'ACTIVE'
    },
    include: {
      fan: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true
        }
      }
    },
    orderBy: { startedAt: 'desc' }
  });

  return subscribers;
};

export const getSubscriptionStatus = async (fanId: string, creatorId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      fanId_creatorId: { fanId, creatorId }
    }
  });

  return {
    isSubscribed: subscription?.status === 'ACTIVE',
    status: subscription?.status ?? null,
    expiresAt: subscription?.expiresAt ?? null
  };
};
