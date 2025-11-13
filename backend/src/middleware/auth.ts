import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { sendError } from '../utils/response';

// Расширяем тип Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Токен доступа не предоставлен');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      sendError(res, error);
    } else {
      sendError(res, new AuthenticationError('Недействительный токен'));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, new AuthenticationError('Требуется аутентификация'));
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      sendError(res, new AuthorizationError('Недостаточно прав доступа'));
      return;
    }

    next();
  };
};

export const authenticateSocket = async (socket: any): Promise<{ userId: string; role: string } | null> => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const payload = verifyAccessToken(token);
    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
};

