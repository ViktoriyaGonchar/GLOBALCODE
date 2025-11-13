import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getNotifications(
        req.user.userId,
        page,
        limit
      );
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getUnreadNotifications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const notifications = await notificationService.getUnreadNotifications(
        req.user.userId
      );
      return sendSuccess(res, notifications);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const result = await notificationService.getUnreadCount(req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const notification = await notificationService.markAsRead(
        id,
        req.user.userId
      );
      return sendSuccess(res, notification);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const result = await notificationService.markAllAsRead(req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await notificationService.deleteNotification(
        id,
        req.user.userId
      );
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const notificationController = new NotificationController();

