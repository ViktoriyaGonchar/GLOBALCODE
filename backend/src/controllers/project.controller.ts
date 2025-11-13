import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  CreateProjectInput,
  UpdateProjectInput,
  CreateVersionInput,
} from '../validators/project.validator';

export class ProjectController {
  async getProjects(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const tags = req.query.tags
        ? (req.query.tags as string).split(',')
        : undefined;
      const authorId = req.query.author as string;
      const isPublic = req.query.public !== undefined
        ? req.query.public === 'true'
        : undefined;

      const result = await projectService.getProjects({
        page,
        limit,
        search,
        tags,
        authorId,
        isPublic,
      });

      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const project = await projectService.getProjectById(id, userId);
      return sendSuccess(res, project);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const data = req.body as CreateProjectInput;
      const project = await projectService.createProject(req.user.userId, data);
      return sendSuccess(res, project, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as UpdateProjectInput;
      const project = await projectService.updateProject(
        id,
        req.user.userId,
        data
      );
      return sendSuccess(res, project);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await projectService.deleteProject(id, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createVersion(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as CreateVersionInput;
      const version = await projectService.createVersion(
        id,
        req.user.userId,
        data
      );
      return sendSuccess(res, version, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getVersions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const versions = await projectService.getVersions(id);
      return sendSuccess(res, versions);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async starProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const project = await projectService.starProject(id, req.user.userId);
      return sendSuccess(res, project);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async unstarProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const project = await projectService.unstarProject(id, req.user.userId);
      return sendSuccess(res, project);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await projectService.getProjectStats(id);
      return sendSuccess(res, stats);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  // Заглушки для будущей реализации
  async uploadFiles(req: Request, res: Response) {
    return sendError(
      res,
      new Error('Загрузка файлов пока не реализована'),
      501
    );
  }

  async getFiles(req: Request, res: Response) {
    return sendError(res, new Error('Получение файлов пока не реализовано'), 501);
  }

  async getFile(req: Request, res: Response) {
    return sendError(res, new Error('Получение файла пока не реализовано'), 501);
  }

  async getPreview(req: Request, res: Response) {
    return sendError(res, new Error('Превью пока не реализовано'), 501);
  }

  async runDemo(req: Request, res: Response) {
    return sendError(res, new Error('Запуск демо пока не реализован'), 501);
  }

  async updateAccess(req: Request, res: Response) {
    return sendError(res, new Error('Управление доступом пока не реализовано'), 501);
  }

  async inviteUser(req: Request, res: Response) {
    return sendError(res, new Error('Приглашение пользователей пока не реализовано'), 501);
  }

  async importFromGit(req: Request, res: Response) {
    return sendError(res, new Error('Импорт из Git пока не реализован'), 501);
  }
}

export const projectController = new ProjectController();

