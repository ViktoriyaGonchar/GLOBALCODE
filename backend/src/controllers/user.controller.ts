import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';
import { UpdateProfileInput } from '../validators/user.validator';

export class UserController {
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;

      const user = await userService.getUserById(id, currentUserId);
      return sendSuccess(res, user);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      
      // Пользователь может редактировать только свой профиль
      if (id !== req.user.userId) {
        return sendError(res, new Error('Нет прав для редактирования этого профиля'), 403);
      }

      const data = req.body as UpdateProfileInput;
      const user = await userService.updateProfile(id, data);
      return sendSuccess(res, user);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await userService.getUserStats(id);
      return sendSuccess(res, stats);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getBadges(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const badges = await userService.getUserBadges(id);
      return sendSuccess(res, badges);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getActivity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const activity = await userService.getUserActivity(id, limit);
      return sendSuccess(res, activity);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getProjects(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await userService.getUserProjects(id, page, limit);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async follow(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await userService.followUser(req.user.userId, id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async unfollow(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await userService.unfollowUser(req.user.userId, id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getFollowers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const followers = await userService.getFollowers(id);
      return sendSuccess(res, followers);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getFollowing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const following = await userService.getFollowing(id);
      return sendSuccess(res, following);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const userController = new UserController();

