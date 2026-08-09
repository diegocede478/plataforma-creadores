import { Router } from 'express';
import { z } from 'zod';
import * as postController from '../controllers/post.controller';
import { authenticate, requireCreator } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'El contenido es requerido').max(5000),
    mediaUrl: z.string().url().optional(),
    isPremium: z.boolean().optional(),
    price: z.number().positive().optional()
  })
});

const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000).optional(),
    mediaUrl: z.string().url().optional(),
    isPremium: z.boolean().optional(),
    price: z.number().positive().optional()
  })
});

router.post('/', authenticate, requireCreator, validateRequest(createPostSchema), postController.createPost);
router.get('/creator/:creatorId', postController.getPostsByCreator);
router.get('/feed', authenticate, postController.getFeedPosts);
router.get('/me', authenticate, postController.getMyPosts);
router.get('/:id', postController.getPostById);
router.patch('/:id', authenticate, validateRequest(updatePostSchema), postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.post('/:id/unlock', authenticate, postController.unlockPremiumPost);

export default router;
