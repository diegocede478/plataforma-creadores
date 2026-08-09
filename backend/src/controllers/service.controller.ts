import type { Request, Response } from 'express';
import * as serviceService from '../services/service.service';
import { getParam } from '../utils/params';

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { title, description, price, deliveryDays } = req.body;

    const service = await serviceService.createService({
      creatorId: userId,
      title,
      description,
      price,
      deliveryDays
    });

    res.status(201).json(service);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear servicio';
    res.status(400).json({ error: message });
  }
};

export const getServicesByCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = getParam(req.params.creatorId);

    const services = await serviceService.getServicesByCreator(creatorId);

    res.json(services);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener servicios';
    res.status(400).json({ error: message });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);

    const service = await serviceService.getServiceById(id);

    res.json(service);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener servicio';
    res.status(404).json({ error: message });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { title, description, price, deliveryDays, status } = req.body;

    const service = await serviceService.updateService(id, userId, {
      title,
      description,
      price,
      deliveryDays,
      status
    });

    res.json(service);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar servicio';
    res.status(400).json({ error: message });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const result = await serviceService.deleteService(id, userId);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar servicio';
    res.status(400).json({ error: message });
  }
};

export const getMyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const services = await serviceService.getMyServices(userId);

    res.json(services);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener servicios';
    res.status(400).json({ error: message });
  }
};
