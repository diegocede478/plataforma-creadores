import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { getParam } from '../utils/params';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const serviceId = getParam(req.params.serviceId);

    const result = await orderService.createOrder(serviceId, userId);

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al contratar servicio';
    res.status(400).json({ error: message });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const orders = await orderService.getMyOrders(userId);

    res.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener órdenes';
    res.status(400).json({ error: message });
  }
};

export const getMySales = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const sales = await orderService.getMySales(userId);

    res.json(sales);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener ventas';
    res.status(400).json({ error: message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, userId, status);

    res.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar orden';
    res.status(400).json({ error: message });
  }
};
