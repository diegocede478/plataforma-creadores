import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error.message);

  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
