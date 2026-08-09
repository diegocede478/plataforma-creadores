import prisma from '../utils/prisma';

export const createOrder = async (serviceId: string, fanId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  if (!service) {
    throw new Error('Servicio no encontrado');
  }

  if (service.status !== 'ACTIVE') {
    throw new Error('Este servicio no está disponible');
  }

  if (service.creatorId === fanId) {
    throw new Error('No puedes contratar tu propio servicio');
  }

  // Verificar saldo del fan
  const wallet = await prisma.wallet.findUnique({ where: { userId: fanId } });
  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  const price = Number(service.price);

  if (wallet.balance < price) {
    throw new Error(`Saldo insuficiente. Necesitas $${price} para contratar este servicio`);
  }

  // Transacción: crear orden, descontar del fan, acreditar al creador
  const order = await prisma.$transaction(async (tx) => {
    // Descontar del fan
    await tx.wallet.update({
      where: { userId: fanId },
      data: { balance: { decrement: price } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'SERVICE_PURCHASE',
        amount: -price,
        referenceId: serviceId
      }
    });

    // Acreditar al creador
    const creatorWallet = await tx.wallet.findUnique({ where: { userId: service.creatorId } });
    if (creatorWallet) {
      await tx.wallet.update({
        where: { userId: service.creatorId },
        data: { balance: { increment: price } }
      });

      await tx.transaction.create({
        data: {
          walletId: creatorWallet.id,
          type: 'SERVICE_PAYMENT',
          amount: price,
          referenceId: serviceId
        }
      });
    }

    return tx.order.create({
      data: {
        serviceId,
        fanId,
        creatorId: service.creatorId,
        status: 'PENDING'
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            deliveryDays: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });
  });

  return {
    message: 'Servicio contratado exitosamente',
    order,
    price
  };
};

export const getMyOrders = async (fanId: string) => {
  const orders = await prisma.order.findMany({
    where: { fanId },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          price: true,
          deliveryDays: true
        }
      },
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return orders;
};

export const getMySales = async (creatorId: string) => {
  const sales = await prisma.order.findMany({
    where: { creatorId },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          price: true,
          deliveryDays: true
        }
      },
      fan: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return sales;
};

export const updateOrderStatus = async (orderId: string, userId: string, status: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new Error('Orden no encontrada');
  }

  // Solo el creador puede actualizar el estado de la orden
  if (order.creatorId !== userId) {
    throw new Error('No tienes permiso para actualizar esta orden');
  }

  // Acepta tanto minúsculas (frontend) como mayúsculas (base de datos)
  const normalizedStatus = status.toUpperCase();
  const validStatuses = ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(normalizedStatus)) {
    throw new Error('Estado de orden inválido');
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: normalizedStatus,
      completedAt: normalizedStatus === 'COMPLETED' ? new Date() : order.completedAt
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          price: true
        }
      },
      fan: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });

  return updated;
};
