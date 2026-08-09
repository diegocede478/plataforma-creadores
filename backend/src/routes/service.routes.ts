import { Router } from 'express';
import { z } from 'zod';
import * as serviceController from '../controllers/service.controller';
import { authenticate, requireCreator } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(2000),
    price: z.number().positive('El precio debe ser mayor a 0'),
    deliveryDays: z.number().int().min(1, 'Los días de entrega deben ser al menos 1').max(60)
  })
});

const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    price: z.number().positive().optional(),
    deliveryDays: z.number().int().min(1).max(60).optional(),
    status: z.enum(['ACTIVE', 'PAUSED']).optional()
  })
});

router.post('/', authenticate, requireCreator, validateRequest(createServiceSchema), serviceController.createService);
router.get('/my', authenticate, serviceController.getMyServices);
router.get('/creator/:creatorId', serviceController.getServicesByCreator);
router.get('/:id', serviceController.getServiceById);
router.patch('/:id', authenticate, validateRequest(updateServiceSchema), serviceController.updateService);
router.delete('/:id', authenticate, serviceController.deleteService);

export default router;
