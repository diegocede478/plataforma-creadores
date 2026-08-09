import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['CREATOR', 'FAN'])
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida')
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido')
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
  })
});

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.getMe);

export default router;
