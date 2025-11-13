import { Request, Response } from 'express';
import { teamService } from '../services/team.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  CreateTeamInput,
  UpdateTeamInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from '../validators/team.validator';

export class TeamController {
  async getTeams(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const teams = await teamService.getTeams(req.user.userId);
      return sendSuccess(res, teams);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getTeam(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const team = await teamService.getTeamById(id, req.user.userId);
      return sendSuccess(res, team);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createTeam(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const data = req.body as CreateTeamInput;
      const team = await teamService.createTeam(req.user.userId, data);
      return sendSuccess(res, team, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateTeam(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as UpdateTeamInput;
      const team = await teamService.updateTeam(id, req.user.userId, data);
      return sendSuccess(res, team);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteTeam(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await teamService.deleteTeam(id, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const members = await teamService.getMembers(id, req.user.userId);
      return sendSuccess(res, members);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as AddMemberInput;
      const member = await teamService.addMember(id, req.user.userId, data);
      return sendSuccess(res, member, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateMemberRole(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id, userId } = req.params;
      const data = req.body as UpdateMemberRoleInput;
      const member = await teamService.updateMemberRole(id, userId, req.user.userId, data);
      return sendSuccess(res, member);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id, userId } = req.params;
      const result = await teamService.removeMember(id, userId, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  // Заглушки для будущей реализации
  async getChat(req: Request, res: Response) {
    return sendError(res, new Error('Чат команды пока не реализован'), 501);
  }

  async getFiles(req: Request, res: Response) {
    return sendError(res, new Error('Файлы команды пока не реализованы'), 501);
  }

  async uploadFile(req: Request, res: Response) {
    return sendError(res, new Error('Загрузка файлов пока не реализована'), 501);
  }

  async getTasks(req: Request, res: Response) {
    return sendError(res, new Error('Задачи команды пока не реализованы'), 501);
  }

  async createTask(req: Request, res: Response) {
    return sendError(res, new Error('Создание задач пока не реализовано'), 501);
  }

  async updateTask(req: Request, res: Response) {
    return sendError(res, new Error('Обновление задач пока не реализовано'), 501);
  }

  async deleteTask(req: Request, res: Response) {
    return sendError(res, new Error('Удаление задач пока не реализовано'), 501);
  }

  async getCalendar(req: Request, res: Response) {
    return sendError(res, new Error('Календарь команды пока не реализован'), 501);
  }

  async createEvent(req: Request, res: Response) {
    return sendError(res, new Error('Создание событий пока не реализовано'), 501);
  }
}

export const teamController = new TeamController();

