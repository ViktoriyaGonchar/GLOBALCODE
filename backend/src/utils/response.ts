import { Response } from 'express';
import { AppError } from './errors';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
  } as ApiResponse<T>);
};

export const sendError = (
  res: Response,
  error: Error | AppError,
  statusCode?: number
): Response => {
  if (error instanceof AppError) {
    return res.status(statusCode || error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    } as ApiResponse);
  }

  return res.status(statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  } as ApiResponse);
};

