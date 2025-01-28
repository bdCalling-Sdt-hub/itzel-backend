import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

const validateRequestZFD =
  (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequestZFD;
