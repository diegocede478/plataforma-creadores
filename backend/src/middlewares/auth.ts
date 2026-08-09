import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    // Extend the passport User interface with our JWT payload
    interface User extends JwtPayload {}
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autenticación requerido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireCreator = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'CREATOR') {
    res.status(403).json({ error: 'Acceso solo para creadores' });
    return;
  }
  next();
};

export const requireFan = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'FAN') {
    res.status(403).json({ error: 'Acceso solo para fans' });
    return;
  }
  next();
};
