import type { Request, Response } from 'express';
import * as subscriptionService from '../services/subscription.service';
import { getParam } from '../utils/params';

export const subscribeToCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const creatorId = getParam(req.params.creatorId);

    const result = await subscriptionService.subscribeToCreator(userId, creatorId);

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al suscribirse';
    res.status(400).json({ error: message });
  }
};

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const creatorId = getParam(req.params.creatorId);

    const result = await subscriptionService.cancelSubscription(userId, creatorId);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cancelar suscripción';
    res.status(400).json({ error: message });
  }
};

export const getMySubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const subscriptions = await subscriptionService.getMySubscriptions(userId);

    res.json(subscriptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener suscripciones';
    res.status(400).json({ error: message });
  }
};

export const getMySubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const subscribers = await subscriptionService.getMySubscribers(userId);

    res.json(subscribers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener suscriptores';
    res.status(400).json({ error: message });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const creatorId = getParam(req.params.creatorId);

    const result = await subscriptionService.getSubscriptionStatus(userId, creatorId);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener estado';
    res.status(400).json({ error: message });
  }
};
