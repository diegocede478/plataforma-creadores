import prisma from '../utils/prisma';

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  if (senderId === receiverId) {
    throw new Error('No puedes enviarte mensajes a ti mismo');
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    throw new Error('Destinatario no encontrado');
  }

  return prisma.message.create({
    data: {
      senderId,
      receiverId,
      content
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      receiver: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });
};

export const sendPaidMessage = async (senderId: string, receiverId: string, content: string, price: number) => {
  if (senderId === receiverId) {
    throw new Error('No puedes enviarte mensajes a ti mismo');
  }

  if (price <= 0) {
    throw new Error('El precio del mensaje debe ser mayor a 0');
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    throw new Error('Destinatario no encontrado');
  }

  // El mensaje se crea bloqueado; el destinatario paga al desbloquearlo.
  return prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
      isPaid: true,
      price
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      receiver: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });
};

export const unlockMessage = async (userId: string, messageId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) {
    throw new Error('Mensaje no encontrado');
  }

  if (message.receiverId !== userId) {
    throw new Error('Solo el destinatario puede desbloquear este mensaje');
  }

  if (!message.isPaid || !message.price) {
    throw new Error('Este mensaje no requiere desbloqueo');
  }

  if (message.isUnlocked) {
    return prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true }
        },
        receiver: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });
  }

  const price = message.price;
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    throw new Error('Wallet no encontrado');
  }

  if (wallet.balance < price) {
    throw new Error(`Saldo insuficiente. Necesitas $${price.toFixed(2)}`);
  }

  // Transacción: cobrar al destinatario, acreditar al remitente y desbloquear
  return prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId },
      data: { balance: { decrement: price } }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'TIP',
        amount: -price,
        referenceId: message.senderId
      }
    });

    const senderWallet = await tx.wallet.findUnique({ where: { userId: message.senderId } });
    if (senderWallet) {
      await tx.wallet.update({
        where: { userId: message.senderId },
        data: { balance: { increment: price } }
      });

      await tx.transaction.create({
        data: {
          walletId: senderWallet.id,
          type: 'TIP',
          amount: price,
          referenceId: userId
        }
      });
    }

    return tx.message.update({
      where: { id: messageId },
      data: { isUnlocked: true },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true }
        },
        receiver: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });
  });
};

export const getConversation = async (userId: string, otherUserId: string, page = 1, limit = 50) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      receiver: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'asc' },
    skip: (page - 1) * limit,
    take: limit
  });

  // Marcar mensajes recibidos como leídos
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      isRead: false
    },
    data: { isRead: true }
  });

  return messages;
};

export const getConversations = async (userId: string) => {
  // Obtener los usuarios con los que he tenido conversaciones
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }]
    },
    select: {
      id: true,
      content: true,
      isPaid: true,
      price: true,
      isUnlocked: true,
      isRead: true,
      createdAt: true,
      senderId: true,
      receiverId: true,
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true,
          role: true
        }
      },
      receiver: {
        select: {
          id: true,
          username: true,
          avatar: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Agrupar por conversación (pareja de usuarios), conservando el mensaje más reciente
  const conversationMap = new Map<string, {
    user: { id: string; username: string; avatar: string | null; role: string };
    lastMessage: (typeof messages)[number];
    unreadCount: number;
  }>();

  for (const message of messages) {
    const otherId = message.senderId === userId ? message.receiverId : message.senderId;
    const otherUser = message.senderId === userId ? message.receiver : message.sender;

    const existing = conversationMap.get(otherId);

    // El primer mensaje que vemos por cada par ya es el más reciente (orderBy desc)
    if (!existing) {
      conversationMap.set(otherId, {
        user: {
          id: otherUser.id,
          username: otherUser.username,
          avatar: otherUser.avatar,
          role: otherUser.role
        },
        lastMessage: message,
        unreadCount: !message.isRead && message.receiverId === userId ? 1 : 0
      });
    } else if (!message.isRead && message.receiverId === userId) {
      existing.unreadCount += 1;
    }
  }

  return Array.from(conversationMap.values());
};

export const getUnreadCount = async (userId: string) => {
  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false
    }
  });

  return count;
};
