import { Router } from 'express';
import { z } from 'zod';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, 'El destinatario es requerido'),
    content: z.string().min(1, 'El mensaje es requerido').max(2000)
  })
});

const sendPaidMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, 'El destinatario es requerido'),
    content: z.string().min(1, 'El mensaje es requerido').max(2000),
    price: z.number().positive('El precio debe ser mayor a 0')
  })
});

router.get('/conversations', authenticate, messageController.getConversations);
router.get('/unread', authenticate, messageController.getUnreadCount);
router.get('/:userId', authenticate, messageController.getConversation);
router.post('/', authenticate, validateRequest(sendMessageSchema), messageController.sendMessage);
router.post('/paid', authenticate, validateRequest(sendPaidMessageSchema), messageController.sendPaidMessage);
router.post('/:id/unlock', authenticate, messageController.unlockMessage);

export default router;
