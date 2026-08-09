import type { Request, Response } from 'express';
import * as messageService from '../services/message.service';
import { getParam } from '../utils/params';

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { receiverId, content } = req.body;

    const message = await messageService.sendMessage(userId, receiverId, content);

    res.status(201).json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al enviar mensaje';
    res.status(400).json({ error: message });
  }
};

export const sendPaidMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { receiverId, content, price } = req.body;

    const message = await messageService.sendPaidMessage(userId, receiverId, content, price);

    res.status(201).json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al enviar mensaje';
    res.status(400).json({ error: message });
  }
};

export const unlockMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const messageId = getParam(req.params.id);

    const message = await messageService.unlockMessage(userId, messageId);

    res.json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al desbloquear mensaje';
    res.status(400).json({ error: message });
  }
};

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const otherUserId = getParam(req.params.userId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const messages = await messageService.getConversation(userId, otherUserId, page, limit);

    res.json(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener conversación';
    res.status(400).json({ error: message });
  }
};

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const conversations = await messageService.getConversations(userId);

    res.json(conversations);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener conversaciones';
    res.status(400).json({ error: message });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const count = await messageService.getUnreadCount(userId);

    res.json({ count });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener contador';
    res.status(400).json({ error: message });
  }
};
