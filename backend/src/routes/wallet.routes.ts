import { Router } from 'express';
import { z } from 'zod';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const moneySchema = z.object({
  body: z.object({
    amount: z.number().positive('El monto debe ser mayor a 0')
  })
});

router.get('/', authenticate, walletController.getWallet);
router.get('/transactions', authenticate, walletController.getTransactions);
router.post('/deposit', authenticate, validateRequest(moneySchema), walletController.deposit);
router.post('/withdraw', authenticate, validateRequest(moneySchema), walletController.withdraw);

export default router;
