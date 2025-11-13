import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error.errors) {
        const validationError = new ValidationError(
          'Ошибка валидации',
          error.errors.reduce((acc: any, err: any) => {
            const path = err.path.join('.');
            if (!acc[path]) {
              acc[path] = [];
            }
            acc[path].push(err.message);
            return acc;
          }, {})
        );
        return sendError(res, validationError);
      }
      return sendError(res, error as Error, 400);
    }
  };
};

