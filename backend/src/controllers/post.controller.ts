import type { Request, Response } from 'express';
import * as postService from '../services/post.service';
import { getParam } from '../utils/params';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { content, mediaUrl, isPremium, price } = req.body;

    const post = await postService.createPost({
      creatorId: userId,
      content,
      mediaUrl,
      isPremium,
      price
    });

    res.status(201).json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear post';
    res.status(400).json({ error: message });
  }
};

export const getPostsByCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = getParam(req.params.creatorId);
    const requesterId = req.user?.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await postService.getPostsByCreator(creatorId, requesterId, page, limit);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener posts';
    res.status(400).json({ error: message });
  }
};

export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await postService.getMyPosts(userId, page, limit);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener tus publicaciones';
    res.status(400).json({ error: message });
  }
};

export const getFeedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await postService.getFeedPosts(userId, page, limit);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener el feed';
    res.status(400).json({ error: message });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const requesterId = req.user?.userId;

    const post = await postService.getPostById(id, requesterId);

    res.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener post';
    res.status(404).json({ error: message });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { content, mediaUrl, isPremium, price } = req.body;

    const post = await postService.updatePost(id, userId, { content, mediaUrl, isPremium, price });

    res.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar post';
    res.status(400).json({ error: message });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const result = await postService.deletePost(id, userId);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar post';
    res.status(400).json({ error: message });
  }
};

export const unlockPremiumPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const result = await postService.unlockPremiumPost(id, userId);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al desbloquear post';
    res.status(400).json({ error: message });
  }
};
