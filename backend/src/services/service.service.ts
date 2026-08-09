import prisma from '../utils/prisma';

interface CreateServiceData {
  creatorId: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
}

export const createService = async (data: CreateServiceData) => {
  if (data.price <= 0) {
    throw new Error('El precio debe ser mayor a 0');
  }

  if (data.deliveryDays < 1) {
    throw new Error('Los días de entrega deben ser al menos 1');
  }

  return prisma.service.create({
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

export const getServicesByCreator = async (creatorId: string) => {
  const services = await prisma.service.findMany({
    where: {
      creatorId,
      status: 'ACTIVE'
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return services;
};

export const getServiceById = async (serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true
        }
      },
      _count: {
        select: { orders: true }
      }
    }
  });

  if (!service) {
    throw new Error('Servicio no encontrado');
  }

  return service;
};

export const updateService = async (
  serviceId: string,
  userId: string,
  data: { title?: string; description?: string; price?: number; deliveryDays?: number; status?: string }
) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    throw new Error('Servicio no encontrado');
  }

  if (service.creatorId !== userId) {
    throw new Error('No tienes permiso para editar este servicio');
  }

  return prisma.service.update({
    where: { id: serviceId },
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

export const deleteService = async (serviceId: string, userId: string) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    throw new Error('Servicio no encontrado');
  }

  if (service.creatorId !== userId) {
    throw new Error('No tienes permiso para eliminar este servicio');
  }

  // Soft delete - mantener órdenes existentes
  await prisma.service.update({
    where: { id: serviceId },
    data: { status: 'DELETED' }
  });

  return { message: 'Servicio eliminado exitosamente' };
};

export const getMyServices = async (userId: string) => {
  const services = await prisma.service.findMany({
    where: { creatorId: userId },
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return services;
};
