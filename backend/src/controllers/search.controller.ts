import { Request, Response } from 'express';
import { searchService } from '../services/search.service';
import { sendSuccess, sendError } from '../utils/response';

export class SearchController {
  async globalSearch(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length < 2) {
        return sendSuccess(res, []);
      }

      const results = await searchService.globalSearch(query.trim(), limit);
      return sendSuccess(res, results);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async searchProjects(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length < 2) {
        return sendSuccess(res, { projects: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }

      const result = await searchService.searchProjects(query.trim(), page, limit);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async searchForum(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length < 2) {
        return sendSuccess(res, { topics: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }

      const result = await searchService.searchForum(query.trim(), page, limit);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length < 2) {
        return sendSuccess(res, { users: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }

      const result = await searchService.searchUsers(query.trim(), page, limit);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async searchCourses(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length < 2) {
        return sendSuccess(res, { courses: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }

      const result = await searchService.searchCourses(query.trim(), page, limit);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const searchController = new SearchController();

