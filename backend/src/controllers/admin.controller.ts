import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  UpdateUserInput,
  UpdateProjectInput,
  UpdateTopicInput,
  UpdateCourseInput,
} from '../validators/admin.validator';

export class AdminController {
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const isBanned = req.query.banned === 'true' ? true : req.query.banned === 'false' ? false : undefined;

      const result = await adminService.getUsers(page, limit, {
        search,
        role,
        isBanned,
      });
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserById(id);
      return sendSuccess(res, user);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateUserInput;
      const user = await adminService.updateUser(id, data);
      return sendSuccess(res, user);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteUser(id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getProjects(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const isPublic = req.query.public === 'true' ? true : req.query.public === 'false' ? false : undefined;
      const isFeatured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

      const result = await adminService.getProjects(page, limit, {
        search,
        isPublic,
        isFeatured,
      });
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateProjectInput;
      const project = await adminService.updateProject(id, data);
      return sendSuccess(res, project);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteProject(id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getTopics(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const isLocked = req.query.locked === 'true' ? true : req.query.locked === 'false' ? false : undefined;
      const isPinned = req.query.pinned === 'true' ? true : req.query.pinned === 'false' ? false : undefined;

      const result = await adminService.getTopics(page, limit, {
        search,
        isLocked,
        isPinned,
      });
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateTopic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateTopicInput;
      const topic = await adminService.updateTopic(id, data);
      return sendSuccess(res, topic);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteTopic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteTopic(id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getCourses(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const isPublished = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const isFeatured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

      const result = await adminService.getCourses(page, limit, {
        search,
        isPublished,
        isFeatured,
      });
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateCourseInput;
      const course = await adminService.updateCourse(id, data);
      return sendSuccess(res, course);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteCourse(id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getStats();
      return sendSuccess(res, stats);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const adminController = new AdminController();

