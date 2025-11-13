import { Request, Response } from 'express';
import { videoService } from '../services/video.service';
import { sendSuccess, sendError } from '../utils/response';
import { CreateVideoInput, UpdateVideoInput, SaveProgressInput } from '../validators/video.validator';

export class VideoController {
  async getVideos(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const number = req.query.number ? parseInt(req.query.number as string) : undefined;

      const result = await videoService.getVideos({
        page,
        limit,
        number,
      });

      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const video = await videoService.getVideoById(id);
      return sendSuccess(res, video);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getVideoByNumber(req: Request, res: Response) {
    try {
      const { number } = req.params;
      const num = parseInt(number);
      if (isNaN(num) || num < 1 || num > 100) {
        return sendError(res, new Error('Номер должен быть от 1 до 100'), 400);
      }
      const video = await videoService.getVideoByNumber(num);
      return sendSuccess(res, video);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createVideo(req: Request, res: Response) {
    try {
      // TODO: Добавить проверку прав администратора
      const data = req.body as CreateVideoInput;
      const video = await videoService.createVideo(data);
      return sendSuccess(res, video, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateVideo(req: Request, res: Response) {
    try {
      // TODO: Добавить проверку прав администратора
      const { id } = req.params;
      const data = req.body as UpdateVideoInput;
      const video = await videoService.updateVideo(id, data);
      return sendSuccess(res, video);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteVideo(req: Request, res: Response) {
    try {
      // TODO: Добавить проверку прав администратора
      const { id } = req.params;
      const result = await videoService.deleteVideo(id);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getStream(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quality = req.query.quality as '360p' | '480p' | '720p' | '1080p' | undefined;
      const stream = await videoService.getVideoStream(id, quality);
      return sendSuccess(res, stream);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getQualities(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const qualities = await videoService.getQualities(id);
      return sendSuccess(res, qualities);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getSubtitles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const video = await videoService.getVideoById(id);
      return sendSuccess(res, { subtitles: video.subtitles || null });
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async saveProgress(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as SaveProgressInput;
      const result = await videoService.saveProgress(id, req.user.userId, data);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getProgress(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const progress = await videoService.getProgress(id, req.user.userId);
      return sendSuccess(res, progress);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getPlaylist(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const playlist = await videoService.getUserPlaylist(req.user.userId);
      return sendSuccess(res, playlist);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async addToPlaylist(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await videoService.addToPlaylist(id, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const videoController = new VideoController();

