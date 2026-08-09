import type { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { getParam } from '../utils/params';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = getParam(req.params.username);
    const requesterId = req.user?.id;

    const user = await userService.getUserByUsername(username, requesterId);

    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener usuario';
    res.status(404).json({ error: message });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, role, page, limit, sort } = req.query;

    const users = await userService.searchUsers({
      query: typeof q === 'string' ? q : undefined,
      role: typeof role === 'string' ? role : undefined,
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
      sort: sort === 'recent' ? 'recent' : 'subscribers'
    });

    res.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al buscar usuarios';
    res.status(400).json({ error: message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { username, avatar, bio } = req.body;

    const user = await userService.updateProfile(userId, { username, avatar, bio });

    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
    res.status(400).json({ error: message });
  }
};

export const getMyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const stats = await userService.getCreatorStats(userId);

    res.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener estadísticas';
    res.status(400).json({ error: message });
  }
};
