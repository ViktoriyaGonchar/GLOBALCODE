import { Request, Response } from 'express';
import { forumService } from '../services/forum.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  CreateTopicInput,
  UpdateTopicInput,
  CreatePostInput,
  UpdatePostInput,
  ReportPostInput,
} from '../validators/forum.validator';

export class ForumController {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await forumService.getCategories();
      return sendSuccess(res, categories);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getTopics(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const categoryId = req.query.category as string;
      const search = req.query.search as string;
      const isPinned = req.query.pinned === 'true' ? true : undefined;

      const result = await forumService.getTopics({
        page,
        limit,
        categoryId,
        search,
        isPinned,
      });

      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getTopic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const topic = await forumService.getTopicById(id);
      return sendSuccess(res, topic);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createTopic(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const data = req.body as CreateTopicInput;
      const topic = await forumService.createTopic(req.user.userId, data);
      return sendSuccess(res, topic, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateTopic(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as UpdateTopicInput;
      const topic = await forumService.updateTopic(id, req.user.userId, data);
      return sendSuccess(res, topic);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteTopic(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await forumService.deleteTopic(id, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await forumService.getPosts(id, page, limit);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as CreatePostInput;
      const post = await forumService.createPost(id, req.user.userId, data);
      return sendSuccess(res, post, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as UpdatePostInput;
      const post = await forumService.updatePost(id, req.user.userId, data);
      return sendSuccess(res, post);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await forumService.deletePost(id, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async likePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const post = await forumService.likePost(id, req.user.userId);
      return sendSuccess(res, post);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async attachProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const { projectId } = req.body;

      if (!projectId) {
        return sendError(res, new Error('projectId обязателен'), 400);
      }

      const result = await forumService.attachProject(id, projectId, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getAttachedProjects(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const projects = await forumService.getAttachedProjects(id);
      return sendSuccess(res, projects);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async reportPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      // TODO: Реализовать систему жалоб
      return sendError(res, new Error('Система жалоб пока не реализована'), 501);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const forumController = new ForumController();

