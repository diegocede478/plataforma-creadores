import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/my/subscriptions', authenticate, subscriptionController.getMySubscriptions);
router.get('/my/subscribers', authenticate, subscriptionController.getMySubscribers);
router.get('/status/:creatorId', authenticate, subscriptionController.getSubscriptionStatus);
router.post('/:creatorId', authenticate, subscriptionController.subscribeToCreator);
router.delete('/:creatorId', authenticate, subscriptionController.cancelSubscription);

export default router;
