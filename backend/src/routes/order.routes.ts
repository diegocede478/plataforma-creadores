import { Router } from 'express';
import { z } from 'zod';
import * as orderController from '../controllers/order.controller';
import { authenticate, requireCreator } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  })
});

router.get('/my/orders', authenticate, orderController.getMyOrders);
router.get('/my/sales', authenticate, requireCreator, orderController.getMySales);
router.post('/:serviceId', authenticate, orderController.createOrder);
router.patch('/:id/status', authenticate, requireCreator, validateRequest(updateStatusSchema), orderController.updateOrderStatus);

export default router;
