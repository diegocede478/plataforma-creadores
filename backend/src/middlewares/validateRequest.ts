import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { AnyZodObject } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      next(error);
    }
  };
};
