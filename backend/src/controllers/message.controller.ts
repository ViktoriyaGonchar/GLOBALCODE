import { Request, Response } from 'express';
import { messageService } from '../services/message.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  CreateConversationInput,
  CreateMessageInput,
  UpdateMessageInput,
} from '../validators/message.validator';

export class MessageController {
  async getConversations(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const conversations = await messageService.getConversations(req.user.userId);
      return sendSuccess(res, conversations);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getConversation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const conversation = await messageService.getConversationById(
        id,
        req.user.userId
      );
      return sendSuccess(res, conversation);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createConversation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const data = req.body as CreateConversationInput;
      const conversation = await messageService.createConversation(
        req.user.userId,
        data
      );
      return sendSuccess(res, conversation, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await messageService.getMessages(
        id,
        req.user.userId,
        page,
        limit
      );
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as CreateMessageInput;
      const message = await messageService.createMessage(
        id,
        req.user.userId,
        data
      );
      return sendSuccess(res, message, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as UpdateMessageInput;
      const message = await messageService.updateMessage(
        id,
        req.user.userId,
        data
      );
      return sendSuccess(res, message);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await messageService.deleteMessage(id, req.user.userId);
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
      const result = await messageService.markAsRead(id, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const result = await messageService.getUnreadCount(req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const messageController = new MessageController();

