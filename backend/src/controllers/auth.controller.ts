import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  RefreshTokenInput,
} from '../validators/auth.validator';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = req.body as RegisterInput;
      const result = await authService.register(data);
      return sendSuccess(res, result, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = req.body as LoginInput;
      const result = await authService.login(data);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Пользователь не аутентифицирован'), 401);
      }
      const user = await authService.getCurrentUser(req.user.userId);
      return sendSuccess(res, user);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const result = await authService.refreshToken(refreshToken);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async logout(req: Request, res: Response) {
    // В production здесь можно добавить логику инвалидации токенов
    return sendSuccess(res, { message: 'Выход выполнен успешно' });
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const data = req.body as ForgotPasswordInput;
      const result = await authService.forgotPassword(data);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const data = req.body as ResetPasswordInput;
      const result = await authService.resetPassword(data);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body as VerifyEmailInput;
      const result = await authService.verifyEmail(token);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const authController = new AuthController();

