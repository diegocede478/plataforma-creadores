import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { generateTokens } from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, role } = req.body;

    const result = await authService.registerUser(email, username, password, role);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      ...result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al registrar usuario';
    res.status(400).json({ error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json({
      message: 'Login exitoso',
      ...result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
    res.status(401).json({ error: message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT es stateless: el token no se invalida en servidor (requeriría una
  // blacklist). El logout correcto consiste en que el cliente descarte sus
  // tokens; este endpoint existe para que la llamada sea consistente.
  res.json({ message: 'Sesión cerrada correctamente' });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cambiar contraseña';
    res.status(400).json({ error: message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshTokens(refreshToken);

    res.json(tokens);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al renovar sesión';
    res.status(401).json({ error: message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const user = await authService.getMe(userId);

    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener usuario';
    res.status(400).json({ error: message });
  }
};

export const googleAuth = (_req: Request, _res: Response): void => {
  // Este endpoint redirige a Google OAuth
  // Passport manejará la redirección automáticamente
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user viene de passport.deserializeUser
    const user = req.user as any;

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    // Redirigir al frontend con tokens en query params (o usar cookies)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;

    res.redirect(redirectUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en autenticación Google';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
  }
};

export const googleAuthUrl = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { getGoogleAuthUrl } = await import('../services/oauth.service');
    const url = getGoogleAuthUrl();

    if (!url) {
      res.status(503).json({ error: 'Google OAuth no configurado' });
      return;
    }

    res.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al generar URL de Google';
    res.status(500).json({ error: message });
  }
};
