import { Router } from 'express';
import { z } from 'zod';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(500).optional()
  })
});

const searchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    role: z.enum(['creator', 'fan', 'CREATOR', 'FAN']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
    sort: z.enum(['subscribers', 'recent']).optional()
  })
});

router.get('/search', validateRequest(searchSchema), userController.searchUsers);
router.get('/me/stats', authenticate, userController.getMyStats);
router.patch('/me', authenticate, validateRequest(updateProfileSchema), userController.updateProfile);
router.get('/:username', userController.getUserProfile);

export default router;
