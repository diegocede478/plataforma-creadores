import prisma from '../utils/prisma';

export const getWallet = async (userId: string) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });

  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  return wallet;
};

export const deposit = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }

  // Simulación de depósito (en producción sería integración con pasarela de pago)
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount,
        referenceId: `DEPOSIT_${Date.now()}`
      }
    });

    return tx.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  });

  return {
    message: `Depósito de $${amount} exitoso`,
    wallet: updated
  };
};

export const withdraw = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  if (wallet.balance < amount) {
    throw new Error(`Saldo insuficiente. Balance actual: $${wallet.balance}`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amount: -amount,
        referenceId: `WITHDRAW_${Date.now()}`
      }
    });

    return tx.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  });

  return {
    message: `Retiro de $${amount} exitoso`,
    wallet: updated
  };
};

export const getTransactions = async (userId: string, page = 1, limit = 20) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.transaction.count({ where: { walletId: wallet.id } })
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
